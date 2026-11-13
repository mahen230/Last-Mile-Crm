import React, { useState, useEffect, useMemo } from 'react';
import { User, Users, Heart, Shield, Plus, Search, ChevronRight, UserCheck } from 'lucide-react';
import { Customer } from '../../types/models';
import { customerService } from '../../services/customerService';
import CustomerProfileModal from '../customers/CustomerProfileModal';
import { useAuth } from '../auth/FirebaseAuthProvider';

export default function FamilyView() {
  const { userProfile } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    setCustomers(customerService.getScopedCustomers(userProfile));
    const unsub = customerService.subscribe(() => {
      setCustomers([...customerService.getScopedCustomers(userProfile)]);
    });
    return () => unsub();
  }, [userProfile]);

  // Filter customers with recorded family relations
  const families = useMemo(() => {
    return customers.filter(c => {
      const s = search.toLowerCase();
      const hasFamilyInfo = !!(c.fatherHusbandName || c.familyMembers?.length || c.remarks?.includes('Late') || c.remarks?.includes('daughter') || c.remarks?.includes('wife'));
      const matchesSearch = !s ||
        c.name.toLowerCase().includes(s) ||
        (c.fatherHusbandName && c.fatherHusbandName.toLowerCase().includes(s)) ||
        (c.remarks && c.remarks.toLowerCase().includes(s));
      return hasFamilyInfo && matchesSearch;
    }).sort((a, b) => {
      const colA = (a.area || a.sectorLocality || a.address?.area || a.sector || '').trim();
      const colB = (b.area || b.sectorLocality || b.address?.area || b.sector || '').trim();
      const colCmp = colA.localeCompare(colB, undefined, { numeric: true, sensitivity: 'base' });
      if (colCmp !== 0) return colCmp;
      const hA = (a.houseNo || a.address?.houseNumber || '').trim();
      const hB = (b.houseNo || b.address?.houseNumber || '').trim();
      return hA.localeCompare(hB, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [customers, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, userProfile]);

  const totalPages = Math.max(1, Math.ceil(families.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedFamilies = families.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-6" id="family-view-root">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <User size={22} className="text-red-700" />
            <span>Family & Kinship Relationships</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Parentage, spouse relations, and guardian eligibility for Sukanya Samriddhi (SSA) & PLI
          </p>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, father/husband..."
            className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedFamilies.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md transition p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  {c.masterId || c.id}
                </span>
                <span className="text-xs px-2 py-0.5 bg-rose-50 text-rose-700 font-semibold rounded flex items-center gap-1">
                  <Heart size={12} /> Family Unit
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
              <p className="text-xs text-slate-600 font-medium mb-3">
                {c.fatherHusbandName ? `Relation: S/o or W/o ${c.fatherHusbandName}` : 'Head of Family'}
              </p>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700 mb-4">
                <div><strong>Address:</strong> {c.houseNo ? `House ${c.houseNo}, ` : ''}{c.sector ? `Sector ${c.sector}` : c.area}</div>
                <div><strong>Mobile:</strong> {c.mobile || 'No contact'}</div>
                {c.remarks && (
                  <div className="text-slate-500 italic mt-1 line-clamp-2">
                    "{c.remarks}"
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Beat {c.beatNo || '2'}</span>
              <button
                onClick={() => setSelectedCustomer(c)}
                className="font-semibold text-red-700 hover:text-red-800 flex items-center gap-1"
              >
                <span>View Full Profile</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {families.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 text-xs text-slate-600">
          <span>
            Showing <strong className="text-slate-900">{(safePage - 1) * PAGE_SIZE + 1}</strong>–<strong className="text-slate-900">{Math.min(safePage * PAGE_SIZE, families.length)}</strong> of <strong className="text-slate-900">{families.length}</strong> family records (5 per page)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              Prev
            </button>
            <span className="font-mono font-bold text-slate-800 px-2">
              Page {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}
