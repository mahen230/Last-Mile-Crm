import React, { useState } from 'react';
import { Settings, Shield, User, Database, RefreshCw, CheckCircle2, Download } from 'lucide-react';
import { customerService } from '../../services/customerService';

export default function SettingsView() {
  const [currentRole, setCurrentRole] = useState<'Admin' | 'Manager' | 'Support' | 'Postman' | 'Customer'>('Admin');
  const [officeName, setOfficeName] = useState('Dadabari Sub-Post Office (SO)');
  const [pincode, setPincode] = useState('324009');
  const [city, setCity] = useState('Kota, Rajasthan');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetToMaster = () => {
    if (window.confirm('Are you sure you want to reset and reload the verified Master Source dataset?')) {
      customerService.resetToInitialData();
      alert('Database successfully reset to verified Master Source records.');
    }
  };

  return (
    <div className="space-y-6" id="settings-view-root">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings size={22} className="text-red-700" />
          <span>System Settings & Operational Configuration</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Postal jurisdiction configuration, role-based access control, and database maintenance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Postal Sub-Office Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Postal Office & Jurisdiction Profile</h3>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 size={15} /> Settings successfully saved.
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sub-Post Office Name</label>
              <input
                type="text"
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Postal Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City / Region</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Active Delivery Beats</label>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-medium">
                Beat 2 (Sector 6, 7 & Santoshi Nagar), Beat 6 (Sector 4 & 2), Mandaliya BO
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-xl text-xs shadow-xs"
              >
                Save Configuration
              </button>
            </div>
          </form>
        </div>

        {/* Role & Access Simulator */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Active Operator Role & Permissions</h3>
          <p className="text-xs text-slate-500">
            Switch simulation role to preview role-based access control (RBAC):
          </p>

          <div className="space-y-2">
            {(['Admin', 'Manager', 'Support', 'Postman', 'Customer'] as const).map((role) => (
              <div
                key={role}
                onClick={() => setCurrentRole(role)}
                className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                  currentRole === role
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div>
                  <span className="font-bold block">{role} Role</span>
                  <span className={`text-[11px] ${currentRole === role ? 'text-slate-300' : 'text-slate-500'}`}>
                    {role === 'Admin' && 'Full CRUD, conflict merge, master import/export'}
                    {role === 'Manager' && 'Reports, staff allocation, lead approvals'}
                    {role === 'Support' && 'Customer directory, inquiry response, follow-ups'}
                    {role === 'Postman' && 'Beat tasks, doorstep KYC, CELC biometrics'}
                    {role === 'Customer' && 'Citizen self-service portal, track inquiry status'}
                  </span>
                </div>
                {currentRole === role && <CheckCircle2 size={16} className="text-amber-400" />}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 text-xs mb-2">Master Database Diagnostics</h4>
            <div className="flex gap-2">
              <button
                onClick={handleResetToMaster}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-300"
              >
                <RefreshCw size={14} />
                <span>Reload Verified Master Dataset</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
