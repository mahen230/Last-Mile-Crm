import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, Phone, CheckCircle2, Clock, 
  Smartphone, Plus, Forward, Search, Filter, Radio, 
  Copy, Check, ExternalLink, RefreshCw, AlertTriangle, 
  Share2, ArrowRight, UserCheck 
} from 'lucide-react';
import { CommunicationLog, Customer } from '../../types/models';
import { customerService, cleanPhoneNumber } from '../../services/customerService';
import { staffPermissionService } from '../../services/staffPermissionService';
import { useAuth } from '../auth/FirebaseAuthProvider';
import DirectMessageModal from './DirectMessageModal';

export default function CommunicationView() {
  const { userProfile } = useAuth();
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [scopedCustomers, setScopedCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<'All' | 'WhatsApp' | 'SMS' | 'Broadcast'>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [showBroadcastPanel, setShowBroadcastPanel] = useState(true);
  const [forwardLog, setForwardLog] = useState<CommunicationLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [broadcastBanner, setBroadcastBanner] = useState<string | null>(null);

  const isSuperAdmin = staffPermissionService.isSuperAdmin(userProfile);
  const defaultStaffBeat =
    userProfile?.beat && userProfile.beat !== 'All Beats'
      ? userProfile.beat.replace(/^Beat\s*/i, '').trim()
      : 'All';

  // Bulk Broadcast Filter & Template State
  const [bcBeatFilter, setBcBeatFilter] = useState<string>(isSuperAdmin ? 'All' : defaultStaffBeat);
  const [bcCategoryFilter, setBcCategoryFilter] = useState<string>('ALL_CITIZENS');
  const [bcChannel, setBcChannel] = useState<'Broadcast' | 'WhatsApp' | 'SMS'>('Broadcast');
  const [bcTitle, setBcTitle] = useState<string>('Doorstep Sukanya (8.2%), PLI & Aadhaar Camp Update');
  const [bcMessage, setBcMessage] = useState<string>(
    '🇮🇳 भारतीय डाक (Dadabari S.O. Kota - 324009): नमस्ते {name}, आपके क्षेत्र (Beat {beat}, मकान {house}) में सुकन्या समृद्धि (8.2%), PLI जीवन बीमा, वरिष्ठ नागरिक बचत (SCSS) एवं डोरस्टेप आधार मोबाइल अपडेशन सुविधा उपलब्ध है। संपर्क: बीट डाकिया।'
  );

  useEffect(() => {
    const syncCommData = () => {
      const currentProfile = staffPermissionService.getActiveSession() || userProfile;
      const allLogs = customerService.getCommLogs();
      setLogs(
        allLogs.filter((l) =>
          staffPermissionService.matchesUserBeatScope(currentProfile, {
            beatNo: l.beatNo === 'All' ? undefined : l.beatNo,
          })
        )
      );
      setScopedCustomers(
        customerService
          .getCustomers()
          .filter((c) => staffPermissionService.matchesUserBeatScope(currentProfile, c))
      );
    };
    syncCommData();
    const unsub = customerService.subscribe(syncCommData);
    const unsubStaff = staffPermissionService.subscribe(syncCommData);
    return () => {
      unsub();
      unsubStaff();
    };
  }, [userProfile]);

  const broadcastRecipients = scopedCustomers.filter((c) => {
    const matchBeat =
      bcBeatFilter === 'All' ||
      String(c.beatNo || '2').replace(/^Beat\s*/i, '').trim() === bcBeatFilter;
    if (!matchBeat) return false;

    const interestAndNotes = `${c.financialInterest || ''} ${c.remarks || ''} ${(c.products || [])
      .map((p) => p.productName)
      .join(' ')}`.toLowerCase();

    if (bcCategoryFilter === 'SSA_PROSPECTS') {
      return interestAndNotes.includes('ssa') || interestAndNotes.includes('sukanya') || !c.financialInterest;
    }
    if (bcCategoryFilter === 'PLI_RPLI') {
      return interestAndNotes.includes('pli') || interestAndNotes.includes('insurance') || interestAndNotes.includes('suraksha');
    }
    if (bcCategoryFilter === 'SENIOR_SCSS_MIS') {
      return interestAndNotes.includes('scss') || interestAndNotes.includes('mis') || interestAndNotes.includes('senior') || (c.age && c.age >= 55);
    }
    if (bcCategoryFilter === 'IPPB_AADHAAR') {
      return interestAndNotes.includes('ippb') || interestAndNotes.includes('aadhaar') || interestAndNotes.includes('celc');
    }
    if (bcCategoryFilter === 'SHIFTED_RELOCATED') {
      return Boolean(c.isShifted || (c.relocationHistory && c.relocationHistory.length > 0) || interestAndNotes.includes('shifted') || interestAndNotes.includes('left'));
    }
    return true;
  });

  const handleDispatchBulkBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcMessage.trim() || broadcastRecipients.length === 0) return;

    customerService.dispatchBulkBroadcast({
      beatFilter: bcBeatFilter,
      categoryFilter: bcCategoryFilter,
      channel: bcChannel,
      campaignTitle: bcTitle,
      messageTemplate: bcMessage,
      recipients: broadcastRecipients,
      dispatchedBy: userProfile?.name || 'Mahendra Kumar Meena',
    });

    setBroadcastBanner(
      `Bulk Broadcast Dispatched: "${bcTitle}" logged & queued for ${broadcastRecipients.length} citizens in ${
        bcBeatFilter === 'All' ? 'All Allowed Beats' : `Beat ${bcBeatFilter}`
      }!`
    );
    setTimeout(() => setBroadcastBanner(null), 4500);
  };

  const handleExportBroadcastCSV = () => {
    const headers = ['Master ID', 'Customer Name', 'Mobile', 'Beat No', 'House No', 'Sector/Colony', 'Personalized Message'];
    const rows = broadcastRecipients.map((c) => {
      const msg = bcMessage
        .replace(/\{name\}/gi, c.name)
        .replace(/\{beat\}/gi, c.beatNo || '2')
        .replace(/\{house\}/gi, c.houseNo || c.address?.houseNumber || '');
      return [
        c.masterId || c.id,
        `"${(c.name || '').replace(/"/g, '""')}"`,
        c.whatsapp || c.mobile || '',
        c.beatNo || '2',
        `"${(c.houseNo || '').replace(/"/g, '""')}"`,
        `"${(c.sector || c.area || '').replace(/"/g, '""')}"`,
        `"${msg.replace(/"/g, '""')}"`,
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `POSTMAN_BULK_BROADCAST_BEAT_${bcBeatFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      log.mobile.includes(search) ||
      log.content.toLowerCase().includes(search.toLowerCase()) ||
      log.type.toLowerCase().includes(search.toLowerCase());

    const matchesChannel = channelFilter === 'All' || log.channel === channelFilter;
    const matchesType = typeFilter === 'All' || log.type === typeFilter;

    return matchesSearch && matchesChannel && matchesType;
  });

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickResend = (log: CommunicationLog) => {
    const cleanPhone = cleanPhoneNumber(log.mobile);
    if (log.channel === 'WhatsApp' || log.channel === 'Broadcast') {
      const url = cleanPhone 
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(log.content)}`
        : `https://wa.me/?text=${encodeURIComponent(log.content)}`;
      window.open(url, '_blank');
    } else {
      const smsUrl = cleanPhone 
        ? `sms:${cleanPhone}?body=${encodeURIComponent(log.content)}`
        : `sms:?body=${encodeURIComponent(log.content)}`;
      window.location.href = smsUrl;
    }
  };

  const uniqueTypes = Array.from(new Set(logs.map(l => l.type).filter(Boolean)));

  return (
    <div className="space-y-6" id="communication-view-root">
      {/* Top Banner & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <MessageSquare size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Direct Messaging & Communication Hub
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official India Post multi-channel messaging (WhatsApp & SMS), instant parcel alerts, and broadcast notices
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowBroadcastPanel(!showBroadcastPanel)}
            className="px-4 py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Radio size={15} />
            <span>{showBroadcastPanel ? 'Hide Bulk Broadcast Utility' : 'Beat & Category Bulk Broadcast'}</span>
          </button>
          <button
            onClick={() => {
              setForwardLog(null);
              setShowDirectModal(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
            id="open-message-composer-btn"
          >
            <Send size={15} />
            <span>1-to-1 Message / Notice</span>
          </button>
        </div>
      </div>

      {broadcastBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
            <span>{broadcastBanner}</span>
          </div>
          <button onClick={() => setBroadcastBanner(null)} className="text-emerald-800 font-bold">✕</button>
        </div>
      )}

      {/* Targeted Beat-Wise & Category-Wise Bulk Broadcast Utility */}
      {showBroadcastPanel && (
        <form
          onSubmit={handleDispatchBulkBroadcast}
          className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs"
          id="bulk-broadcast-utility"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <div className="text-xs font-bold text-red-800 uppercase tracking-wide">
                Targeted Bulk Broadcast Engine · Beat-Wise & Category-Wise Dispatch
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Filter Citizens by Delivery Beat or Scheme Category & Dispatch Official Service Updates
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Matched Target Recipients</span>
              <span className="text-lg font-black text-emerald-700 font-mono tabular-nums">
                {broadcastRecipients.length} Citizens
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                1. Filter by Beat Scope {!isSuperAdmin && <span className="text-red-700">(Beat Locked)</span>}
              </label>
              <select
                value={bcBeatFilter}
                disabled={!isSuperAdmin}
                onChange={(e) => setBcBeatFilter(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 disabled:opacity-80"
              >
                {isSuperAdmin && <option value="All">All Beats (Global Master Admin)</option>}
                {Array.from({ length: 33 }, (_, i) => String(i + 1)).map((b) => (
                  <option key={b} value={b}>
                    Beat {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                2. Filter by Service / Scheme Category
              </label>
              <select
                value={bcCategoryFilter}
                onChange={(e) => {
                  const cat = e.target.value;
                  setBcCategoryFilter(cat);
                  if (cat === 'SSA_PROSPECTS') {
                    setBcTitle('Sukanya Samriddhi (SSA - 8.2%) Doorstep Camp');
                    setBcMessage(
                      '🌸 भारतीय डाक (Dadabari S.O.): नमस्ते {name}, अपनी बिटिया के उज्ज्वल भविष्य हेतु 8.2% टैक्स-फ्री सुकन्या समृद्धि खाता (SSA) घर बैठे खोलें। बीट {beat} डाकिया मकान {house} पर सेवा हेतु उपलब्ध है।'
                    );
                  } else if (cat === 'PLI_RPLI') {
                    setBcTitle('PLI / RPLI High-Bonus Insurance Notice');
                    setBcMessage(
                      '🛡️ डाक जीवन बीमा (PLI/RPLI): नमस्ते {name}, भारत सरकार की सर्वाधिक बोनस (₹76/हजार) वाली जीवन बीमा पॉलिसी एवं प्रीमियम सेवा आपके बीट {beat} में उपलब्ध है।'
                    );
                  } else if (cat === 'SENIOR_SCSS_MIS') {
                    setBcTitle('Senior Citizen (SCSS 8.2%) & Monthly Income (MIS) Update');
                    setBcMessage(
                      '💰 वरिष्ठ नागरिक बचत योजना (SCSS 8.2%): नमस्ते {name}, डाकघर की सुरक्षित तिमाही पेंशन एवं मासिक आय योजना (MIS 7.4%) की जानकारी हेतु बीट {beat} डाकिया से संपर्क करें।'
                    );
                  } else if (cat === 'IPPB_AADHAAR') {
                    setBcTitle('IPPB Doorstep Banking & Aadhaar CELC Mobile Update');
                    setBcMessage(
                      '🆔 डोरस्टेप आधार एवं IPPB बैंकिंग: नमस्ते {name}, आपके क्षेत्र (Beat {beat}) में आधार मोबाइल लिंकिंग, 0-5 वर्ष बाल आधार (CELC) एवं AePS नकद निकासी उपलब्ध है।'
                    );
                  } else if (cat === 'SHIFTED_RELOCATED') {
                    setBcTitle('Address Verification & Mail Redirection Confirmation');
                    setBcMessage(
                      '📬 डाक पता सत्यापन (Dadabari S.O.): नमस्ते {name}, आपके नवीन पते ({house}, Beat {beat}) पर डाक एवं पासबुक वितरण निर्बाध रूप से सक्रिय कर दिया गया है।'
                    );
                  }
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
              >
                <option value="ALL_CITIZENS">All Verified Citizens in Beat</option>
                <option value="SSA_PROSPECTS">Sukanya Samriddhi (SSY / SSA) Families</option>
                <option value="PLI_RPLI">PLI / RPLI Insurance Prospects & Policyholders</option>
                <option value="SENIOR_SCSS_MIS">Senior Citizens (SCSS 8.2% / POMIS)</option>
                <option value="IPPB_AADHAAR">IPPB Banking & Doorstep Aadhaar / CELC</option>
                <option value="SHIFTED_RELOCATED">Shifted / Relocated Households</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">3. Dispatch Channel</label>
              <select
                value={bcChannel}
                onChange={(e) => setBcChannel(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
              >
                <option value="Broadcast">WhatsApp + Broadcast Notice</option>
                <option value="WhatsApp">WhatsApp Direct Batch</option>
                <option value="SMS">SMS Gateway Batch</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">4. Campaign / Notice Title</label>
              <input
                type="text"
                value={bcTitle}
                onChange={(e) => setBcTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">
                Broadcast Message Template (Supports <span className="font-mono text-red-700">{'{name}'}</span>,{' '}
                <span className="font-mono text-red-700">{'{beat}'}</span>,{' '}
                <span className="font-mono text-red-700">{'{house}'}</span> tags)
              </label>
              <span className="text-[11px] text-slate-500">
                Previewing top {Math.min(5, broadcastRecipients.length)} of {broadcastRecipients.length} recipients
              </span>
            </div>
            <textarea
              rows={3}
              value={bcMessage}
              onChange={(e) => setBcMessage(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <div className="text-xs text-slate-500">
              Sample Recipients:{' '}
              <span className="font-semibold text-slate-800">
                {broadcastRecipients
                  .slice(0, 4)
                  .map((r) => `${r.name} (B-${r.beatNo || '2'})`)
                  .join(', ') || 'None matching filter'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportBroadcastCSV}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Export Broadcast List (CSV)
              </button>
              <button
                type="submit"
                disabled={broadcastRecipients.length === 0}
                className="px-5 py-2 bg-red-800 hover:bg-red-900 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Send size={14} />
                <span>Dispatch Bulk Broadcast ({broadcastRecipients.length} Citizens)</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Dispatches</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{logs.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-emerald-600 font-semibold">WhatsApp Messages</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {logs.filter(l => l.channel === 'WhatsApp').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-blue-600 font-semibold">SMS Dispatches</span>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {logs.filter(l => l.channel === 'SMS').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-purple-600 font-semibold">Beat Broadcasts</span>
          <div className="text-2xl font-black text-purple-700 mt-1">
            {logs.filter(l => l.channel === 'Broadcast').length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search communication logs by recipient, mobile, purpose, or text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Channels</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="SMS">SMS</option>
            <option value="Broadcast">Broadcast</option>
          </select>

          {uniqueTypes.length > 0 && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {uniqueTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Message History / Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="text-[11px] text-slate-600 uppercase bg-slate-100/80 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Dispatch ID</th>
                <th className="px-4 py-3">Recipient Details</th>
                <th className="px-4 py-3">Channel & Beat</th>
                <th className="px-4 py-3">Purpose / Category</th>
                <th className="px-4 py-3">Message Content</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {log.id}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{log.recipientName}</div>
                      <div className="font-mono text-[11px] text-slate-500">{log.mobile}</div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                          log.channel === 'WhatsApp' ? 'bg-emerald-100 text-emerald-800' :
                          log.channel === 'SMS' ? 'bg-blue-100 text-blue-800' :
                          log.channel === 'Broadcast' ? 'bg-purple-100 text-purple-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {log.channel}
                        </span>
                        {log.beatNo && (
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            B-{log.beatNo}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                      {log.type}
                    </td>

                    <td className="px-4 py-3 text-slate-700 max-w-sm">
                      <div className="line-clamp-2 leading-relaxed">{log.content}</div>
                    </td>

                    <td className="px-4 py-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 font-bold rounded text-[11px] ${
                        log.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                        log.status === 'Sent' ? 'bg-blue-50 text-blue-700' :
                        log.status === 'Forwarded' ? 'bg-purple-50 text-purple-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        ✓ {log.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Copy Message */}
                        <button
                          onClick={() => handleCopyText(log.id, log.content)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          title="Copy message content"
                        >
                          {copiedId === log.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        </button>

                        {/* Forward Message */}
                        <button
                          onClick={() => {
                            setForwardLog(log);
                            setShowDirectModal(true);
                          }}
                          className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition"
                          title="Forward this message to another customer or postman"
                        >
                          <Forward size={13} />
                        </button>

                        {/* Quick Resend */}
                        <button
                          onClick={() => handleQuickResend(log)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition"
                          title="Re-open in WhatsApp or SMS"
                        >
                          <ExternalLink size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No communication records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Message & Forwarding Modal */}
      {showDirectModal && (
        <DirectMessageModal
          isOpen={showDirectModal}
          onClose={() => {
            setShowDirectModal(false);
            setForwardLog(null);
          }}
          initialMessage={forwardLog ? forwardLog.content : ''}
          initialCustomer={forwardLog?.customerId ? customerService.getCustomerById(forwardLog.customerId) || null : null}
        />
      )}
    </div>
  );
}
