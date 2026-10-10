import React, { useState, useEffect } from 'react';
import { Building2, Search, MapPin, Phone, ExternalLink, Briefcase, Plus } from 'lucide-react';
import { Customer } from '../../types/models';
import { customerService } from '../../services/customerService';
import CustomerProfileModal from '../customers/CustomerProfileModal';

export default function BusinessesView() {
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

  // Commercial / Merchant establishments identified in Master Source
  const businesses = customers?.filter(c => {
    const text = `${c.name} ${c.remarks || ''} ${c.occupation || ''}`.toLowerCase();
    const isBiz = text.includes('tea') || 
      text.includes('shop') || 
      text.includes('stall') || 
      text.includes('traders') || 
      text.includes('collection') || 
      text.includes('welding') || 
      text.includes('school') || 
      text.includes('medical') || 
      text.includes('centre') || 
      text.includes('center') ||
      text.includes('enterprise') ||
      text.includes('store');

    const s = search.toLowerCase();
    return isBiz && (!s || text.includes(s));
  }) || [];

  return (
    <div className="space-y-6" id="businesses-view-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 size={22} className="text-red-700" />
            <span>Commercial & Merchant Registry</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Local enterprises, retail shops, educational institutions & IPPB Merchant QR Banking ({businesses.length} Commercial Units)
          </p>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search business name, tea stall, shop..."
            className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-600"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-xs transition p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-800 font-bold rounded-md">
                  Merchant / Commercial
                </span>
                <span className="font-mono text-xs font-bold text-slate-500">{b.masterId || b.id}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{b.name}</h3>

              <div className="space-y-1.5 text-xs text-slate-600 my-3">
                <div className="flex items-start gap-1.5">
                  <MapPin size={13} className="text-red-600 shrink-0 mt-0.5" />
                  <span>{b.address?.fullAddress || `${b.houseNo || ''}, ${b.sector || b.area}`}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <Phone size={13} className="text-emerald-600 shrink-0" />
                  <span>{b.mobile || 'No contact number'}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Field Details:</span>
                <p className="mt-0.5">{b.remarks || b.occupation || 'Retail commercial establishment'}</p>
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Beat {b.beatNo || '2'}</span>
              <button
                onClick={() => setSelectedCustomer(b)}
                className="font-semibold text-red-700 hover:text-red-800"
              >
                View Account 360° →
              </button>
            </div>
          </div>
        ))}

        {businesses.length === 0 && (
          <div className="col-span-full p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
            No commercial establishments match your search.
          </div>
        )}
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
