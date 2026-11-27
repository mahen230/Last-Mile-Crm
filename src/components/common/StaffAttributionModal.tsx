import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  Building2,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Route,
  UserCheck,
  X,
} from 'lucide-react';
import { StaffAttributionRecord, StaffProfile } from '../../types/models';
import { commonDataCentreService } from '../../services/commonDataCentreService';

interface StaffAttributionLinkProps {
  attribution?: StaffAttributionRecord | null;
  staffId?: string | null;
  fallbackName?: string;
  compact?: boolean;
}

export function StaffAttributionLink({
  attribution,
  staffId,
  fallbackName,
  compact = false,
}: StaffAttributionLinkProps) {
  const [open, setOpen] = useState(false);

  const effectiveId = attribution?.employeeId || attribution?.staffId || staffId || '';
  const displayName = attribution?.staffName || fallbackName || '';

  if (!effectiveId && !displayName) {
    return null;
  }

  const liveProfile: StaffProfile | null = commonDataCentreService.resolveStaffFullProfile(
    effectiveId || attribution?.email || displayName
  );

  const resolved = {
    staffId: attribution?.staffId || liveProfile?.id || effectiveId,
    employeeId: attribution?.employeeId || liveProfile?.employeeId || effectiveId,
    staffName: attribution?.staffName || liveProfile?.name || displayName || 'Staff Member',
    role: attribution?.role || liveProfile?.role || 'STAFF',
    officialPost:
      attribution?.officialPost || liveProfile?.officialPost || liveProfile?.designation || 'Postal Staff',
    officeName: attribution?.officeName || liveProfile?.assignedOffice || liveProfile?.subOffice || 'Dadabari S.O.',
    pincode: attribution?.pincode || liveProfile?.officePincode || '324009',
    beat: attribution?.beat || liveProfile?.beat || 'Beat 2',
    contact: attribution?.contact || liveProfile?.contact || '',
    email: attribution?.email || liveProfile?.email || '',
    profilePath:
      attribution?.profilePath ||
      `/india-post?tab=STAFF_ROLES&staffId=${encodeURIComponent(effectiveId || liveProfile?.id || '')}`,
    recordedAt: attribution?.recordedAt,
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={`inline-flex items-center gap-1.5 text-left text-blue-700 hover:text-blue-900 hover:underline font-semibold cursor-pointer ${
          compact ? 'text-[11px]' : 'text-xs'
        }`}
        title="Inspect Complete Staff Profile & Attribution"
      >
        <UserCheck size={compact ? 12 : 13} className="shrink-0" />
        <span className="truncate">
          {resolved.staffName}
          {resolved.employeeId ? ` (${resolved.employeeId})` : ''} · Complete Staff Profile
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            e.stopPropagation();
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-mono text-amber-300">
                  STAFF ATTRIBUTION · COMPLETE PROFILE
                </div>
                <h3 className="text-sm font-bold text-white truncate mt-0.5">
                  {resolved.staffName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close staff profile"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Staff / Employee ID</div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5 tabular-nums">
                    {resolved.employeeId || resolved.staffId || '—'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500">Post / Role</div>
                  <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                    <BadgeCheck size={13} className="text-emerald-700 shrink-0" />
                    <span className="truncate">{resolved.officialPost || resolved.role}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Building2 size={13} /> Office &amp; PIN
                  </span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {resolved.officeName} · PIN {resolved.pincode}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Route size={13} /> Assigned Beat
                  </span>
                  <span className="font-semibold text-slate-900">{resolved.beat}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Phone size={13} /> Contact
                  </span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {resolved.contact || 'Not listed'}
                  </span>
                </div>
                {resolved.email && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Mail size={13} /> Email
                    </span>
                    <span className="font-mono text-slate-900 truncate">{resolved.email}</span>
                  </div>
                )}
                {resolved.recordedAt && (
                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <MapPin size={13} /> Attribution Timestamp
                    </span>
                    <span className="font-mono text-[11px] text-slate-600 tabular-nums">
                      {resolved.recordedAt.slice(0, 19).replace('T', ' ')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <Link
                  to={resolved.profilePath}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1.5 font-semibold text-blue-700 hover:underline whitespace-nowrap"
                >
                  <ExternalLink size={13} />
                  <span>Open in Staff Directory</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
