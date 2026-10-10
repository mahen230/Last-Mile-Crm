import React, { useState, useEffect } from 'react';
import { User, Users, Heart, Shield, Plus, Search, ChevronRight, UserCheck } from 'lucide-react';
import { Customer } from '../../types/models';
import { customerService } from '../../services/customerService';
import CustomerProfileModal from '../customers/CustomerProfileModal';

export default function FamilyView() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    setCustomers(customerService.getCustomers());
    const unsub = customerService.subscribe(() => {
      setCustomers([...customerService.getCustomers()]);
    });
    return () => unsub();
  }, []);

  // Filter customers with recorded family relations
  const families = customers.filter(c => {
    const s = search.toLowerCase();
    const hasFamilyInfo = !!(c.fatherHusbandName || c.familyMembers?.length || c.remarks?.includes('Late') || c.remarks?.includes('daughter') || c.remarks?.includes('wife'));
    const matchesSearch = !s ||
      c.name.toLowerCase().includes(s) ||
      (c.fatherHusbandName && c.fatherHusbandName.toLowerCase().includes(s)) ||
      (c.remarks && c.remarks.toLowerCase().includes(s));
    return hasFamilyInfo && matchesSearch;
  });

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
        {families.map((c) => (
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

      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}
