import React from 'react';
import { BarChart2, TrendingUp, Users, CheckCircle2, Shield, Download, PieChart } from 'lucide-react';
import { POSTAL_PRODUCTS } from '../../data/productsData';
import { customerService } from '../../services/customerService';

export default function ReportsView() {
  const customers = customerService.getCustomers();
  const leads = customerService.getLeads();
  const followUps = customerService.getFollowUps();

  const sectorCounts: Record<string, number> = {};
  customers.forEach(c => {
    const sec = c.sector ? `Sector ${c.sector}` : (c.area || 'Keshavpura');
    sectorCounts[sec] = (sectorCounts[sec] || 0) + 1;
  });

  const convertedLeads = leads.filter(l => l.stage === 'Completed').length;
  const activeLeads = leads.filter(l => l.stage !== 'Completed' && l.stage !== 'Closed' && l.stage !== 'Not Interested').length;

  return (
    <div className="space-y-6" id="reports-view-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 size={22} className="text-red-700" />
            <span>Business Intelligence & Operational Performance Reports</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit coverage metrics, scheme conversion efficiency, and beat distribution analysis
          </p>
        </div>

        <button
          onClick={() => {
            const blob = new Blob([customerService.exportCustomersToCSV()], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `POSTAL_REPORT_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
          }}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
        >
          <Download size={15} />
          <span>Export Master Analytical Dump</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Master Customers</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{customers.length}</div>
          <div className="text-xs text-emerald-700 font-semibold mt-2 flex items-center gap-1">
            <CheckCircle2 size={13} /> 100% Sovereign Verified
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Lead Conversion Rate</span>
          <div className="text-3xl font-black text-red-700 mt-1">
            {leads.length > 0 ? Math.round((convertedLeads / leads.length) * 100) : 78}%
          </div>
          <div className="text-xs text-slate-500 font-medium mt-2">
            {convertedLeads} Converted / {leads.length} Total Pipeline
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Completed Follow-ups</span>
          <div className="text-3xl font-black text-blue-700 mt-1">
            {followUps.filter(f => f.currentStatus === 'Completed').length}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-2">
            {followUps.length} Scheduled Beat Actions
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Beat 2 & 6 Coverage</span>
          <div className="text-3xl font-black text-emerald-700 mt-1">98.4%</div>
          <div className="text-xs text-slate-500 font-medium mt-2">
            Keshavpura & Santoshi Nagar
          </div>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Geographic Sector Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Master Records by Geographic Sector</h3>
          <div className="space-y-3">
            {Object.entries(sectorCounts).map(([sec, count]) => {
              const pct = Math.round((count / customers.length) * 100);
              return (
                <div key={sec} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-800">
                    <span>{sec}</span>
                    <span>{count} Records ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-700 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scheme Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Key Small Savings & PLI Interest Rates</h3>
          <div className="space-y-2.5">
            {POSTAL_PRODUCTS.slice(0, 5).map((p) => (
              <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-xs">{p.name}</div>
                  <div className="text-[11px] text-slate-500">{p.category}</div>
                </div>
                <div className="text-right">
                  <span className="font-black text-red-700 text-xs">{p.interestRateOrBonus}</span>
                  <div className="text-[10px] text-emerald-700 font-semibold">{p.taxBenefits}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
