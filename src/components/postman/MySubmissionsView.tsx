import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, Search, Edit3, User, MapPin, 
  Phone, Calendar, ShieldCheck, Plus, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { customerService } from '../../services/customerService';
import { Customer } from '../../types/models';
import AddCustomerModal from '../customers/AddCustomerModal';

export default function MySubmissionsView() {
  const { userProfile } = useAuth();
  const [submissions, setSubmissions] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCustomerToEdit, setSelectedCustomerToEdit] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const empId = userProfile?.employeeId || userProfile?.id || '';

  const loadSubmissions = () => {
    const all = customerService.getCustomers();
    const mine = all.filter(c => {
      if (!empId) return false;
      return (
        (c.createdBy && c.createdBy.toUpperCase() === empId.toUpperCase()) ||
        c.createdBy === userProfile?.id ||
        c.createdBy === userProfile?.name
      );
    });
    setSubmissions(mine);
  };

  useEffect(() => {
    loadSubmissions();
    const unsub = customerService.subscribe(loadSubmissions);
    return () => unsub();
  }, [empId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filtered = submissions.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const addr = typeof c.address === 'string' ? c.address : (c.address?.fullAddress || '');
    return (
      c.name.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      (c.houseNo && c.houseNo.toLowerCase().includes(q)) ||
      addr.toLowerCase().includes(q) ||
      (c.masterId && c.masterId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold shadow-md flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
            <FileCheck2 size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              My Field Submissions
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Entries registered by you ({userProfile?.name} • <span className="font-mono">{userProfile?.employeeId}</span>)
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} /> New Entry
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search my submissions by name, mobile, house number..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 transition"
          />
        </div>
        <span className="text-xs font-bold text-slate-500 shrink-0">
          {filtered.length} Record(s) Found
        </span>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
            <FileCheck2 size={36} className="mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">No submissions found</h3>
            <p className="text-xs text-slate-400">
              {search.trim() ? 'No records match your search filter.' : 'You have not submitted any customer or property records yet.'}
            </p>
          </div>
        ) : (
          filtered.map(cust => (
            <div
              key={cust.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                    {cust.masterId || cust.id}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{cust.name}</h3>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded">
                    {cust.livingStatus || 'Resident'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-mono">
                    <Phone size={13} className="text-slate-400" />
                    {cust.mobile}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    {cust.houseNo ? `House ${cust.houseNo}, ` : ''}{cust.sector || cust.area || 'Dadabari S.O.'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Beat: <strong>{cust.beatNo || 'Beat 2'}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedCustomerToEdit(cust)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit3 size={14} />
                  Edit My Record
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Customer Modal */}
      {selectedCustomerToEdit && (
        <AddCustomerModal
          isOpen={Boolean(selectedCustomerToEdit)}
          onClose={() => setSelectedCustomerToEdit(null)}
          customerToEdit={selectedCustomerToEdit}
          onSaved={() => {
            setSelectedCustomerToEdit(null);
            showToast('✅ Customer record updated successfully.');
          }}
        />
      )}

      {/* New Customer Modal */}
      {showAddModal && (
        <AddCustomerModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            setShowAddModal(false);
            showToast('✅ New customer record registered successfully.');
          }}
        />
      )}
    </div>
  );
}
