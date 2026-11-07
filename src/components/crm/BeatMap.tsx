import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  Info,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Phone,
  Building2,
  Search,
} from 'lucide-react';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { customerService } from '../../services/customerService';
import { staffPermissionService } from '../../services/staffPermissionService';
import { Customer } from '../../types/models';

// Helper to safely format address regardless of whether customer.address is a string or an object
const formatCustomerAddress = (c: Customer | null | undefined): string => {
  if (!c) return '';
  if (typeof c.address === 'string' && c.address.trim()) {
    return c.address;
  }
  if (c.address && typeof c.address === 'object') {
    if (c.address.fullAddress) return c.address.fullAddress;
    const parts = [
      c.address.houseNumber || c.address.houseNo || c.houseNo,
      c.address.block && c.address.block !== c.address.sector ? c.address.block : null,
      c.address.sector || c.address.sectorLocality || c.sector,
      c.address.colony || c.address.area || c.colony || c.area,
      c.address.pincode || c.pincode ? `PIN ${c.address.pincode || c.pincode}` : null
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
  }
  const fallback = [
    c.houseNo,
    c.block,
    c.sector,
    c.colony || c.area,
    c.pincode ? `PIN ${c.pincode}` : null
  ].filter(Boolean);
  return fallback.length > 0 ? fallback.join(', ') : 'Dadabari S.O. Jurisdiction, Kota';
};

export default function BeatMap() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedBeat, setSelectedBeat] = useState('1');
  const [selectedStop, setSelectedStop] = useState<Customer | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Check if a real, valid Google Maps API Key is configured
  const rawApiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;
  const hasValidGoogleMapsKey = useMemo(() => {
    return (
      typeof rawApiKey === 'string' &&
      rawApiKey.trim().length > 15 &&
      rawApiKey !== 'DEMO_MAP_ID' &&
      !rawApiKey.includes('DEMO')
    );
  }, [rawApiKey]);

  useEffect(() => {
    const allCust = customerService.getCustomers();
    setCustomers(allCust);
  }, []);

  const beatsList = useMemo(() => {
    const uniqueBeats = new Set<string>();
    customers.forEach((c) => {
      if (c.beatNo) uniqueBeats.add(c.beatNo);
    });
    // Add default beats 1..33
    for (let i = 1; i <= 33; i++) {
      uniqueBeats.add(i.toString());
    }
    return Array.from(uniqueBeats).sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const beatMatch = c.beatNo === selectedBeat || c.beatNo === `Beat ${selectedBeat}`;
      if (!beatMatch) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const addrText = formatCustomerAddress(c).toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          addrText.includes(q) ||
          (c.mobile && c.mobile.includes(q))
        );
      }
      return true;
    });
  }, [customers, selectedBeat, searchFilter]);

  // Derive pseudo coordinates for beat stops around Kota/Rajasthan hub
  const baseLat = 25.18;
  const baseLng = 75.83;

  const plottedStops = useMemo(() => {
    return filteredCustomers.map((c, idx) => {
      // Deterministic spread based on customer ID hash
      const hash = c.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const angle = (idx * (360 / Math.max(filteredCustomers.length, 1)) * Math.PI) / 180;
      const radius = 0.005 + ((hash % 100) / 100) * 0.015;
      return {
        customer: c,
        seq: idx + 1,
        lat: baseLat + Math.sin(angle) * radius,
        lng: baseLng + Math.cos(angle) * radius,
        xPercent: 50 + Math.cos(angle) * (35 + (hash % 10)),
        yPercent: 50 + Math.sin(angle) * (35 + ((hash >> 2) % 10)),
      };
    });
  }, [filteredCustomers]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Navigation className="text-red-700" size={26} />
              <span>Postman Beat Route & Spatial Delivery GIS</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
              Field GIS
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Visual sequence planner and doorstep delivery map for postal beat operations across Rajasthan Circle.
          </p>
        </div>

        {/* Beat Selection & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-600 uppercase">Select Beat:</span>
            <select
              value={selectedBeat}
              onChange={(e) => setSelectedBeat(e.target.value)}
              className="bg-white font-bold text-slate-900 text-sm px-2 py-1 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              {beatsList.map((b) => (
                <option key={b} value={b}>
                  Beat {b}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search stop in beat..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* Main Map View Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Center: Interactive Map Canvas */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Compass className="text-red-600" size={18} />
              <span className="font-bold text-slate-800 text-sm">
                Beat {selectedBeat} Delivery Waypoints ({plottedStops.length} stops)
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Mode: {hasValidGoogleMapsKey ? 'Google Maps JavaScript API' : 'Standalone Vector GIS Canvas'}
            </span>
          </div>

          <div className="relative w-full h-[540px] bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 rounded-xl overflow-hidden border border-slate-800">
            {hasValidGoogleMapsKey ? (
              <APIProvider apiKey={rawApiKey}>
                <GoogleMap
                  defaultCenter={{ lat: baseLat, lng: baseLng }}
                  defaultZoom={14}
                  mapId="DELIVERY_BEAT_MAP"
                  className="w-full h-full"
                >
                  {plottedStops.map((stop) => (
                    <AdvancedMarker
                      key={stop.customer.id}
                      position={{ lat: stop.lat, lng: stop.lng }}
                      onClick={() => setSelectedStop(stop.customer)}
                    >
                      <Pin
                        background="#dc2626"
                        glyphColor="#ffffff"
                        borderColor="#991b1b"
                        scale={1.1}
                      />
                    </AdvancedMarker>
                  ))}
                </GoogleMap>
              </APIProvider>
            ) : (
              /* Vector GIS Map with Grid, Post Office Hub & Connected Delivery Paths */
              <div className="relative w-full h-full select-none overflow-hidden flex items-center justify-center">
                {/* SVG Route Paths & Grids */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
                  <defs>
                    <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#gridPattern)" />

                  {/* Connected Delivery Sequence Path */}
                  {plottedStops.length > 1 && (
                    <polyline
                      points={plottedStops.map((s) => `${s.xPercent}%,${s.yPercent}%`).join(' ')}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2.5"
                      strokeDasharray="6,4"
                      className="animate-pulse"
                    />
                  )}
                </svg>

                {/* Central Post Office Hub Marker */}
                <div
                  className="absolute z-20 flex flex-col items-center cursor-pointer group"
                  style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                >
                  <div className="w-10 h-10 rounded-full bg-red-600 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                    <Building2 size={20} />
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded-md bg-slate-900/90 text-[10px] text-white font-bold border border-slate-700 whitespace-nowrap shadow-md">
                    Delivery P.O. Hub (Beat {selectedBeat})
                  </span>
                </div>

                {/* Delivery Waypoint Markers */}
                {plottedStops.map((stop) => {
                  const isSelected = selectedStop?.id === stop.customer.id;
                  return (
                    <button
                      key={stop.customer.id}
                      type="button"
                      onClick={() => setSelectedStop(stop.customer)}
                      className="absolute z-30 flex flex-col items-center group cursor-pointer focus:outline-hidden"
                      style={{
                        left: `${stop.xPercent}%`,
                        top: `${stop.yPercent}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg transition-transform ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-300/40 scale-125'
                            : 'bg-red-700 text-white border-2 border-white group-hover:scale-110'
                        }`}
                      >
                        {stop.seq}
                      </div>
                      <span className="mt-1 px-1.5 py-0.5 rounded-sm bg-black/80 text-[9px] text-slate-200 font-semibold max-w-[100px] truncate shadow-xs">
                        {stop.customer.name}
                      </span>
                    </button>
                  );
                })}

                {/* Empty State if no stops */}
                {plottedStops.length === 0 && (
                  <div className="text-center p-6 bg-slate-900/80 rounded-xl border border-slate-800 text-slate-300 max-w-sm">
                    <MapPin className="mx-auto text-red-500 mb-2" size={32} />
                    <p className="font-bold">No customers assigned to Beat {selectedBeat} yet.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Add customers in the CRM or map them to this beat from Colony-Beat Master.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>● Red markers represent sequential delivery stops (Stop 1 → Stop {plottedStops.length}).</span>
            <span>Click any marker to inspect customer profile & delivery details.</span>
          </div>
        </div>

        {/* Right Panel: Delivery Sequence & Customer Stop Inspector */}
        <div className="space-y-4">
          {/* Active Stop Detail Card */}
          {selectedStop ? (
            <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                    Selected Waypoint
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-1">{selectedStop.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStop(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{formatCustomerAddress(selectedStop)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  <span className="font-mono">{selectedStop.mobile || 'No contact number'}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-medium">
                  <span>Assigned Beat:</span>
                  <span className="font-bold text-slate-900">Beat {selectedStop.beatNo}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center py-8">
              <MapPin className="mx-auto text-slate-300 mb-2" size={32} />
              <h4 className="font-bold text-slate-700 text-sm">No Stop Selected</h4>
              <p className="text-xs text-slate-400 mt-1">
                Select a stop from the map or list below to inspect delivery instructions.
              </p>
            </div>
          )}

          {/* Sequential Stops List */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Delivery Sequence</h3>
              <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                {plottedStops.length} Total
              </span>
            </div>

            <div className="max-h-[340px] overflow-y-auto space-y-2 pr-1">
              {plottedStops.map((stop) => (
                <div
                  key={stop.customer.id}
                  onClick={() => setSelectedStop(stop.customer)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                    selectedStop?.id === stop.customer.id
                      ? 'border-red-400 bg-red-50/70'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-150 text-slate-700 font-black text-[10px] flex items-center justify-center shrink-0">
                      {stop.seq}
                    </span>
                    <div className="truncate">
                      <p className="font-bold text-slate-800 truncate">{stop.customer.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{formatCustomerAddress(stop.customer)}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 ml-2">Beat {stop.customer.beatNo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
