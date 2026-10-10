import React from 'react';
import { calculateSector6Stats } from './Sector6Report';
import { customerService } from '../../services/customerService';
import { Target } from 'lucide-react';

export default function Sector6SummaryWidget() {
  const customers = customerService.getCustomers();
  const stats = calculateSector6Stats(customers);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map(s => (
        <div key={s.name} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{s.name}</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{s.Pending}</div>
            <div className="text-slate-400 text-xs">Remaining</div>
          </div>
          <Target className="w-5 h-5 text-indigo-500 opacity-50" />
        </div>
      ))}
    </div>
  );
}
