import React, { useState, useEffect } from 'react';
import { 
  UserCog, CheckCircle2, XCircle, Clock, ShieldCheck, 
  ArrowRight, Phone, Mail, MapPin, RefreshCw 
} from 'lucide-react';
import { staffRegistrationService, ProfileApprovalRequest } from '../../services/staffRegistrationService';
import { useAuth } from '../auth/FirebaseAuthProvider';

export default function ProfileApprovalsView() {
  const { userProfile } = useAuth();
  const [requests, setRequests] = useState<ProfileApprovalRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadRequests = () => {
    setRequests(staffRegistrationService.getProfileApprovalRequests());
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

  const handleApprove = (req: ProfileApprovalRequest) => {
    const res = staffRegistrationService.approveProfileChange(req.id, userProfile?.name || 'Ekta Meena');
    if (res.success) {
      showToast(`✅ ${res.message}`);
    } else {
      showToast(`⚠️ ${res.message}`);
    }
  };

  const handleRejectConfirm = (reqId: string) => {
    const res = staffRegistrationService.rejectProfileChange(reqId, rejectReason, userProfile?.name || 'Ekta Meena');
    setRejectingId(null);
    setRejectReason('');
    showToast(res.message);
  };

  const filtered = requests.filter(r => {
    return filterStatus === 'ALL' || r.status === filterStatus;
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
            <UserCog size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Staff Profile Modification Requests
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and approve field postman profile changes (name correction, contact, address updates)
            </p>
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

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
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

      {/* Requests List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
            <ShieldCheck size={36} className="mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">No {filterStatus.toLowerCase()} profile change requests</h3>
            <p className="text-xs text-slate-400">All submitted staff profile modifications have been audited.</p>
          </div>
        ) : (
          filtered.map(req => (
            <div
              key={req.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                    {req.employeeId}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{req.staffName}</h3>
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
                <span className="text-[11px] text-slate-400">
                  Submitted: {new Date(req.submittedAt).toLocaleString()}
                </span>
              </div>

              {/* Old vs Proposed Diff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Current Values */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Current Active Values
                  </div>
                  <div><strong>Name:</strong> {req.currentValues.name}</div>
                  <div><strong>Mobile:</strong> <span className="font-mono">{req.currentValues.contact}</span></div>
                  <div><strong>Email:</strong> {req.currentValues.email}</div>
                  {req.currentValues.address && (
                    <div>
                      <strong>Address:</strong>{' '}
                      {typeof req.currentValues.address === 'string'
                        ? req.currentValues.address
                        : (req.currentValues.address as any)?.fullAddress || 'Dadabari S.O.'}
                    </div>
                  )}
                </div>

                {/* Proposed Changes */}
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1.5">
                  <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                    <ArrowRight size={12} /> Proposed Modifications
                  </div>
                  {req.proposedValues.name && (
                    <div className="text-slate-900">
                      <strong>Name:</strong> <span className="bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded">{req.proposedValues.name}</span>
                    </div>
                  )}
                  {req.proposedValues.contact && (
                    <div className="text-slate-900">
                      <strong>Mobile:</strong> <span className="font-mono bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded">{req.proposedValues.contact}</span>
                    </div>
                  )}
                  {req.proposedValues.email && (
                    <div className="text-slate-900">
                      <strong>Email:</strong> <span className="bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded">{req.proposedValues.email}</span>
                    </div>
                  )}
                  {req.proposedValues.address && (
                    <div className="text-slate-900">
                      <strong>Address:</strong>{' '}
                      <span className="bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded">
                        {typeof req.proposedValues.address === 'string'
                          ? req.proposedValues.address
                          : (req.proposedValues.address as any)?.fullAddress || 'Dadabari S.O.'}
                      </span>
                    </div>
                  )}
                  {req.proposedValues.remarks && (
                    <div className="text-slate-600 text-[11px] italic pt-1">
                      Reason: "{req.proposedValues.remarks}"
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {req.status === 'PENDING' && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
                        Approve Profile Update
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
