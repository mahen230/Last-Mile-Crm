import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Building2,
  MapPin,
  Phone,
  Mail,
  Lock,
  CheckCircle2,
  AlertTriangle,
  X,
  Save,
  KeyRound,
  IdCard,
} from 'lucide-react';
import { useAuth } from './FirebaseAuthProvider';
import {
  staffPermissionService,
  KOTA_OFFICE_MASTER_LIST,
  getDefaultFixedKmForBeat,
  DEFAULT_STAFF_FALLBACK_PASSWORD,
} from '../../services/staffPermissionService';
import { DesignationType } from '../../types/models';

const DESIGNATION_OPTIONS: DesignationType[] = [
  'Postman',
  'GDS (BPM / ABPM / Dak Sevak)',
  'PA (Postal Assistant)',
  'MTS (Multi Tasking Staff)',
  'SPM / Postmaster',
  'Inspector (IP / ASP)',
  'Sorting Assistant (SA)',
  'Mail Guard',
];

interface StaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  forcePasswordChangeMode?: boolean;
}

export default function StaffProfileModal({
  isOpen,
  onClose,
  forcePasswordChangeMode = false,
}: StaffProfileModalProps) {
  const { userProfile } = useAuth();

  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [designationType, setDesignationType] = useState<DesignationType>('Postman');
  const [subOffice, setSubOffice] = useState('Dadabari S.O.');
  const [officePincode, setOfficePincode] = useState('324009');
  const [beat, setBeat] = useState('Beat 2');
  const [fixedKm, setFixedKm] = useState<number>(18);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile && isOpen) {
      setName(userProfile.name || '');
      setEmployeeId(userProfile.employeeId || userProfile.id || '');
      setContact(userProfile.contact || '');
      setEmail(userProfile.email || '');
      setDesignationType(userProfile.designationType || userProfile.designation || 'Postman');
      setSubOffice(userProfile.subOffice || userProfile.postOfficeName || 'Dadabari S.O.');
      setOfficePincode(userProfile.officePincode || '324009');
      setBeat(userProfile.beat || 'Beat 2');
      setFixedKm(userProfile.fixedKm || getDefaultFixedKmForBeat(userProfile.beat || 'Beat 2'));
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg(null);
      setSavedNotice(null);
    }
  }, [userProfile, isOpen]);

  if (!isOpen || !userProfile) return null;

  const isMustChange = forcePasswordChangeMode || Boolean(userProfile.mustChangePassword);
  const isSuperAdmin = staffPermissionService.isSuperAdmin(userProfile);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSavedNotice(null);

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Name and Email are required.');
      return;
    }

    if (isMustChange && !newPassword.trim()) {
      setErrorMsg(
        `Since you logged in with the default password (${DEFAULT_STAFF_FALLBACK_PASSWORD}), please enter a new personal password below.`
      );
      return;
    }

    if (newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        setErrorMsg('New password must be at least 6 characters.');
        return;
      }
      if (newPassword.trim() === DEFAULT_STAFF_FALLBACK_PASSWORD) {
        setErrorMsg(`Please choose a personal password different from the default (${DEFAULT_STAFF_FALLBACK_PASSWORD}).`);
        return;
      }
      if (newPassword.trim() !== confirmPassword.trim()) {
        setErrorMsg('New password and confirmation password do not match.');
        return;
      }
    }

    staffPermissionService.updateOwnProfileDetails(userProfile.email || userProfile.id, {
      name: name.trim(),
      employeeId: employeeId.trim(),
      contact: contact.trim(),
      email: email.trim(),
      designationType,
      subOffice,
      officePincode,
      beat,
      fixedKm: Number(fixedKm) || 18,
      newPassword: newPassword.trim() || undefined,
    });

    setSavedNotice('Your Staff Profile & Beat Assignment have been updated.');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleSkipPasswordPrompt = () => {
    staffPermissionService.dismissPasswordChangePrompt(userProfile.email || userProfile.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-red-900 via-red-800 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isMustChange ? 'First-Login Security Setup & Staff Profile' : 'My Postal Staff Profile & Beat Settings'}
              </h2>
              <p className="text-xs text-amber-300 font-medium">
                Employee ID: {userProfile.employeeId || userProfile.id} · {isSuperAdmin ? 'Master Super Admin' : `Scoped to ${userProfile.beat}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={isMustChange ? handleSkipPasswordPrompt : onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
          {isMustChange && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-amber-950">
                  First Login Detected with Default Directory Password (<span className="font-mono">{DEFAULT_STAFF_FALLBACK_PASSWORD}</span>)
                </div>
                <p className="text-amber-900/90 leading-relaxed">
                  For departmental security, please verify your profile details (Mobile, Email, Post Office & Beat) and set your personal password below.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-700 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {savedNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
              <span>{savedNotice}</span>
            </div>
          )}

          {/* Basic Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User size={14} className="text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Employee ID / CSI ID *
              </label>
              <div className="relative">
                <IdCard size={14} className="text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone size={14} className="text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Registered Email Address *
              </label>
              <div className="relative">
                <Mail size={14} className="text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>
            </div>
          </div>

          {/* Designation, Post Office & Beat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Designation
              </label>
              <select
                value={designationType}
                onChange={(e) => setDesignationType(e.target.value as DesignationType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
              >
                {DESIGNATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assigned Post Office / S.O. (Kota City)
              </label>
              <select
                value={subOffice}
                onChange={(e) => {
                  const selected = e.target.value;
                  setSubOffice(selected);
                  const matched = KOTA_OFFICE_MASTER_LIST.find(
                    (o) => o.name === selected || o.name.toLowerCase().includes(selected.toLowerCase())
                  );
                  if (matched) {
                    setOfficePincode(matched.pin);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
              >
                {KOTA_OFFICE_MASTER_LIST.map((po) => (
                  <option key={po.officeId} value={po.name}>
                    {po.name} - {po.pin}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assigned Beat Number
              </label>
              <select
                value={beat}
                onChange={(e) => {
                  const b = e.target.value;
                  setBeat(b);
                  setFixedKm(getDefaultFixedKmForBeat(b));
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
              >
                {Array.from({ length: 33 }, (_, i) => `Beat ${i + 1}`).map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
                <option value="Beat EC-1">Beat EC-1 (Engg College SO)</option>
                <option value="Beat EC-2">Beat EC-2 (Engg College SO)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Office Pincode
              </label>
              <input
                type="text"
                readOnly
                value={officePincode}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-mono text-slate-700 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Beat Fixed KM / Day
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={fixedKm}
                onChange={(e) => setFixedKm(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 tabular-nums"
              />
            </div>
          </div>

          {/* Password Update Block */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <KeyRound size={14} className="text-red-700" />
                <span>{isMustChange ? 'Set Personal Security Password *' : 'Update Personal Password (Optional)'}</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Default Fallback: <code className="font-mono font-semibold">{DEFAULT_STAFF_FALLBACK_PASSWORD}</code>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  New Personal Password {isMustChange ? '*' : ''}
                </label>
                <div className="relative">
                  <Lock size={14} className="text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required={isMustChange}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Confirm New Password {isMustChange ? '*' : ''}
                </label>
                <div className="relative">
                  <Lock size={14} className="text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required={isMustChange}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
            {isMustChange ? (
              <button
                type="button"
                onClick={handleSkipPasswordPrompt}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
              >
                Remind Me Later
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-800 hover:bg-red-900 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={15} />
              <span>Save Profile & Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
