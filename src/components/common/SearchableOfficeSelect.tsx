import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Building2,
  Search,
  Plus,
  MapPin,
  Check,
  ChevronDown,
  X,
  Sparkles,
  ShieldCheck,
  Building,
} from 'lucide-react';
import {
  staffPermissionService,
  KOTA_OFFICE_MASTER_LIST,
} from '../../services/staffPermissionService';
import { RAJASTHAN_DIVISIONS, PostOffice } from '../../data/officesData';
import { DynamicOfficeRecord } from '../../types/models';

export interface SelectedOfficeData {
  officeName: string;
  pincode: string;
  officeType: 'HO' | 'SO' | 'BO';
  division: string;
  circle: string;
  address?: string;
  headOffice?: string;
}

interface SearchableOfficeSelectProps {
  value: string; // e.g. "Dadabari S.O."
  pincodeValue?: string;
  onChange: (office: SelectedOfficeData) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  buttonClassName?: string;
}

export default function SearchableOfficeSelect({
  value,
  pincodeValue,
  onChange,
  label = 'Assigned Postal Office (HO / SO / BO) *',
  placeholder = 'Search by Office Name, Pincode or Division...',
  required = true,
  className = '',
  buttonClassName = '',
}: SearchableOfficeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | 'HO' | 'SO' | 'BO'>('ALL');
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Custom Office Modal State
  const [customType, setCustomType] = useState<'HO' | 'SO' | 'BO'>('SO');
  const [customName, setCustomName] = useState('');
  const [customPincode, setCustomPincode] = useState('324009');
  const [customDivision, setCustomDivision] = useState('Kota Division');
  const [customCircle, setCustomCircle] = useState('Rajasthan Circle');
  const [customAddress, setCustomAddress] = useState('');
  const [customParentHo, setCustomParentHo] = useState('Kota H.O.');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Aggregate Master + Dynamic Custom Offices
  const allOffices = useMemo(() => {
    const list: SelectedOfficeData[] = [];
    const seen = new Set<string>();

    // 1. Load dynamic / custom offices from staffPermissionService
    try {
      const dynamicList = staffPermissionService.getAutoManagedOffices();
      for (const d of dynamicList) {
        const cleanType = (d.officeType || 'SO').replace(/\./g, '') as 'HO' | 'SO' | 'BO';
        const key = `${d.officeName.toLowerCase()}_${d.pincode}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push({
            officeName: d.officeName,
            pincode: d.pincode,
            officeType: cleanType === 'HO' || cleanType === 'BO' ? cleanType : 'SO',
            division: d.division || 'Kota Division',
            circle: d.circle || 'Rajasthan Circle',
            address: d.completeAddress,
            headOffice: d.headOffice || 'Kota H.O.',
          });
        }
      }
    } catch (e) {
      console.warn('Error loading dynamic offices in selector:', e);
    }

    // 2. Load standard Rajasthan Circle offices
    for (const po of KOTA_OFFICE_MASTER_LIST) {
      const key = `${po.name.toLowerCase()}_${po.pin}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push({
          officeName: po.name,
          pincode: po.pin,
          officeType: po.type,
          division: po.division || 'Kota Division',
          circle: po.circle || 'Rajasthan Circle',
          address: po.address,
          headOffice: po.parentOffice || 'Kota H.O.',
        });
      }
    }

    return list;
  }, [showCustomModal]);

  // Filtered offices based on search query & type filter
  const filteredOffices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allOffices.filter((o) => {
      if (selectedTypeFilter !== 'ALL' && o.officeType !== selectedTypeFilter) {
        return false;
      }
      if (!q) return true;
      return (
        o.officeName.toLowerCase().includes(q) ||
        o.pincode.includes(q) ||
        o.division.toLowerCase().includes(q) ||
        (o.address && o.address.toLowerCase().includes(q))
      );
    });
  }, [allOffices, searchQuery, selectedTypeFilter]);

  const handleSelectOffice = (office: SelectedOfficeData) => {
    onChange(office);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleCreateCustomOffice = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const trimmedName = customName.trim();
    const cleanPin = customPincode.trim();

    if (!trimmedName) {
      setModalError('Please enter a valid Office Name.');
      return;
    }
    if (!/^\d{6}$/.test(cleanPin)) {
      setModalError('Please enter a valid 6-digit Pincode (e.g. 324009).');
      return;
    }

    // Auto-append suffix if missing (e.g. S.O. or B.O.)
    let finalOfficeName = trimmedName;
    if (customType === 'SO' && !finalOfficeName.toLowerCase().includes('s.o') && !finalOfficeName.toLowerCase().includes('so')) {
      finalOfficeName = `${trimmedName} S.O.`;
    } else if (customType === 'BO' && !finalOfficeName.toLowerCase().includes('b.o') && !finalOfficeName.toLowerCase().includes('bo')) {
      finalOfficeName = `${trimmedName} B.O.`;
    } else if (customType === 'HO' && !finalOfficeName.toLowerCase().includes('h.o') && !finalOfficeName.toLowerCase().includes('ho')) {
      finalOfficeName = `${trimmedName} H.O.`;
    }

    setIsSubmitting(true);
    try {
      // 1. Save to master database via staffPermissionService
      const newRecord = staffPermissionService.upsertCustomOffice({
        officeName: finalOfficeName,
        postOfficeName: finalOfficeName,
        officeType: customType,
        pincode: cleanPin,
        division: customDivision,
        circle: customCircle,
        completeAddress:
          customAddress.trim() ||
          `${finalOfficeName}, ${customDivision}, ${customCircle} - ${cleanPin}`,
        headOffice: customParentHo || 'Kota H.O.',
        subOffice: customType === 'BO' ? `${customParentHo}` : finalOfficeName,
      });

      const selectedData: SelectedOfficeData = {
        officeName: newRecord.officeName,
        pincode: newRecord.pincode,
        officeType: customType,
        division: newRecord.division,
        circle: newRecord.circle,
        address: newRecord.completeAddress,
        headOffice: newRecord.headOffice,
      };

      // 2. Auto-select it in current staff profile
      onChange(selectedData);

      // Close modal and dropdown
      setShowCustomModal(false);
      setIsOpen(false);
      setCustomName('');
      setCustomAddress('');
    } catch (err: any) {
      setModalError(err?.message || 'Failed to register custom office. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeBadge = (type: 'HO' | 'SO' | 'BO') => {
    switch (type) {
      case 'HO':
        return 'bg-red-800 text-white border-red-700';
      case 'SO':
        return 'bg-blue-800 text-white border-blue-700';
      case 'BO':
        return 'bg-emerald-700 text-white border-emerald-600';
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Building2 size={14} className="text-red-700 shrink-0" />
            <span>{label}</span>
          </span>
          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer transition hover:underline"
          >
            <Plus size={12} />
            <span>Add Custom Office</span>
          </button>
        </label>
      )}

      {/* Main Select Button Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-left flex items-center justify-between transition min-h-[42px] cursor-pointer text-xs ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          <Building size={15} className="text-slate-500 shrink-0" />
          {value ? (
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-slate-900 truncate">{value}</span>
              {pincodeValue && (
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                  {pincodeValue}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400">Select Registered Postal Office...</span>
          )}
        </div>
        <ChevronDown size={15} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Bar & Filter Header */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-700"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Quick Filter Chips: ALL / HO / SO / BO */}
            <div className="flex items-center justify-between text-[11px] pt-1">
              <div className="flex items-center gap-1">
                {(['ALL', 'HO', 'SO', 'BO'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedTypeFilter(type)}
                    className={`px-2 py-0.5 rounded-md font-bold transition text-[10px] cursor-pointer ${
                      selectedTypeFilter === type
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {type === 'ALL' ? 'All Offices' : type}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCustomModal(true);
                  setIsOpen(false);
                }}
                className="text-[11px] font-bold text-red-700 hover:text-red-900 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} />
                <span>＋ Add Custom</span>
              </button>
            </div>
          </div>

          {/* List of Offices */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 p-1">
            {filteredOffices.length === 0 ? (
              <div className="p-4 text-center space-y-2">
                <p className="text-xs text-slate-500">
                  No post office found matching "{searchQuery}"
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomModal(true);
                    setIsOpen(false);
                    if (searchQuery) setCustomName(searchQuery);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Register "{searchQuery || 'New Office'}" as Custom BO/SO</span>
                </button>
              </div>
            ) : (
              filteredOffices.map((office) => {
                const isSelected =
                  value.toLowerCase() === office.officeName.toLowerCase() ||
                  value.toLowerCase() === `${office.officeName.toLowerCase()} (${office.pincode})`;

                return (
                  <button
                    key={`${office.officeName}_${office.pincode}`}
                    type="button"
                    onClick={() => handleSelectOffice(office)}
                    className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between group cursor-pointer ${
                      isSelected ? 'bg-red-50 text-red-900' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0 pr-2 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${getTypeBadge(
                            office.officeType
                          )}`}
                        >
                          {office.officeType}
                        </span>
                        <span className="text-xs font-bold truncate group-hover:text-red-800">
                          {office.officeName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1 rounded">
                          {office.pincode}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                        <MapPin size={11} className="shrink-0 text-slate-400" />
                        <span>
                          {office.division} • {office.circle}
                          {office.headOffice ? ` (under ${office.headOffice})` : ''}
                        </span>
                      </div>
                    </div>

                    {isSelected && <Check size={16} className="text-red-700 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Footer */}
          <div className="p-2 bg-slate-50 border-t border-slate-200 text-right">
            <span className="text-[10px] text-slate-500">
              Showing {filteredOffices.length} of {allOffices.length} registered offices
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUSTOM OFFICE REGISTRATION MODAL                                          */}
      {/* ========================================================================= */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-800 via-red-900 to-slate-900 p-5 text-white flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-300 uppercase tracking-wide">
                  <ShieldCheck size={13} />
                  <span>Dynamic Postal Infrastructure</span>
                </div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <Building2 size={20} className="text-amber-400" />
                  <span>Register Custom Postal Office (HO/SO/BO)</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateCustomOffice} className="p-5 overflow-y-auto space-y-4">
              {modalError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold">
                  {modalError}
                </div>
              )}

              {/* Office Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Office Type *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'HO', label: 'Head Office (H.O.)', desc: 'Main Accounting Hub' },
                    { id: 'SO', label: 'Sub Office (S.O.)', desc: 'Town / Delivery S.O.' },
                    { id: 'BO', label: 'Branch Office (B.O.)', desc: 'Gramin Dak Seva B.O.' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setCustomType(t.id as any)}
                      className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                        customType === t.id
                          ? 'bg-red-50 border-red-700 text-red-950 ring-1 ring-red-700'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-black">{t.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Office Name & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Office Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Dadabari Extension, Kishorepura"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={customPincode}
                    onChange={(e) => setCustomPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="6 digits (324009)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </div>
              </div>

              {/* Division & Circle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Division *</label>
                  <select
                    value={customDivision}
                    onChange={(e) => setCustomDivision(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                  >
                    {RAJASTHAN_DIVISIONS.map((d) => (
                      <option key={d.divisionId} value={d.name}>
                        {d.name} ({d.district})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Circle *</label>
                  <input
                    type="text"
                    value={customCircle}
                    onChange={(e) => setCustomCircle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </div>
              </div>

              {/* Parent Head / Sub Office */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Accounting Parent Head Office (H.O.)
                </label>
                <input
                  type="text"
                  value={customParentHo}
                  onChange={(e) => setCustomParentHo(e.target.value)}
                  placeholder="e.g. Kota H.O., Baran H.O., Bundi H.O."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>

              {/* Complete Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Complete Street Address
                </label>
                <textarea
                  rows={2}
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="Street / Locality, Landmark, Post Office Building details..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-red-800 hover:bg-red-900 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>{isSubmitting ? 'Saving...' : 'Save & Auto-Select Office'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
