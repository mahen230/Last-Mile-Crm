import React, { useEffect, useState } from 'react';
import { Check, Plus, ShieldCheck, Users } from 'lucide-react';
import {
  MAX_OPERATIONAL_STAFF_COUNT,
  staffPermissionService,
} from '../../services/staffPermissionService';
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

  useEffect(() => {
    const u1 = staffPermissionService.subscribe(() => setTick((t) => t + 1));
    const u2 = brandOwnerService.subscribe(() => setTick((t) => t + 1));
    return () => {
      u1();
      u2();
    };
  }, []);

  const coreFiveStaff: StaffProfile[] = staffPermissionService.getOperationalStaffFive();
  const normBrand = brandSlug.trim().toLowerCase();

  const assignedCount = coreFiveStaff.filter((st) => {
    const brands = (st.assignedBrands || [st.brandId || 'india-post']).map((b) =>
      b.trim().toLowerCase()
    );
    return brands.includes(normBrand);
  }).length;

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
          ? `Removed ${staff.name} (Staff ${staff.staffSlotNumber || ''}) from ${brandName}.`
          : `Allocated ${staff.name} (Staff ${staff.staffSlotNumber || ''}) to ${brandName}.`,
      });
    }
    setTimeout(() => setNotice(null), 4500);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono uppercase text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-slate-700" />
            <span>
              Fixed {MAX_OPERATIONAL_STAFF_COUNT}-Staff Roster · Allocate Across Brands Without Cloning
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            <Users size={16} className="text-slate-700" />
            <span>
              {brandName} · Core Staff Allocation ({assignedCount} / {coreFiveStaff.length} Assigned)
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            All brands share the canonical {MAX_OPERATIONAL_STAFF_COUNT} operational profiles (Staff 1–Staff 5). Assign or remove slots below instead of creating extra staff logins.
          </p>
        </div>

        <div className="text-xs font-mono tabular-nums text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 shrink-0 whitespace-nowrap">
          Slots Used: {coreFiveStaff.length} / {MAX_OPERATIONAL_STAFF_COUNT}
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
              <th className="py-3 px-4 whitespace-nowrap">Slot</th>
              <th className="py-3 px-4">Staff Profile</th>
              <th className="py-3 px-4">Role &amp; Territory</th>
              <th className="py-3 px-4">Brand Allocations</th>
              <th className="py-3 px-4 text-right whitespace-nowrap">{brandName} Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {coreFiveStaff.map((staff, idx) => {
              const slotNum = staff.staffSlotNumber || idx + 1;
              const allocatedSlugs = (
                staff.assignedBrands && staff.assignedBrands.length > 0
                  ? staff.assignedBrands
                  : [staff.brandId || 'india-post']
              ).map((b) => b.trim().toLowerCase());
              const isAssignedHere = allocatedSlugs.includes(normBrand);

              return (
                <tr key={staff.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap tabular-nums">
                    Staff {slotNum}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{staff.name}</div>
                    <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                      {staff.employeeId || staff.id} · {staff.contact || staff.email}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">
                      {staff.designationType || staff.role}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {staff.assignedOffice || 'Kota Division'} · {staff.beat || 'Assigned Beat'}
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
    </section>
  );
}
