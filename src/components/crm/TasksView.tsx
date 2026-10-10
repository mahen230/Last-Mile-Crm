import React, { useState, useEffect } from 'react';
import { CheckCircle2, Plus, Clock, User, AlertCircle, Filter, Calendar, MapPin } from 'lucide-react';
import { customerService } from '../../services/customerService';

interface TaskItem {
  id: string;
  title: string;
  category: 'KYC Collection' | 'Passbook Delivery' | 'Aadhaar Biometric' | 'PLI Renewal' | 'Address Verification';
  assignedTo: string;
  beatNo: string;
  location: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
}

export default function TasksView() {
  const [tasks, setTasks] = useState<TaskItem[]>(customerService.getTasks());
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');

  useEffect(() => {
    const updateTasks = () => {
      setTasks(customerService.getTasks());
    };
    const unsub = customerService.subscribe(updateTasks);
    return () => unsub();
  }, []);

  const toggleTaskStatus = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      customerService.updateTask(id, { status: task.status === 'Completed' ? 'Pending' : 'Completed' });
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'Pending') return t.status !== 'Completed';
    if (filter === 'Completed') return t.status === 'Completed';
    return true;
  });

  return (
    <div className="space-y-6" id="tasks-view-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 size={22} className="text-red-700" />
            <span>Field Tasks & Daily Beat Queue</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational field dispatch for Postmen, Postal Assistants, and BPMs ({tasks.length} Total Tasks)
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        {(['All', 'Pending', 'Completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl transition ${
              filter === tab
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      <div className="space-y-3">
        {filteredTasks.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggleTaskStatus(t.id)}
                className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                  t.status === 'Completed' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 hover:border-red-600'
                }`}
              >
                {t.status === 'Completed' && <CheckCircle2 size={14} />}
              </button>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500">{t.id}</span>
                  <span className="text-xs px-2 py-0.5 bg-red-50 text-red-800 font-semibold rounded">
                    {t.category}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded">
                    Beat {t.beatNo}
                  </span>
                </div>

                <h4 className={`text-sm font-bold ${t.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {t.title}
                </h4>

                <div className="flex flex-wrap items-center gap-x-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-red-600" />
                    <span>{t.location}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={12} className="text-blue-600" />
                    <span>{t.assignedTo}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className="text-xs text-slate-500 font-medium">Due: {t.dueDate}</span>
              <button
                onClick={() => toggleTaskStatus(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  t.status === 'Completed'
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800'
                }`}
              >
                {t.status === 'Completed' ? 'Mark Pending' : 'Mark Done'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
