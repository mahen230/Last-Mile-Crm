import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Phone,
  MessageCircle,
  Mail,
  Building2,
  MapPin,
  ShieldCheck,
  Download,
  Lock,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  X,
} from 'lucide-react';
import { staffPermissionService } from '../../services/staffPermissionService';
import { Staff } from '../../types/models';
import { useAuth } from '../auth/FirebaseAuthProvider';

export default function ColleagueStaffDirectory() {
  const { userProfile } = useAuth();
  const [directoryList, setDirectoryList] = useState<Staff[]>(() =>
    staffPermissionService.getDirectoryStaff()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [officeFilter, setOfficeFilter] = useState('ALL');
  const [designationFilter, setDesignationFilter] = useState('ALL');
  const [pageSize, setPageSize] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const syncDir = () => {
      setDirectoryList(staffPermissionService.getDirectoryStaff());
    };
    syncDir();
    const unsub = staffPermissionService.subscribe(syncDir);
    return () => unsub();
  }, []);

  const officeOptions = useMemo(() => {
    const set = new Set<string>();
    directoryList.forEach((s) => {
      const off = s.subOffice || s.subOrBranchOffice || 'Dadabari S.O.';
      if (off) set.add(off);
    });
    return Array.from(set).sort();
  }, [directoryList]);

  const designationOptions = useMemo(() => {
    const set = new Set<string>();
    directoryList.forEach((s) => {
      const des = s.designationType || s.role || 'Postman';
      if (des) set.add(des);
    });
    return Array.from(set).sort();
  }, [directoryList]);

  const filteredStaff = useMemo(() => {
    return directoryList.filter((s) => {
      const off = s.subOffice || s.subOrBranchOffice || 'Dadabari S.O.';
      const des = s.designationType || s.role || 'Postman';
      if (officeFilter !== 'ALL' && off !== officeFilter) return false;
      if (designationFilter !== 'ALL' && des !== designationFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const fields = [
          s.name,
          s.employeeId,
          s.contact,
          s.email,
          s.beat,
          off,
          s.officePincode,
          des,
        ]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());
        if (!fields.some((f) => f.includes(q))) return false;
      }
      return true;
    });
  }, [directoryList, officeFilter, designationFilter, searchQuery]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, officeFilter, designationFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedStaff = filteredStaff.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const handleExportContactsCSV = () => {
    const headers = [
      'Employee ID',
      'Full Name',
      'Designation',
      'Office',
      'Pincode',
      'Assigned Beat',
      'Official Contact',
      'Email',
    ];
    const rows = filteredStaff.map((s) => [
      `"${s.employeeId || s.id}"`,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${s.designationType || s.role || ''}"`,
      `"${s.subOffice || s.subOrBranchOffice || 'Dadabari S.O.'}"`,
      `"${s.officePincode || '324009'}"`,
      `"${s.beat || '-'}"`,
      `"${s.contact || ''}"`,
      `"${s.email && s.email !== 'N/A' ? s.email : '-'}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IndiaPost_Official_Staff_Contacts_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="colleague-staff-directory">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-red-800/40 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/70 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wide">
              <Users size={14} className="text-amber-400" />
              <span>Inter-Office Communication Directory · Department of Posts</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Staff Contact & Colleague Directory
            </h1>
            <p className="text-xs sm:text-sm text-red-100/90 max-w-3xl leading-relaxed">
              Official contact lookup for seamless inter-office coordination across Kota Division &amp; Dadabari S.O. (324009). Logged in as{' '}
              <strong className="text-amber-300">{userProfile?.name || 'Postal Staff'}</strong> ({userProfile?.beat || 'All Beats'}).
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportContactsCSV}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer shrink-0 self-start lg:self-center"
          >
            <Download size={15} />
            <span>Export Contacts CSV ({filteredStaff.length})</span>
          </button>
        </div>

        {/* Strict Privacy Notice */}
        <div className="p-3.5 rounded-2xl bg-slate-950/75 border border-emerald-500/40 flex items-start gap-2.5 text-xs text-emerald-100">
          <Lock size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-emerald-300">Data Privacy &amp; Beat Isolation Active:</strong>{' '}
            This directory intentionally exposes only basic colleague name, designation, office, beat badge, and official contact details for communication. Private beat customer ledgers, leads, fuel bills, and staff credentials remain strictly isolated per assigned beat.
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-5 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search colleague name, mobile number, Beat #, CSI ID, office..."
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="sm:col-span-3">
            <select
              value={officeFilter}
              onChange={(e) => setOfficeFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Post Offices ({officeOptions.length})</option>
              {officeOptions.map((off) => (
                <option key={off} value={off}>
                  {off}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Designations</option>
              {designationOptions.map((des) => (
                <option key={des} value={des}>
                  {des}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 flex items-center justify-end gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
            </select>
          </div>
        </div>

        {/* Directory Cards Grid */}
        {paginatedStaff.length === 0 ? (
          <div className="p-10 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-500 space-y-2">
            <Users size={32} className="mx-auto text-slate-300" />
            <div className="font-bold text-slate-800 text-sm">No Colleagues Match Your Search</div>
            <p>Try clearing the office or designation filter to inspect the complete staff contact directory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedStaff.map((staff) => {
              const cleanPhone = (staff.contact || '').replace(/\D/g, '').slice(-10);
              const isOwnProfile =
                (userProfile?.employeeId && staff.employeeId === userProfile.employeeId) ||
                (userProfile?.contact && staff.contact === userProfile.contact);

              return (
                <div
                  key={staff.id}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                    isOwnProfile
                      ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 hover:border-red-300 hover:bg-white'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-red-800 text-amber-300 font-black text-sm flex items-center justify-center shrink-0">
                          {staff.name?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-sm text-slate-900 truncate flex items-center gap-1.5">
                            <span className="truncate">{staff.name}</span>
                            {isOwnProfile && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500">
                            ID: {staff.employeeId || staff.id}
                          </div>
                        </div>
                      </div>
                      {staff.beat && (
                        <span className="px-2 py-0.5 rounded-lg bg-red-100 text-red-900 border border-red-200 text-[10px] font-black font-mono shrink-0">
                          {staff.beat}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs bg-white p-3 rounded-xl border border-slate-200/80">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Briefcase size={13} className="text-red-700 shrink-0" />
                        <span className="font-bold truncate">
                          {staff.designationType || staff.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Building2 size={13} className="text-slate-500 shrink-0" />
                        <span className="truncate">
                          {staff.subOffice || staff.subOrBranchOffice || 'Dadabari S.O.'} · PIN{' '}
                          <strong className="font-mono">{staff.officePincode || '324009'}</strong>
                        </span>
                      </div>
                      {staff.email && staff.email !== 'N/A' && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail size={13} className="text-slate-500 shrink-0" />
                          <span className="truncate text-[11px]">{staff.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Action Footer */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <div className="font-mono font-black text-xs text-slate-900 flex items-center gap-1.5">
                      <Phone size={13} className="text-emerald-700" />
                      <span>{staff.contact || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {cleanPhone.length === 10 && (
                        <>
                          <a
                            href={`tel:+91${cleanPhone}`}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition"
                          >
                            <Phone size={11} />
                            <span>Call</span>
                          </a>
                          <a
                            href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                              `Namaste ${staff.name} ji, this is ${userProfile?.name || 'India Post Staff'} (${userProfile?.subOffice || 'Dadabari S.O.'}).`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-800 border border-green-300 text-[11px] font-bold flex items-center gap-1 transition"
                          >
                            <MessageCircle size={11} />
                            <span>WhatsApp</span>
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs">
          <div className="text-slate-600 font-medium">
            Showing{' '}
            <strong className="text-slate-900">
              {filteredStaff.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
              {Math.min(safePage * pageSize, filteredStaff.length)}
            </strong>{' '}
            of <strong className="text-slate-900">{filteredStaff.length}</strong> colleagues
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 font-bold text-slate-700 flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>
            <span className="px-3 py-1.5 font-mono font-bold text-slate-800">
              Page {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 font-bold text-slate-700 flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
