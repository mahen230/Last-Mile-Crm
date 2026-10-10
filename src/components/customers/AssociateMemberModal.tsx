import React, { useState } from 'react';
import { Customer } from '../../types/models';
import { customerService } from '../../services/customerService';
import { Search } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  householdCode: string;
  onSaved: () => void;
}

export default function AssociateMemberModal({ isOpen, onClose, householdCode, onSaved }: Props) {
  const [search, setSearch] = useState('');
  const allCustomers = customerService.getCustomers();
  
  const filteredCustomers = allCustomers.filter(c => 
    !c.householdId && 
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[80vh] flex flex-col">
        <h3 className="font-bold text-lg mb-4">Associate Existing Member</h3>
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredCustomers.map(c => (
            <div key={c.id} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-bold">{c.name}</div>
                <div className="text-xs text-slate-500">{c.mobile}</div>
              </div>
              <button 
                onClick={() => {
                  customerService.linkCustomerToHousehold(c.id, householdCode);
                  onSaved();
                  onClose();
                }}
                className="px-3 py-1 bg-red-700 text-white rounded-lg text-xs font-semibold"
              >
                Associate
              </button>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 w-full p-2 bg-slate-100 rounded-lg font-semibold text-sm">Cancel</button>
      </div>
    </div>
  );
}
