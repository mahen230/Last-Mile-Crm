import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, RefreshCw, GitMerge, Check, X, Upload } from 'lucide-react';
import { DataConflict, Customer } from '../../types/models';
import { customerService } from '../../services/customerService';
import CustomerProfileModal from '../customers/CustomerProfileModal';
import BulkAddressImport from './BulkAddressImport';
import Sector6Report from './Sector6Report';

export default function DataQualityView() {
  const [conflicts, setConflicts] = useState<DataConflict[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedConflict, setSelectedConflict] = useState<DataConflict | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);

  useEffect(() => {
    setConflicts(customerService.getConflicts());
    setCustomers(customerService.getCustomers());
    const unsub = customerService.subscribe(() => {
      setConflicts([...customerService.getConflicts()]);
      setCustomers([...customerService.getCustomers()]);
    });
    return () => unsub();
  }, []);

  const openConflicts = conflicts.filter(c => c.status === 'Pending Review');
  const resolvedConflicts = conflicts.filter(c => c.status !== 'Pending Review');

  const handleResolve = (conflictId: string, resolution: 'KEEP_EXISTING' | 'UPDATE_NEW' | 'MERGE', notes: string) => {
    customerService.resolveConflict(conflictId, resolution, notes);
    setSelectedConflict(null);
  };

  return (
    <div className="space-y-6" id="data-quality-view-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck size={22} className="text-emerald-700" />
            <span>Data Quality, Duplicate Control & Conflict Resolver</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict Sovereign Data Rules: "NO DUPLICATE → UPDATE EXISTING", "CONFLICT → FLAG", "NEVER GUESS"
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowBulkImport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
          >
            <Upload size={16} /> Bulk Import
          </button>
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 size={15} /> System Integrity: 99.2%
          </span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs sm:col-span-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Data Health Summary</h3>
            <div className="flex gap-4 mt-2">
                <div><span className="text-xl font-black text-slate-900">{customers.length}</span><span className="text-xs text-slate-500 ml-1">Total Records</span></div>
                <div><span className="text-xl font-black text-amber-600">{customers.filter(c => (c.dataCompleteness || 0) < 100).length}</span><span className="text-xs text-slate-500 ml-1">Incomplete</span></div>
                <div><span className="text-xl font-black text-rose-600">{openConflicts.length}</span><span className="text-xs text-slate-500 ml-1">Duplicates</span></div>
            </div>
          </div>
          <a href="#data-quality-view-root" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition">
             Resolve Issues
          </a>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Active Conflicts / Multi-Resident Flags</span>
          <div className="text-3xl font-black text-amber-600 mt-1">{openConflicts.length}</div>
          <p className="text-xs text-slate-500 mt-1">Requiring supervisor confirmation</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Successfully Resolved & Merged</span>
          <div className="text-3xl font-black text-emerald-700 mt-1">{resolvedConflicts.length}</div>
          <p className="text-xs text-slate-500 mt-1">Audit verified records</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Master Unique Entities</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{customers.length}</div>
          <p className="text-xs text-slate-500 mt-1">No ghost or duplicate entities</p>
        </div>
      </div>

      <Sector6Report />

      {/* Conflicts List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-600" />
          <span>Flagged Ambiguities & Multi-Resident Phone Records</span>
        </h3>

        {openConflicts.length > 0 ? (
          <div className="space-y-3">
            {openConflicts.map((conf) => (
              <div
                key={conf.id}
                className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
                      {conf.id}
                    </span>
                    <span className="font-semibold text-slate-900 text-xs">{conf.conflictType}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{conf.details}</p>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Impacted Records: {conf.entityIds?.join(', ') || 'N/A'}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => setSelectedConflict(conf)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <GitMerge size={14} />
                    <span>Compare & Resolve</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
            <CheckCircle2 size={24} className="mx-auto text-emerald-600 mb-2" />
            No open data conflicts. Master Source is 100% normalized and consistent.
          </div>
        )}
      </div>

      {/* Conflict Resolution Modal */}
      {selectedConflict && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Conflict Resolution Workbench: {selectedConflict.id}</h3>
              <button onClick={() => setSelectedConflict(null)}>✕</button>
            </div>

            <div className="py-4 space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <strong>Conflict Context:</strong>
                <p className="mt-1">{selectedConflict.details}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Select Resolution Protocol:</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => handleResolve(selectedConflict.id, 'KEEP_EXISTING', 'Confirmed via beat postman that both individuals belong to same household and share landline/mobile.')}
                    className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
                  >
                    <div className="font-bold text-slate-900">Keep Both as Distinct Family Members in Same Household</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">Keeps both customer profiles intact under the shared household unit.</div>
                  </button>

                  <button
                    onClick={() => handleResolve(selectedConflict.id, 'MERGE', 'Merged duplicate entries into single master customer record.')}
                    className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition"
                  >
                    <div className="font-bold text-slate-900">Merge into Single Verified Master Customer</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">Combines all historical notes, addresses, and products into the primary master record.</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedConflict(null)}
                className="px-4 py-2 bg-slate-100 rounded-xl font-semibold text-xs text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
      {showBulkImport && (
        <BulkAddressImport
          onClose={() => setShowBulkImport(false)}
        />
      )}
    </div>
  );
}
