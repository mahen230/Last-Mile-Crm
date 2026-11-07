import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Map, MapPin, Building, ShieldCheck, 
  Navigation, CheckCircle2, ArrowRight, Home, Users, Fuel 
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { customerService } from '../../services/customerService';

export default function MyBeatDirectoryView() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const beatNo = userProfile?.beat || 'Beat 2';
  const colonies = userProfile?.assignedColonies || ['Keshavpura Sector 7', 'Keshavpura Sector 6', 'Patel Nagar', 'Santoshi Nagar'];
  const fixedKm = userProfile?.fixedKm || 18;
  const office = userProfile?.subOffice || userProfile?.assignedOffice || 'Dadabari S.O. (324009)';

  const beatProps = customerService.getScopedProperties(userProfile);
  const beatCustomers = customerService.getScopedCustomers(userProfile);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 mb-2">
            <ShieldCheck size={14} /> Assigned Postal Beat
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {beatNo} Operations Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Jurisdiction: <strong>{office}</strong> • Rajasthan Circle • Kota Division
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/beats-map')}
            className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Navigation size={15} /> Open Delivery Map
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Assigned Beat</span>
          <div className="text-xl font-black text-slate-900 mt-1">{beatNo}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Primary delivery beat</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Properties</span>
          <div className="text-xl font-black text-slate-900 mt-1">{beatProps.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">In your beat zone</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Linked Residents</span>
          <div className="text-xl font-black text-slate-900 mt-1">{beatCustomers.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Authorized member profiles</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Sanctioned Beat KM</span>
          <div className="text-xl font-black text-slate-900 mt-1">{fixedKm} KM</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Fixed daily beat distance</div>
        </div>
      </div>

      {/* Colonies in Beat */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MapPin size={16} className="text-red-700" />
          <span>Covered Colonies, Sectors & Landmarks</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {colonies.map((col, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-800">{col}</div>
                <div className="text-[10px] text-slate-500">PIN 324009 • Dadabari S.O. Beat {beatNo}</div>
              </div>
              <button
                onClick={() => navigate('/properties')}
                className="text-xs text-red-700 hover:text-red-800 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <span>Browse</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/daily-verification')}
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-red-300 transition shadow-xs cursor-pointer space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center group-hover:scale-105 transition">
            <CheckCircle2 size={20} />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Daily 10-Property Verification</h3>
          <p className="text-xs text-slate-500">Conduct doorstep status, GPS and address audit for today's target.</p>
        </div>

        <div
          onClick={() => navigate('/properties')}
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition shadow-xs cursor-pointer space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition">
            <Home size={20} />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Beat Property Directory</h3>
          <p className="text-xs text-slate-500">Browse houses, apartments, shops and linked resident units.</p>
        </div>

        <div
          onClick={() => navigate('/unified-properties')}
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 transition shadow-xs cursor-pointer space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
            <Users size={20} />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Register New Property / Member</h3>
          <p className="text-xs text-slate-500">Add a newly surveyed doorstep property in your assigned beat.</p>
        </div>
      </div>
    </div>
  );
}
