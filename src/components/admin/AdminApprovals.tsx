import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { PendingApproval } from '../../types/models';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminApprovals() {
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'pending_approvals'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PendingApproval));
      setApprovals(data.filter(a => a.status === 'Pending'));
    });
    return () => unsub();
  }, []);

  const handleApprove = async (approval: PendingApproval) => {
    await updateDoc(doc(db, 'pending_approvals', approval.id), { status: 'Approved' });
    await deleteDoc(doc(db, 'pending_approvals', approval.id));
  };

  const handleReject = async (approval: PendingApproval) => {
    await updateDoc(doc(db, 'pending_approvals', approval.id), { status: 'Rejected' });
    await deleteDoc(doc(db, 'pending_approvals', approval.id));
  };

  if (approvals.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-4">
      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
        <Clock size={18} className="text-amber-600" />
        <span>Pending Approvals ({approvals.length})</span>
      </h3>
      <div className="space-y-3">
        {approvals.slice(0, 3).map(approval => (
          <div key={approval.id} className="border border-amber-200 rounded-xl overflow-hidden">
            <div className="p-3 bg-amber-50 flex items-center justify-between gap-3 text-xs">
              <button onClick={() => setExpandedId(expandedId === approval.id ? null : approval.id)} className="flex items-center gap-2">
                {expandedId === approval.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span className="font-bold text-amber-900">{approval.type}</span>
              </button>
              <div className="text-amber-700">Requested by: {approval.requestedBy}</div>
              <div className="flex gap-2">
                <button onClick={() => handleApprove(approval)} className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200"><CheckCircle size={16} /></button>
                <button onClick={() => handleReject(approval)} className="p-1.5 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"><XCircle size={16} /></button>
              </div>
            </div>
            {expandedId === approval.id && (
              <div className="p-3 bg-white text-xs border-t border-amber-100">
                <pre className="whitespace-pre-wrap font-mono text-slate-600">
                  {JSON.stringify(approval.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
        {approvals.length > 3 && (
          <div className="text-center text-xs text-slate-500 pt-2">
            And {approvals.length - 3} more...
          </div>
        )}
      </div>
    </div>
  );
}
