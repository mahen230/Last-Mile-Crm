import React, { useState } from 'react';
import {
  MapPin,
  Check,
  Search,
  Clock,
  Navigation,
  X,
} from 'lucide-react';
import { SupportedLanguage, translate } from '../../utils/localization';
import {
  PINCODE_OFFICE_HUBS,
  PincodeOfficeHub,
  detectNearestPincodeHub,
} from '../../services/pincodeOperationsService';

export interface VicinityZone {
  pincode: string;
  name: string;
  officeName: string;
  division: string;
  slaMinutes: string;
  beatsCount: number;
  beatManager: string;
  localStockingPartner: string;
  whatsappPhone: string;
  landmarks: string[];
  isDefault?: boolean;
}

export function toVicinityZone(hub: PincodeOfficeHub): VicinityZone {
  return {
    pincode: hub.pincode,
    name: hub.name,
    officeName: hub.officeName,
    division: hub.division,
    slaMinutes: `${hub.slaMinutes} Min Express Delivery`,
    beatsCount: hub.beatsCount,
    beatManager: hub.beatManager,
    localStockingPartner: hub.localStockingPartner,
    whatsappPhone: hub.whatsappPhone,
    landmarks: hub.landmarks,
    isDefault: hub.isDefault,
  };
}

export const KOTA_VICINITY_ZONES: VicinityZone[] = PINCODE_OFFICE_HUBS.map(toVicinityZone);

interface LocationVicinityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePincode: string;
  onSelectPincode: (zone: VicinityZone) => void;
  lang: SupportedLanguage;
}

export function LocationVicinityModal({
  isOpen,
  onClose,
  activePincode,
  onSelectPincode,
  lang,
}: LocationVicinityModalProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const [locating, setLocating] = useState(false);

  if (!isOpen) return null;

  const filtered = KOTA_VICINITY_ZONES.filter(
    (z) =>
      z.pincode.includes(filterQuery) ||
      z.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      z.officeName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      z.division.toLowerCase().includes(filterQuery.toLowerCase()) ||
      z.localStockingPartner.toLowerCase().includes(filterQuery.toLowerCase()) ||
      z.landmarks.some((l) => l.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const handleUseMyLocation = async () => {
    setLocating(true);
    try {
      const { hub } = await detectNearestPincodeHub();
      onSelectPincode(toVicinityZone(hub));
      onClose();
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-label="Select Vicinity Zone and Pincode"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-700 flex items-center justify-center text-white shrink-0 shadow-xs">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight leading-tight">
                {translate('select_pincode', lang)}
              </h3>
              <p className="text-xs text-amber-300">
                13 Kota &amp; Baran Division Hubs · Instant Beat &amp; Stocking Partner Routing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Auto-Locate Button */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 space-y-3 bg-slate-50/50 dark:bg-zinc-950/40">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search PIN (324009, 325205) or area (Dadabari, Talwandi, Baran)..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={locating}
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-60"
          >
            <Navigation size={13} className={locating ? 'animate-spin' : ''} />
            <span>
              {locating
                ? 'Detecting Nearest Pincode Hub...'
                : `${translate('location_near_me', lang)} · Auto-Detect Nearest Pincode`}
            </span>
          </button>
        </div>

        {/* Zones List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
          {filtered.map((zone) => {
            const isSelected = zone.pincode === activePincode;
            return (
              <button
                key={zone.pincode}
                type="button"
                onClick={() => {
                  onSelectPincode(zone);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-red-50/80 dark:bg-red-950/30 border-red-500 shadow-xs'
                    : 'bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/60 border-slate-200 dark:border-zinc-800'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-red-700 dark:text-red-400 px-2 py-0.5 rounded bg-red-100 dark:bg-red-950/60 tabular-nums">
                      PIN {zone.pincode}
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {zone.name}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Office: <span className="font-medium text-slate-700 dark:text-slate-300">{zone.officeName}</span> · {zone.division} · {zone.beatsCount} Beats
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    Stocking Partner: <span className="font-semibold text-slate-900 dark:text-white">{zone.localStockingPartner}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400 pt-0.5">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Clock size={11} />
                      <span>{zone.slaMinutes}</span>
                    </span>
                    <span>·</span>
                    <span>Lead: {zone.beatManager}</span>
                  </div>

                  <div className="text-[10px] text-slate-400 truncate">
                    Landmarks: {zone.landmarks.join(', ')}
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-red-700 text-white flex items-center justify-center shadow-xs">
                      <Check size={14} />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-slate-300 dark:border-zinc-700" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>All 13 Kota &amp; Baran Hubs mapped to Speed Post COD</span>
          <span className="font-bold text-emerald-700 dark:text-emerald-400">₹15 Flat Fee</span>
        </div>
      </div>
    </div>
  );
}
