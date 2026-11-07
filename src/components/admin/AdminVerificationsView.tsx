import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle2, Clock, AlertTriangle, 
  MapPin, User, Calendar, BarChart3, RefreshCw, Eye 
} from 'lucide-react';
import { verificationService, DailyVerificationTask } from '../../services/verificationService';

export default function AdminVerificationsView() {
  const [summary, setSummary] = useState(() => verificationService.getAdminVerificationSummary());
  const [selectedTask, setSelectedTask] = useState<DailyVerificationTask | null>(null);

  const refreshData = () => {
    setSummary(verificationService.getAdminVerificationSummary());
  };

  useEffect(() => {
    refreshData();
    const unsub = verificationService.subscribe(refreshData);
    return () => unsub();
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Daily Property Verification Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live monitoring of field postman 10-property doorstep audit progress across Dadabari S.O. jurisdiction
            </p>
          </div>
        </div>

        <button
          onClick={refreshData}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw size={14} /> Refresh Audit
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Assigned Today</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{summary.totalAssigned}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">10 per active field beat</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase">Verified Complete</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">{summary.completed}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">{summary.completionRate}% completion rate</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-amber-800 uppercase">Pending In Field</span>
          <div className="text-2xl font-black text-amber-700 mt-1">{summary.pending}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Awaiting doorstep scan</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-blue-800 uppercase">Flagged / Review</span>
          <div className="text-2xl font-black text-blue-700 mt-1">{summary.needsReview}</div>
          <div className="text-[11px] text-blue-600 mt-0.5">Occupancy / address mismatch</div>
        </div>
      </div>

      {/* Beat & Employee Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Beat-Wise Performance */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 size={16} className="text-red-700" />
            <span>Beat-Wise Verification Performance</span>
          </h2>

          <div className="space-y-3">
            {summary.beatPerformance.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-6">No beats assigned for verification today</div>
            ) : (
              summary.beatPerformance.map(bp => (
                <div key={bp.beat} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{bp.beat}</span>
                    <span className="font-mono text-slate-600">
                      <strong>{bp.completed}</strong> / {bp.target} verified ({bp.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${bp.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Employee-Wise Targets */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User size={16} className="text-red-700" />
            <span>Postman Target Fulfillment</span>
          </h2>

          <div className="space-y-3">
            {summary.employeePerformance.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-6">No employee tasks initiated today</div>
            ) : (
              summary.employeePerformance.map(ep => (
                <div key={ep.employeeId} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{ep.name}</span>
                      <span className="font-mono text-[10px] text-slate-500 ml-2">({ep.employeeId})</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {ep.completed}/{ep.target} ({ep.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${ep.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Task Verification Feed */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between">
          <span>Today's Verified Properties & Audit Ledger</span>
          <span className="text-xs text-slate-500 font-normal">Date: {summary.date}</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Property</th>
                <th className="p-3">Postman</th>
                <th className="p-3">Address & Colony</th>
                <th className="p-3">Occupancy</th>
                <th className="p-3">GPS Tag</th>
                <th className="p-3">Status</th>
                <th className="p-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.allTodayTasks.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3 font-mono font-bold text-slate-900">
                    {t.propertyCode || t.houseNo}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-800">{t.employeeName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{t.beatNo}</div>
                  </td>
                  <td className="p-3 text-slate-600 max-w-xs truncate">
                    {typeof t.address === 'string'
                      ? t.address
                      : (t.address as any)?.fullAddress ||
                        [
                          (t.address as any)?.houseNo || (t.address as any)?.houseNumber,
                          (t.address as any)?.street,
                          (t.address as any)?.sector,
                          (t.address as any)?.colony || (t.address as any)?.area,
                        ]
                          .filter(Boolean)
                          .join(', ') ||
                        'Dadabari S.O.'}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      {t.occupancyStatus}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px]">
                    {t.gpsCaptured && t.latitude ? (
                      <span className="text-emerald-700 flex items-center gap-1 font-bold">
                        <MapPin size={11} /> {t.latitude.toFixed(4)}, {t.longitude?.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-slate-400">No GPS Tag</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        t.status === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'Needs Review'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 italic max-w-xs truncate">
                    {t.remarks || '—'}
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
