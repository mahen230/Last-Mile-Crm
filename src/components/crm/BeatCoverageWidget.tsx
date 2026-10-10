import React, { useMemo } from 'react';
import { Customer } from '../../types/models';
import { Building, Target } from 'lucide-react';

interface Props {
  customers: Customer[];
}

export default function BeatCoverageWidget({ customers }: Props) {
  const coverageData = useMemo(() => {
    const beats = new Map<string, { total: number; visited: number }>();

    customers.filter(c => c.type === 'Household').forEach(c => {
      const beatNo = c.beatNo || 'Unassigned';
      if (!beats.has(beatNo)) {
        beats.set(beatNo, { total: 0, visited: 0 });
      }
      const data = beats.get(beatNo)!;
      data.total += 1;
      // Define "Visited" as Field Confirmed for operational coverage
      if (c.verificationStatus === 'Field Confirmed') {
        data.visited += 1;
      }
    });

    return Array.from(beats.entries()).map(([beatNo, data]) => ({
      beatNo,
      ...data,
      percentage: data.total > 0 ? Math.round((data.visited / data.total) * 100) : 0,
    }));
  }, [customers]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
        <Target size={18} className="text-emerald-700" />
        <span>Beat Coverage Dashboard</span>
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {coverageData.map(beat => (
          <div key={beat.beatNo} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-700">Beat {beat.beatNo}</span>
              <span className="text-xs font-bold text-emerald-700">{beat.percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${beat.percentage}%` }}></div>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              {beat.visited} Visited / {beat.total} Total
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
