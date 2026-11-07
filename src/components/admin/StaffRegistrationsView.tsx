import React, { useState, useEffect } from 'react';
import { 
  UserCheck, CheckCircle2, XCircle, Clock, Search, 
  ShieldCheck, AlertCircle, RefreshCw, Mail, Phone, MapPin, Briefcase 
} from 'lucide-react';
import { staffRegistrationService, StaffRegistrationRequest } from '../../services/staffRegistrationService';
import { useAuth } from '../auth/FirebaseAuthProvider';

export default function StaffRegistrationsView() {
  const { userProfile } = useAuth();
  const [requests, setRequests] = useState<StaffRegistrationRequest[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadRequests = () => {
    setRequests(staffRegistrationService.getRegistrationRequests());
  };

  useEffect(() => {
    loadRequests();
    const unsub = staffRegistrationService.subscribe(loadRequests);
    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprove = (req: StaffRegistrationRequest) => {
    const res = staffRegistrationService.approveRegistration(req.id, userProfile?.name || 'Ekta Meena');
    if (res.success) {
      showToast(`✅ ${res.message}`);
    } else {
      showToast(`⚠️ ${res.message}`);
    }
  };

  const handleRejectConfirm = (reqId: string) => {
    const res = staffRegistrationService.rejectRegistration(reqId, rejectReason, userProfile?.name || 'Ekta Meena');
    setRejectingId(null);
    setRejectReason('');
    showToast(res.message);
  };

  const filtered = requests.filter(r => {
    const statusMatch = filterStatus === 'ALL' || r.status === filterStatus;
    if (!statusMatch) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.employeeId.toLowerCase().includes(q) ||
        r.mobile.includes(q) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        r.requestedBeat.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold shadow-md flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-center">
              <UserCheck size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Staff Registration Requests
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and approve new field postmen and postal staff account onboarding requests
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black rounded-xl flex items-center gap-1.5">
            <Clock size={14} />
            {pendingCount} Pending Approvals
          </span>
          <button
            onClick={loadRequests}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st} {st === 'PENDING' && pendingCount > 0 && `(${pendingCount})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, name, mobile..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-red-500 transition"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
            <ShieldCheck size={36} className="mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">No {filterStatus.toLowerCase()} requests</h3>
            <p className="text-xs text-slate-400">All staff registration submissions have been processed.</p>
          </div>
        ) : (
          filtered.map(req => (
            <div
              key={req.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200">
                    {req.employeeId}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{req.name}</h3>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-md">
                    {req.designation}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black rounded-md uppercase ${
                      req.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : req.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-mono">
                    <Phone size={13} className="text-slate-400" />
                    {req.mobile}
                  </span>
                  {req.email && (
                    <span className="flex items-center gap-1">
                      <Mail size={13} className="text-slate-400" />
                      {req.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    Requested: <strong>{req.requestedBeat}</strong>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Submitted: {new Date(req.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                {req.rejectionReason && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 mt-1">
                    <strong>Rejection Reason:</strong> {req.rejectionReason}
                  </div>
                )}

                {req.reviewedBy && (
                  <div className="text-[11px] text-slate-400">
                    Reviewed by <strong>{req.reviewedBy}</strong> on {new Date(req.reviewedAt || '').toLocaleString()}
                  </div>
                )}
              </div>

              {/* Action Buttons for Pending */}
              {req.status === 'PENDING' && (
                <div className="flex items-center gap-2 shrink-0">
                  {rejectingId === req.id ? (
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        placeholder="Rejection reason..."
                        className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                      <button
                        onClick={() => handleRejectConfirm(req.id)}
                        className="px-2.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => { setRejectingId(null); setRejectReason(''); }}
                        className="px-2 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApprove(req)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 size={15} />
                        Approve & Create Account
                      </button>
                      <button
                        onClick={() => setRejectingId(req.id)}
                        className="px-3 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <XCircle size={15} />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
