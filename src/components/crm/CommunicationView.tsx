import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, Phone, CheckCircle2, Clock, 
  Smartphone, Plus, Forward, Search, Filter, Radio, 
  Copy, Check, ExternalLink, RefreshCw, AlertTriangle, 
  Share2, ArrowRight, UserCheck 
} from 'lucide-react';
import { CommunicationLog } from '../../types/models';
import { customerService, cleanPhoneNumber } from '../../services/customerService';
import DirectMessageModal from './DirectMessageModal';

export default function CommunicationView() {
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<'All' | 'WhatsApp' | 'SMS' | 'Broadcast'>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [forwardLog, setForwardLog] = useState<CommunicationLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setLogs(customerService.getCommLogs());
    const unsub = customerService.subscribe(() => {
      setLogs([...customerService.getCommLogs()]);
    });
    return () => unsub();
  }, []);

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

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setForwardLog(null);
              setShowDirectModal(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition"
            id="open-message-composer-btn"
          >
            <Send size={15} />
            <span>Compose Message / Notice</span>
          </button>
        </div>
      </div>

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
