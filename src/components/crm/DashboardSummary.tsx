import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Staff, FollowUp, Inquiry, SupportTicket } from '../../types/models';

interface Props {
  staff: Staff[];
  followUps: FollowUp[];
  inquiries: Inquiry[];
  tickets: SupportTicket[];
}

export default function DashboardSummary({ staff, followUps, inquiries, tickets }: Props) {
  const activeFollowUps = followUps?.filter(f => f.currentStatus !== 'Completed').length || 0;
  const pendingTasks = (inquiries?.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').length || 0) + 
                       (tickets?.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length || 0);
  
  const staffOccupancy = (staff?.filter(s => s.status === 'Active on Duty').length || 0) / (staff?.length || 1) * 100;

  const staffData = staff?.map(s => ({
    name: s.name.split(' ')[1] || s.name,
    visits: s.doorstepVisits
  })) || [];

  const followUpStatusData = [
    { name: 'Pending', value: activeFollowUps, color: '#f59e0b' },
    { name: 'Completed', value: followUps?.filter(f => f.currentStatus === 'Completed').length || 0, color: '#10b981' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-900 mb-4">Staff Activity (Visits)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={staffData || []}>
            <XAxis dataKey="name" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip />
            <Bar dataKey="visits" fill="#b91c1c" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-900 mb-4">Follow-up Status</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={followUpStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
              {followUpStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
