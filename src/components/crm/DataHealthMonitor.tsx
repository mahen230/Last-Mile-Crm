import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Users, Home, ClipboardList } from 'lucide-react';
import { Customer, Staff, Household } from '../../types/models';

interface Props {
  customers: Customer[];
  staff: Staff[];
  households: Household[];
}

export default function DataHealthMonitor({ customers, staff, households }: Props) {
  const issues = useMemo(() => {
    const missingMobile = customers.filter(c => !c.mobile || c.mobile.length < 10);
    
    const householdIdCounts: Record<string, number> = {};
    households.forEach(h => {
        const hid = h.householdId || h.householdCode;
        if(hid) {
            householdIdCounts[hid] = (householdIdCounts[hid] || 0) + 1;
        }
    });
    const duplicateHouseholdIds = Object.keys(householdIdCounts).filter(id => householdIdCounts[id] > 1);

    const missingBeatMapping = staff.filter(s => (!s.assignedBeat && !s.beat) || (s.assignedBeat === '' && s.beat === ''));

    return {
        missingMobile: missingMobile.length,
        duplicateHouseholdIds: duplicateHouseholdIds.length,
        missingBeatMapping: missingBeatMapping.length,
        totalIssues: missingMobile.length + duplicateHouseholdIds.length + missingBeatMapping.length
    };
  }, [customers, staff, households]);

  if (issues.totalIssues === 0) return null;

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-4 text-xs text-red-900 mb-6">
      <div className="flex items-center gap-3">
        <ShieldAlert size={20} className="text-red-600 shrink-0" />
        <div>
          <strong className="font-bold">Data Health Alert: {issues.totalIssues} Issues Detected</strong>
          <div className="flex gap-4 mt-1">
             {issues.missingMobile > 0 && (
                 <Link to="/customers" className="flex items-center hover:text-red-700 hover:underline">
                    <Users size={12} className="inline mr-1"/>{issues.missingMobile} Missing Mobile
                 </Link>
             )}
             {issues.duplicateHouseholdIds > 0 && (
                 <Link to="/households" className="flex items-center hover:text-red-700 hover:underline">
                    <Home size={12} className="inline mr-1"/>{issues.duplicateHouseholdIds} Duplicate HH IDs
                 </Link>
             )}
             {issues.missingBeatMapping > 0 && (
                 <Link to="/staff" className="flex items-center hover:text-red-700 hover:underline">
                    <ClipboardList size={12} className="inline mr-1"/>{issues.missingBeatMapping} Missing Staff Beat Mapping
                 </Link>
             )}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Link to="/data-quality" className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg whitespace-nowrap shadow-xs transition">
          Run Clean-up →
        </Link>
      </div>
    </div>
  );
}
