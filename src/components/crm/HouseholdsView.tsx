import React, { useState, useEffect } from 'react';
import { Home, Users, MapPin, Phone, Plus, Search, ShieldCheck, ChevronRight } from 'lucide-react';
import { Customer, Household } from '../../types/models';
import { customerService } from '../../services/customerService';
import CustomerProfileModal from '../customers/CustomerProfileModal';
import AddMemberModal from '../customers/AddMemberModal';
import AssociateMemberModal from '../customers/AssociateMemberModal';

export default function HouseholdsView({ onAddLead }: { onAddLead?: (customer: Customer) => void }) {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [search, setSearch] = useState('');
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAssociateMember, setShowAssociateMember] = useState(false);

  useEffect(() => {
    setHouseholds(customerService.getHouseholds());
    const unsub = customerService.subscribe(() => {
      setHouseholds([...customerService.getHouseholds()]);
    });
    return () => unsub();
  }, []);

  const filteredHouseholds = households.filter(h => {
    const s = search.toLowerCase().replace(/\s+/g, '');
    const mobileS = search.replace(/\D/g, '');
    
    // Normalize household data for search
    const houseNo = (h.address?.houseNo || '').toLowerCase().replace(/\s+/g, '');
    const headName = (h.headOfHouseholdName || '').toLowerCase().replace(/\s+/g, '');
    const primaryMobile = (h.primaryContactNumber || '').replace(/\D/g, '');
    
    return !s ||
      houseNo.includes(s) ||
      headName.includes(s) ||
      (mobileS && primaryMobile.includes(mobileS)) ||
      h.members.some(m => m.name.toLowerCase().replace(/\s+/g, '').includes(s));
  });

  return (
    <div className="space-y-6" id="households-view-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Home size={22} className="text-red-700" />
            <span>Household Registry & Family Units</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Normalized family units grouped by shared address and primary telephone ({households.length} Households)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search households..."
              className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>
      </div>

      {/* Grid of Household Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHouseholds.map((hh, index) => (
          <div
            key={hh.householdId || `hh-${index}`}
            className="bg-white rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md transition p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="font-mono text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                  {hh.householdId}
                </span>
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md flex items-center gap-1">
                  <Users size={13} /> {hh.members?.length || 0} {(hh.members?.length || 0) === 1 ? 'Resident' : 'Members'}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mb-1">
                Family of {hh.headOfHouseholdName}
              </h3>

              <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                <div className="flex items-start gap-1.5">
                  <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <span>{hh.address.fullAddress}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <Phone size={14} className="text-emerald-600 shrink-0" />
                  <span>{hh.primaryContactNumber}</span>
                </div>
              </div>

              {/* Members List Box */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 mb-4">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Associated Residents
                </div>
                <div className="space-y-1.5">
                  {hh.members.map((mem, index) => (
                    <div
                      key={mem.customerId || `mem-${hh.householdId}-${index}`}
                      onClick={() => {
                        const cust = customerService.getCustomerById(mem.customerId);
                        if (cust) setSelectedCustomer(cust);
                      }}
                      className="flex items-center justify-between text-xs p-1.5 bg-white rounded-lg border border-slate-200/80 hover:border-red-300 cursor-pointer transition"
                    >
                      <span className="font-medium text-slate-900">{mem.name}</span>
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {mem.relationship}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Beat {hh.address.area?.includes('Santoshi') ? '2' : '2'} • Dadabari SO
              </span>
              <button
                onClick={() => setSelectedHousehold(hh)}
                className="font-semibold text-red-700 hover:text-red-800 flex items-center gap-0.5"
              >
                <span>Explore Family</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Household Detail Modal */}
      {selectedHousehold && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-xs text-red-700 font-bold">{selectedHousehold.householdId}</span>
                <h3 className="text-lg font-bold text-slate-900">Household: {selectedHousehold.headOfHouseholdName}</h3>
              </div>
              <button onClick={() => setSelectedHousehold(null)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div><strong>Address:</strong> {selectedHousehold.address.fullAddress}</div>
                <div><strong>Primary Phone:</strong> {selectedHousehold.primaryContactNumber}</div>
                <div><strong>Total Residents:</strong> {selectedHousehold.members?.length || 0}</div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900">Members in this unit:</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAssociateMember(true)}
                      className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg"
                    >
                      <Search size={14} /> Associate
                    </button>
                    <button
                      onClick={() => setShowAddMember(true)}
                      className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded-lg"
                    >
                      <Plus size={14} /> Add New
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {selectedHousehold.members.map((m, index) => {
                    const cust = customerService.getCustomerById(m.customerId || '');
                    return (
                      <div key={m.customerId || `m-${selectedHousehold.householdId}-${index}`} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{m.name} {cust?.isHeadOfFamily && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Head</span>} ({m.relationship})</div>
                          <div className="text-slate-500 font-mono">{m.mobile || 'No mobile'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {cust && !cust.isHeadOfFamily && (
                            <button
                              onClick={() => customerService.setHeadOfFamily(cust.id, selectedHousehold.householdCode)}
                              className="text-[10px] text-blue-600 hover:underline"
                            >
                              Make Head
                            </button>
                          )}
                          {cust && (
                             <button
                               onClick={() => customerService.unlinkFromFamily(cust.id)}
                               className="text-[10px] text-red-600 hover:underline"
                             >
                               Remove
                             </button>
                          )}
                          {cust && (
                            <button
                              onClick={() => {
                                setSelectedHousehold(null);
                                setSelectedCustomer(cust);
                              }}
                              className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg text-[10px]"
                            >
                              View Profile
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedHousehold(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssociateMember && selectedHousehold && (
        <AssociateMemberModal
          isOpen={showAssociateMember}
          onClose={() => setShowAssociateMember(false)}
          householdCode={selectedHousehold.householdCode}
          onSaved={() => {}}
        />
      )}

      {showAddMember && selectedHousehold && (
        <AddMemberModal
          isOpen={showAddMember}
          onClose={() => setShowAddMember(false)}
          householdId={selectedHousehold.householdCode}
          householdAddress={selectedHousehold.address}
          onSaved={() => {
            // Service handles subscription, so households list updates automatically
          }}
        />
      )}

      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onAddLead={onAddLead}
        />
      )}
    </div>
  );
}
