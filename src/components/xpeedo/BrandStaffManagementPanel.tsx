import React, { useEffect, useMemo, useState } from 'react';
import { Check, Plus, Search, ShieldCheck, Users } from 'lucide-react';
import { staffPermissionService } from '../../services/staffPermissionService';
import { brandOwnerService } from '../../services/brandOwnerService';
import { StaffProfile } from '../../types/models';

export interface BrandStaffManagementPanelProps {
  brandSlug: string;
  brandName: string;
  actorName: string;
  accentColor?: string;
}

export default function BrandStaffManagementPanel({
  brandSlug,
  brandName,
  actorName,
  accentColor = '#1D4ED8',
}: BrandStaffManagementPanelProps) {
  const [, setTick] = useState(0);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'ASSIGNED' | 'AVAILABLE'>('ALL');
  const [showAllRows, setShowAllRows] = useState(false);

  useEffect(() => {
    const u1 = staffPermissionService.subscribe(() => setTick((t) => t + 1));
    const u2 = brandOwnerService.subscribe(() => setTick((t) => t + 1));
    return () => {
      u1();
      u2();
    };
  }, []);

  const normBrand = brandSlug.trim().toLowerCase();

  const operationalStaff: StaffProfile[] = useMemo(() => {
    return staffPermissionService.getAllStaffProfiles().filter((s) => {
      const roleUpper = String(s.role || '').toUpperCase();
      if (['OWNER', 'MASTER_ADMIN', 'DEVELOPER', 'SUPER_ADMIN'].includes(roleUpper)) {
        return false;
      }
      if (s.staffScopeType === 'XPOKART_PLATFORM') return false;
      return true;
    });
  }, []);

  const assignedCount = operationalStaff.filter((st) => {
    const brands = (st.assignedBrands || [st.brandId || 'india-post']).map((b) =>
      b.trim().toLowerCase()
    );
    return brands.includes(normBrand);
  }).length;

  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return operationalStaff.filter((st) => {
      const brands = (st.assignedBrands || [st.brandId || 'india-post']).map((b) =>
        b.trim().toLowerCase()
      );
      const isAssignedHere = brands.includes(normBrand);
      if (filterMode === 'ASSIGNED' && !isAssignedHere) return false;
      if (filterMode === 'AVAILABLE' && isAssignedHere) return false;
      if (!q) return true;
      return `${st.name} ${st.employeeId || ''} ${st.contact || ''} ${st.designationType || st.role} ${st.assignedOffice || ''} ${st.officePincode || ''} ${st.beat || ''}`
        .toLowerCase()
        .includes(q);
    });
  }, [operationalStaff, normBrand, filterMode, searchQuery]);

  const visibleStaff = showAllRows ? filteredStaff : filteredStaff.slice(0, 10);

  const handleToggleAllocation = (staff: StaffProfile, currentlyAssigned: boolean) => {
    const res = currentlyAssigned
      ? brandOwnerService.removeStaffFromBrand(brandSlug, staff.id, actorName)
      : brandOwnerService.allocateExistingStaffToBrand(brandSlug, staff.id, actorName);

    if ('error' in res && res.error) {
      setNotice({ type: 'err', text: res.error });
    } else {
      setNotice({
        type: 'ok',
        text: currentlyAssigned
          ? `Removed ${staff.name} from ${brandName}.`
          : `Allocated ${staff.name} to ${brandName}.`,
      });
    }
    setTimeout(() => setNotice(null), 4500);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono uppercase text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-slate-700" />
            <span>
              Unified Operational Roster · Allocate Staff Without Cloning
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            <Users size={16} className="text-slate-700" />
            <span>
              {brandName} · Staff Allocation ({assignedCount} / {operationalStaff.length} Assigned)
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Canonical India Post personnel are synced here. Allocate or remove access without creating duplicate credentials.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, EMP ID, PIN, beat..."
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
            />
          </div>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as 'ALL' | 'ASSIGNED' | 'AVAILABLE')}
            aria-label="Filter allocation status"
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-medium"
          >
            <option value="ALL">All Staff ({operationalStaff.length})</option>
            <option value="ASSIGNED">Assigned ({assignedCount})</option>
            <option value="AVAILABLE">Not Assigned ({operationalStaff.length - assignedCount})</option>
          </select>
          <div className="font-mono tabular-nums text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 shrink-0 whitespace-nowrap">
            Active Pool: {operationalStaff.length}
          </div>
        </div>
      </div>

      {notice && (
        <div
          className={`mx-5 mt-4 p-3 rounded-lg border text-xs font-medium ${
            notice.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-3 px-4 whitespace-nowrap">EMP / Code</th>
              <th className="py-3 px-4">Staff Profile</th>
              <th className="py-3 px-4">Role &amp; Territory</th>
              <th className="py-3 px-4">Brand Allocations</th>
              <th className="py-3 px-4 text-right whitespace-nowrap">{brandName} Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleStaff.map((staff) => {
              const allocatedSlugs = (
                staff.assignedBrands && staff.assignedBrands.length > 0
                  ? staff.assignedBrands
                  : [staff.brandId || 'india-post']
              ).map((b) => b.trim().toLowerCase());
              const isAssignedHere = allocatedSlugs.includes(normBrand);

              return (
                <tr key={staff.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap tabular-nums">
                    {staff.employeeId || staff.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{staff.name}</div>
                    <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                      {staff.contact || staff.email}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">
                      {staff.designationType || staff.role}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {staff.assignedOffice || staff.subOffice || 'Kota Division'} ·{' '}
                      <span className="font-mono tabular-nums">{staff.officePincode || '324009'}</span> ·{' '}
                      {staff.beat || 'Assigned Beat'}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                    {allocatedSlugs.join(' · ')}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleToggleAllocation(staff, isAssignedHere)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                        isAssignedHere
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-red-50 hover:text-red-800 hover:border-red-300'
                          : 'text-white'
                      }`}
                      style={!isAssignedHere ? { backgroundColor: accentColor } : undefined}
                    >
                      {isAssignedHere ? (
                        <>
                          <Check size={13} />
                          <span>Assigned · Remove</span>
                        </>
                      ) : (
                        <>
                          <Plus size={13} />
                          <span>Allocate to {brandName}</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredStaff.length > 10 && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-600 tabular-nums">
            Showing {visibleStaff.length} of {filteredStaff.length} operational staff
          </span>
          <button
            type="button"
            onClick={() => setShowAllRows((prev) => !prev)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 font-semibold text-slate-800 cursor-pointer whitespace-nowrap"
          >
            {showAllRows ? 'Show Compact (10)' : `Show All ${filteredStaff.length} Staff`}
          </button>
        </div>
      )}
    </section>
  );
}
