import React, { useState, useEffect } from 'react';
import { History, Shield, Search, Filter, Clock } from 'lucide-react';
import { AuditLog } from '../../types/models';
import { customerService } from '../../services/customerService';

export default function AuditLogView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLogs(customerService.getAuditLogs());
    const unsub = customerService.subscribe(() => {
      setLogs([...customerService.getAuditLogs()]);
    });
    return () => unsub();
  }, []);

  const filteredLogs = logs.filter(l => {
    const s = search.toLowerCase();
    return !s ||
      l.details.toLowerCase().includes(s) ||
      l.performedBy.toLowerCase().includes(s) ||
      l.entityId.toLowerCase().includes(s) ||
      l.action.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6" id="audit-log-view-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History size={22} className="text-red-700" />
            <span>Immutable Audit Trail & System Activity History</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full tamper-evident historical audit log for every change, merge, and field update ({logs.length} Total Events)
          </p>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail..."
            className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-600"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="text-[11px] text-slate-600 uppercase bg-slate-100/80 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Log ID</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Target Entity</th>
                <th className="px-4 py-3">Details & Audit Note</th>
                <th className="px-4 py-3">Operator / Source</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-slate-500">{log.id}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-slate-100 font-bold text-slate-800 rounded text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-900">{log.entityId}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{log.details}</td>
                  <td className="px-4 py-3 text-slate-600">{log.performedBy}</td>
                  <td className="px-4 py-3 text-right text-slate-500 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
