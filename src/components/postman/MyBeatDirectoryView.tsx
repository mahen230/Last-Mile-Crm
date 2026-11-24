import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Map, MapPin, Building, ShieldCheck, 
  Navigation, CheckCircle2, ArrowRight, Home, Users, Fuel, Store
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { customerService } from '../../services/customerService';

export default function MyBeatDirectoryView() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [colonyPage, setColonyPage] = React.useState(1);
  const COLONIES_PER_PAGE = 5;

  const beatNo = userProfile?.beat || 'Beat 2';
  const colonies = userProfile?.assignedColonies || ['Keshavpura Sector 7', 'Keshavpura Sector 6', 'Patel Nagar', 'Santoshi Nagar'];
  const fixedKm = userProfile?.fixedKm || 18;
  const office = userProfile?.subOffice || userProfile?.assignedOffice || 'Dadabari S.O. (324009)';

  const beatProps = customerService.getScopedProperties(userProfile);
  const beatCustomers = customerService.getScopedCustomers(userProfile);

  const totalColonyPages = Math.max(1, Math.ceil(colonies.length / COLONIES_PER_PAGE));
  const safeColonyPage = Math.min(colonyPage, totalColonyPages);
  const paginatedColonies = colonies.slice(
    (safeColonyPage - 1) * COLONIES_PER_PAGE,
    safeColonyPage * COLONIES_PER_PAGE
  );

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-800 via-rose-700 to-amber-700 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-amber-200 text-xs font-bold border border-white/25 mb-2">
            <ShieldCheck size={14} /> Assigned Postal Beat · Beats 1–34 Directory
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {beatNo} Operations Hub
          </h1>
          <p className="text-xs text-rose-100 mt-0.5">
            Jurisdiction: <strong className="text-white">{office}</strong> • Rajasthan Circle • Kota Division
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/beats-map')}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Navigation size={15} /> Open Delivery Map
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-200 shadow-xs">
          <span className="text-[11px] font-bold text-indigo-700 uppercase">Assigned Beat</span>
          <div className="text-xl font-black text-indigo-950 mt-1 tabular-nums">{beatNo}</div>
          <div className="text-[11px] text-indigo-600 mt-0.5">Primary delivery beat</div>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase">Total Properties</span>
          <div className="text-xl font-black text-emerald-950 mt-1 font-mono tabular-nums">{beatProps.length}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">In your beat zone</div>
        </div>

        <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl border border-sky-200 shadow-xs">
          <span className="text-[11px] font-bold text-sky-700 uppercase">Linked Residents</span>
          <div className="text-xl font-black text-sky-950 mt-1 font-mono tabular-nums">{beatCustomers.length}</div>
          <div className="text-[11px] text-sky-600 mt-0.5">Authorized member profiles</div>
        </div>

        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-800 uppercase">Sanctioned Beat KM</span>
          <div className="text-xl font-black text-amber-950 mt-1 font-mono tabular-nums">{fixedKm} KM</div>
          <div className="text-[11px] text-amber-700 mt-0.5">Fixed daily @ ₹3.60/KM</div>
        </div>
      </div>

      {/* Colonies in Beat */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <MapPin size={16} className="text-red-700" />
            <span>Covered Colonies, Sectors &amp; Landmarks ({colonies.length})</span>
          </h2>
          {totalColonyPages > 1 && (
            <span className="text-[11px] font-bold text-slate-500">
              Page {safeColonyPage} / {totalColonyPages}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paginatedColonies.map((col, idx) => (
            <div key={`${col}-${idx}`} className="p-3.5 bg-gradient-to-r from-slate-50 to-rose-50/40 rounded-2xl border border-rose-200/70 flex items-center justify-between hover:border-red-300 transition">
              <div className="space-y-0.5">
                <div className="text-xs font-black text-slate-900">{col}</div>
                <div className="text-[10px] text-slate-600 font-medium">PIN {userProfile?.officePincode || '324009'} • {office} • {beatNo}</div>
              </div>
              <button
                onClick={() => navigate('/properties')}
                className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
              >
                <span>Browse</span>
                <ArrowRight size={12} />
              </button>
            </div>
          ))}
        </div>

        {totalColonyPages > 1 && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Showing {(safeColonyPage - 1) * COLONIES_PER_PAGE + 1}–{Math.min(safeColonyPage * COLONIES_PER_PAGE, colonies.length)} of {colonies.length} colonies
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safeColonyPage <= 1}
                onClick={() => setColonyPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={safeColonyPage >= totalColonyPages}
                onClick={() => setColonyPage((p) => Math.min(totalColonyPages, p + 1))}
                className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/beat-merchant-register')}
          className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-300 hover:border-amber-500 hover:shadow-md transition shadow-xs cursor-pointer space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 text-white flex items-center justify-center group-hover:scale-105 transition shadow-xs">
            <Store size={20} />
          </div>
          <h3 className="font-black text-slate-900 text-sm">Beat Storefront &amp; Registration</h3>
          <p className="text-xs text-slate-600">Onboard local stores, 4-factor audit, and bind delivery pipeline.</p>
        </div>

        <div
          onClick={() => navigate('/daily-verification')}
          className="p-5 bg-gradient-to-br from-rose-50 to-white rounded-2xl border border-rose-200 hover:border-red-400 hover:shadow-md transition shadow-xs cursor-pointer space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 text-white flex items-center justify-center group-hover:scale-105 transition shadow-xs">
            <CheckCircle2 size={20} />
          </div>
          <h3 className="font-black text-slate-900 text-sm">Daily 10-Property Verification</h3>
          <p className="text-xs text-slate-600">Conduct doorstep status, GPS and address audit for today's target.</p>
        </div>

        <div
          onClick={() => navigate('/properties')}
          className="p-5 bg-gradient-to-br from-sky-50 to-white rounded-2xl border border-sky-200 hover:border-sky-400 hover:shadow-md transition shadow-xs cursor-pointer space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 text-white flex items-center justify-center group-hover:scale-105 transition shadow-xs">
            <Home size={20} />
          </div>
          <h3 className="font-black text-slate-900 text-sm">Beat Property Directory</h3>
          <p className="text-xs text-slate-600">Browse houses, apartments, shops and linked resident units.</p>
        </div>

        <div
          onClick={() => navigate('/unified-properties')}
          className="p-5 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition shadow-xs cursor-pointer space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center group-hover:scale-105 transition shadow-xs">
            <Users size={20} />
          </div>
          <h3 className="font-black text-slate-900 text-sm">Register New Property / Member</h3>
          <p className="text-xs text-slate-600">Add a newly surveyed doorstep property in your assigned beat.</p>
        </div>
      </div>
    </div>
  );
}
