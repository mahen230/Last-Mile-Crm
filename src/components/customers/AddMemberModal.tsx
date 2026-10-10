import React, { useState } from 'react';
import { Customer } from '../../types/models';
import { customerService } from '../../services/customerService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  householdId: string;
  householdAddress: any;
  onSaved: () => void;
}

export default function AddMemberModal({ isOpen, onClose, householdId, householdAddress, onSaved }: Props) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [relationship, setRelationship] = useState('Family Member');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    customerService.addOrUpdateCustomer({
      name,
      mobile,
      householdId,
      address: householdAddress,
      householdMembers: [{ name, relationship }], // Basic link
      verificationStatus: 'Field Confirmed',
    }, 'Quick Add Member');
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
        <h3 className="font-bold text-lg mb-4">Quick Add Member</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Name *</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile *</label>
            <input type="tel" required value={mobile} onChange={e => setMobile(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Type *</label>
            <select value={relationship} onChange={e => setRelationship(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg">
              <option>Family Member</option>
              <option>Rentor</option>
              <option>Owner</option>
              <option>Other</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 p-2 bg-slate-100 rounded-lg font-semibold">Cancel</button>
            <button type="submit" className="flex-1 p-2 bg-red-700 text-white rounded-lg font-semibold">Add Member</button>
          </div>
        </form>
      </div>
    </div>
  );
}
