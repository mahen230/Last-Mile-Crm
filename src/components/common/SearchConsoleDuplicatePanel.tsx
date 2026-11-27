import React from 'react';
import { AlertTriangle, CheckCircle2, Search, ShieldCheck } from 'lucide-react';
import {
  CustomerDuplicateDetectionResult,
  PropertyDuplicateDetectionResult,
} from '../../services/commonDataCentreService';
import { StaffAttributionLink } from './StaffAttributionModal';

interface SearchConsoleDuplicatePanelProps {
  entityType: 'PROPERTY' | 'CUSTOMER';
  propertyCheck?: PropertyDuplicateDetectionResult | null;
  customerCheck?: CustomerDuplicateDetectionResult | null;
  remark: string;
  onRemarkChange: (value: string) => void;
  forceShowRemark?: boolean;
  layer1Ok: boolean;
  layer2Ok: boolean;
  layer2Reason?: string;
}

export function SearchConsoleDuplicatePanel({
  entityType,
  propertyCheck,
  customerCheck,
  remark,
  onRemarkChange,
  forceShowRemark = false,
  layer1Ok,
  layer2Ok,
  layer2Reason,
}: SearchConsoleDuplicatePanelProps) {
  const hasMatch =
    entityType === 'PROPERTY'
      ? Boolean(propertyCheck?.hasMatch)
      : Boolean(customerCheck?.hasMatch);
  const matchReasons =
    entityType === 'PROPERTY'
      ? propertyCheck?.matchReasons || []
      : customerCheck?.matchReasons || [];
  const showRemarkBox = hasMatch || forceShowRemark;
  const remarkSatisfied = !showRemarkBox || remark.trim().length > 0;
  const effectiveLayer1Ok = layer1Ok && remarkSatisfied;

  return (
    <div className="space-y-3 text-xs">
      {/* Live Search Console Duplicate / Already-Exists Check */}
      {hasMatch && (
        <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-950 font-bold">
              <AlertTriangle size={15} className="text-amber-700 shrink-0" />
              <span>Already Exists / Duplicate Match</span>
            </div>
            <span className="text-[11px] font-medium text-amber-900">
              {matchReasons.join(' · ')}
            </span>
          </div>

          {entityType === 'PROPERTY' && propertyCheck && (
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {propertyCheck.matches.slice(0, 4).map((m) => (
                <div
                  key={`${m.source}-${m.id}`}
                  className="p-2.5 rounded-lg bg-white border border-amber-200 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-slate-900">
                      {m.code} · {m.title}
                    </span>
                    <span className="text-[11px] text-slate-600 tabular-nums">
                      {m.beatNo} · PIN {m.pincode} · {m.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 truncate">{m.address}</div>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span>{m.matchReason}</span>
                    {m.staffAttribution && (
                      <StaffAttributionLink attribution={m.staffAttribution} compact />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {entityType === 'CUSTOMER' && customerCheck && (
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {customerCheck.matches.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-lg bg-white border border-amber-200 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">
                      {c.name} ({c.masterId || c.id})
                    </span>
                    <span className="font-mono text-[11px] text-slate-700 tabular-nums">
                      {c.mobile} · {c.beatNo || 'Beat 2'} · PIN {c.pincode || '324009'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 truncate">
                    {[c.houseNo, c.sector, c.colony || c.area].filter(Boolean).join(', ')}
                    {c.propertyId ? ` · Property ${c.propertyId}` : ''}
                  </div>
                  {(c.staffAttribution || c.enteredByName) && (
                    <StaffAttributionLink
                      attribution={c.staffAttribution}
                      staffId={c.submittedByStaffId || c.assignedStaffId}
                      fallbackName={c.enteredByName || c.assignedStaffName}
                      compact
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mandatory Remark Section when existing/matched data is shown or updated */}
      {showRemarkBox && (
        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
          <label className="block font-bold text-slate-900">
            Remark (Required for Existing / Matched Record) *
          </label>
          <textarea
            rows={2}
            required
            value={remark}
            onChange={(e) => onRemarkChange(e.target.value)}
            placeholder="Record reason for update, verification note, or duplicate merge context..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
          {!remark.trim() && (
            <div className="text-[11px] text-amber-800 font-medium">
              Enter a Remark to pass Layer 1 Verification before committing to the Master Store.
            </div>
          )}
        </div>
      )}

      {/* Three-Layer Verification Readiness Summary */}
      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-blue-700" />
            <span>Three-Layer Verification Gate</span>
          </span>
          <span className="font-mono text-slate-500 flex items-center gap-1">
            <Search size={11} /> Search Console Synced
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-700">
            <CheckCircle2
              size={13}
              className={effectiveLayer1Ok ? 'text-emerald-700 shrink-0' : 'text-slate-400 shrink-0'}
            />
            <span>1. Schema &amp; Dup/Remark</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <CheckCircle2
              size={13}
              className={layer2Ok ? 'text-emerald-700 shrink-0' : 'text-red-600 shrink-0'}
            />
            <span>2. Staff &amp; Beat/PIN Scope</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700">
            <CheckCircle2
              size={13}
              className={
                effectiveLayer1Ok && layer2Ok ? 'text-emerald-700 shrink-0' : 'text-slate-400 shrink-0'
              }
            />
            <span>3. Master Sync &amp; Commit</span>
          </div>
        </div>
        {!layer2Ok && layer2Reason && (
          <div className="text-[11px] text-red-700 font-medium pt-0.5">{layer2Reason}</div>
        )}
      </div>
    </div>
  );
}
