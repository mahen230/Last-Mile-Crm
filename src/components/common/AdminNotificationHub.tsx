import React, { useState, useEffect } from 'react';
import { Bell, Send, ShieldAlert, CheckCircle2, Megaphone, Trash2, X, AlertTriangle } from 'lucide-react';
import { notificationService, SystemNotification } from '../../services/notificationService';
import { useAuth } from '../auth/FirebaseAuthProvider';

export function AdminNotificationHub() {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<SystemNotification['category']>('CIRCULAR');
  const [priority, setPriority] = useState<SystemNotification['priority']>('High');
  const [targetBeat, setTargetBeat] = useState('ALL');
  const [toast, setToast] = useState<string | null>(null);

  const loadNotifs = () => {
    setNotifications(notificationService.getNotifications());
  };

  useEffect(() => {
    loadNotifs();
    const unsub = notificationService.subscribe(loadNotifs);
    return () => unsub();
  }, []);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    notificationService.broadcastNotification({
      title: title.trim(),
      message: message.trim(),
      senderName: userProfile?.name || 'Ekta Meena (Super Admin)',
      senderEmail: userProfile?.email || 'ektamahenmeena@gmail.com',
      category,
      priority,
      targetBeat,
    });

    setTitle('');
    setMessage('');
    setToast('✅ Push notification successfully broadcasted to Dadabari S.O. staff!');
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 mb-1">
            <Megaphone size={14} /> Dadabari S.O. Admin Push Broadcasts
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Staff Notification & Alert Hub
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast circulars, urgent beat alerts, or inspection notices instantly to all 34 staff member terminals.
          </p>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl text-xs font-bold flex items-center justify-between">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="text-emerald-800 hover:text-emerald-950">✕</button>
        </div>
      )}

      {/* Broadcast Form */}
      <form onSubmit={handleBroadcast} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Send size={16} className="text-red-700" />
          <span>Compose New Staff Broadcast</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Category Type</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
            >
              <option value="CIRCULAR">Official Circular</option>
              <option value="URGENT_BEAT_ALERT">Urgent Beat Alert</option>
              <option value="INSPECTION_NOTICE">Inspection Notice</option>
              <option value="GENERAL">General Notice</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Priority Level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
            >
              <option value="High">High Priority</option>
              <option value="Urgent">Urgent / Immediate</option>
              <option value="Normal">Normal</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Scope</label>
            <select
              value={targetBeat}
              onChange={(e) => setTargetBeat(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
            >
              <option value="ALL">All Beats & Staff (Dadabari S.O.)</option>
              <option value="Beat 1">Beat 1 Only</option>
              <option value="Beat 2">Beat 2 Only</option>
              <option value="Beat 17">Beat 17 Only</option>
              <option value="Beat 33">Beat 33 Only</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Notification Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. October 2026 Fuel Bill Counter-Signature Deadline..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Message / Instructions</label>
          <textarea
            required
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter full circular text or instructions for staff..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Send size={14} />
            <span>Broadcast Push Notification</span>
          </button>
        </div>
      </form>

      {/* Broadcast History */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-900">Broadcast History ({notifications.length})</h3>
        <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
          {notifications.map((n) => (
            <div key={n.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-100 text-red-800">
                    {n.category.replace(/_/g, ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${n.priority === 'Urgent' ? 'bg-red-600 text-white' : 'bg-amber-100 text-amber-900'}`}>
                    {n.priority}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(n.timestamp).toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    notificationService.deleteNotification(n.id);
                    loadNotifs();
                  }}
                  className="p-1 rounded text-slate-400 hover:text-red-600 cursor-pointer"
                  title="Delete Notice"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <h4 className="text-sm font-black text-slate-900">{n.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
              <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                <span>Sender: <strong>{n.senderName}</strong></span>
                <span>Target: <strong>{n.targetBeat}</strong> · Read by {n.readBy.length} staff</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NotificationBellDropdown() {
  const { userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  const staffId = userProfile?.employeeId || userProfile?.id || userProfile?.email || 'staff-01';

  const loadNotifs = () => {
    setNotifications(notificationService.getNotifications());
  };

  useEffect(() => {
    loadNotifs();
    const unsub = notificationService.subscribe(loadNotifs);
    return () => unsub();
  }, []);

  const unreadCount = notificationService.getUnreadCount(staffId);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
        title="Admin Notifications & Circulars"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 text-slate-200 border border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[480px]">
            <div className="p-4 bg-gradient-to-r from-red-900 to-slate-950 border-b border-red-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-amber-400" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Admin Broadcasts & Circulars
                </span>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => notificationService.markAllAsRead(staffId)}
                  className="text-[10px] text-amber-300 hover:underline font-bold cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-800 p-2 space-y-2">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No active notices or circulars.
                </div>
              ) : (
                notifications.map((n) => {
                  const isRead = n.readBy.some(
                    (id) => id.trim().toLowerCase() === staffId.trim().toLowerCase()
                  );
                  return (
                    <div
                      key={n.id}
                      onClick={() => notificationService.markAsRead(n.id, staffId)}
                      className={`p-3 rounded-2xl transition cursor-pointer space-y-1 ${
                        isRead ? 'bg-slate-900/50 opacity-75' : 'bg-slate-800/80 border border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-black text-amber-400 uppercase">
                          {n.category.replace(/_/g, ' ')}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {new Date(n.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-white">{n.title}</h4>
                      <p className="text-[11px] text-slate-300 leading-snug">{n.message}</p>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                        <span>By: {n.senderName}</span>
                        {!isRead && <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
