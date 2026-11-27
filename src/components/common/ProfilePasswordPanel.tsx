import React, { useState } from 'react';
import { CheckCircle2, KeyRound, Lock, ShieldCheck, UserCheck } from 'lucide-react';
import { whiteLabelMasterService } from '../../services/whiteLabelMasterService';
import { staffRegistrationService } from '../../services/staffRegistrationService';
import { staffPermissionService } from '../../services/staffPermissionService';

export interface ProfilePasswordPanelProps {
  actorType: 'STAFF' | 'BRAND_OWNER' | 'PARTNER';
  identifierOrId: string;
  displayName: string;
  roleLabel: string;
  email?: string;
  mobile?: string;
  brandName?: string;
  workspaceKey?: string;
  officeLabel?: string;
  allottedTerritoryLabel?: string;
  mustChangePassword?: boolean;
  onPasswordChanged?: () => void;
}

export const ProfilePasswordPanel: React.FC<ProfilePasswordPanelProps> = ({
  actorType,
  identifierOrId,
  displayName,
  roleLabel,
  email,
  mobile,
  brandName,
  workspaceKey,
  officeLabel,
  allottedTerritoryLabel,
  mustChangePassword,
  onPasswordChanged,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdStatus, setPwdStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [editMobile, setEditMobile] = useState(mobile || '');
  const [editEmail, setEditEmail] = useState(email || '');
  const [editBeatOrTerritory, setEditBeatOrTerritory] = useState(allottedTerritoryLabel || '');
  const [editRemarks, setEditRemarks] = useState('');
  const [profileStatus, setProfileStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdStatus(null);
    if (newPassword.trim().length < 4) {
      setPwdStatus({ type: 'err', text: 'New password must be at least 4 characters.' });
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      setPwdStatus({ type: 'err', text: 'New password and confirmation do not match.' });
      return;
    }

    const res = whiteLabelMasterService.changeAccountPassword({
      actorType,
      identifierOrId,
      currentPassword: currentPassword.trim() || undefined,
      newPassword: newPassword.trim(),
      actorName: displayName,
      skipCurrentCheck: !currentPassword.trim() && Boolean(mustChangePassword),
    });

    if (!res.success) {
      setPwdStatus({ type: 'err', text: res.message });
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPwdStatus({ type: 'ok', text: res.message });
    onPasswordChanged?.();
  };

  const handleProfileRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus(null);
    if (actorType === 'STAFF') {
      const staff = staffPermissionService.findStaffProfileByIdentifier(identifierOrId);
      const res = staffRegistrationService.submitProfileChangeRequest(
        staff?.employeeId || identifierOrId,
        {
          name: displayName,
          contact: mobile || '',
          email: email || '',
          address: officeLabel || '',
        },
        {
          name: displayName,
          contact: editMobile.trim(),
          email: editEmail.trim(),
          address: [editBeatOrTerritory.trim(), officeLabel || 'Dadabari S.O.']
            .filter(Boolean)
            .join(' · '),
          remarks: editRemarks.trim() || 'Profile & territory update request from Profile & Password panel',
        }
      );
      if (!res.success) {
        setProfileStatus({ type: 'err', text: res.message });
        return;
      }
      setProfileStatus({
        type: 'ok',
        text: res.message,
      });
      setEditRemarks('');
      return;
    }

    whiteLabelMasterService.submitRegistrationRequest({
      fullName: displayName,
      mobile: editMobile.trim(),
      email: editEmail.trim(),
      brandSlug: brandName?.toLowerCase().replace(/\s+/g, '-'),
      roleInterest: roleLabel,
      allottedBeatOrArea: editBeatOrTerritory.trim(),
      notes: `Profile update request: ${editRemarks.trim() || 'Contact/territory sync'}`,
    });
    setProfileStatus({
      type: 'ok',
      text: 'Profile update request logged for Admin verification.',
    });
    setEditRemarks('');
  };

  return (
    <div className="space-y-6">
      {mustChangePassword && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-start gap-3">
          <KeyRound className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
          <div>
            <p className="font-semibold">Default brand password active — update recommended</p>
            <p className="text-xs text-amber-800 mt-0.5">
              Your account is currently using the initial workspace default password. Set a personal password below to clear this notice.
            </p>
          </div>
        </div>
      )}

      {/* Identity Summary Card */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-slate-900 text-white flex items-center justify-center font-semibold text-base">
              {(displayName || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">{displayName}</h3>
              <p className="text-xs text-slate-500">
                {roleLabel}
                {brandName ? ` · ${brandName}` : ''}
                {workspaceKey ? ` (${workspaceKey})` : ''}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Session
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <p className="text-slate-500">Login / ID</p>
            <p className="font-medium text-slate-900 mt-0.5 truncate">{identifierOrId}</p>
          </div>
          <div>
            <p className="text-slate-500">Email</p>
            <p className="font-medium text-slate-900 mt-0.5 truncate">{email || 'Not set'}</p>
          </div>
          <div>
            <p className="text-slate-500">Mobile</p>
            <p className="font-medium text-slate-900 mt-0.5 tabular-nums">{mobile || 'Not set'}</p>
          </div>
          <div>
            <p className="text-slate-500">Office & Allotted Territory</p>
            <p className="font-medium text-slate-900 mt-0.5">
              {officeLabel || 'Headquarters'}
              {allottedTerritoryLabel ? ` · ${allottedTerritoryLabel}` : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Change Card */}
        <form onSubmit={handlePasswordSubmit} className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock className="w-4 h-4 text-slate-700" />
            <h4 className="text-sm font-semibold text-slate-900">Change Account Password</h4>
          </div>

          {pwdStatus && (
            <div
              className={`rounded-md px-3 py-2 text-xs font-medium ${
                pwdStatus.type === 'ok'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {pwdStatus.text}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Current Password {mustChangePassword ? '(Optional for default first-login reset)' : ''}
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={4}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 4 characters"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={4}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <CheckCircle2 className="w-4 h-4" />
            Update Password
          </button>
        </form>

        {/* Profile Update Request Card */}
        <form onSubmit={handleProfileRequestSubmit} className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserCheck className="w-4 h-4 text-slate-700" />
            <h4 className="text-sm font-semibold text-slate-900">Request Profile / Territory Update</h4>
          </div>

          {profileStatus && (
            <div
              className={`rounded-md px-3 py-2 text-xs font-medium ${
                profileStatus.type === 'ok'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {profileStatus.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={editMobile}
                onChange={(e) => setEditMobile(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Allotted Beat / PIN / Territory</label>
            <input
              type="text"
              value={editBeatOrTerritory}
              onChange={(e) => setEditBeatOrTerritory(e.target.value)}
              placeholder="e.g., Beat 2 · 324009"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Notes for Administrator</label>
            <input
              type="text"
              value={editRemarks}
              onChange={(e) => setEditRemarks(e.target.value)}
              placeholder="Reason for contact or territory change"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Submit Profile Update Request
          </button>
        </form>
      </div>
    </div>
  );
};
