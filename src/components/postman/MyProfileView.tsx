import React, { useState, useEffect } from 'react';
import { 
  User, ShieldCheck, KeyRound, Edit3, Clock, 
  CheckCircle2, XCircle, Phone, Mail, MapPin, Building, Lock 
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { staffPermissionService } from '../../services/staffPermissionService';
import { staffRegistrationService, ProfileApprovalRequest } from '../../services/staffRegistrationService';
import { fetchServerCsrfToken, getDeviceFingerprint } from '../../services/authSecurityService';

export default function MyProfileView() {
  const { userProfile, switchStaffProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'request_edit'>('profile');

  // Password Change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  // Profile Edit Request state
  const [editName, setEditName] = useState(userProfile?.name || '');
  const [editContact, setEditContact] = useState(userProfile?.contact || '');
  const [editEmail, setEditEmail] = useState(userProfile?.email || '');
  const [editAddress, setEditAddress] = useState(userProfile?.officeAddress || '');
  const [editRemarks, setEditRemarks] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  // My Pending Profile Requests
  const [myRequests, setMyRequests] = useState<ProfileApprovalRequest[]>([]);

  const empId = userProfile?.employeeId || userProfile?.id || '';

  const loadRequests = () => {
    if (!empId) return;
    const reqs = staffRegistrationService.getRequestsForEmployee(empId);
    setMyRequests(reqs.profileEdits);
  };

  useEffect(() => {
    loadRequests();
    const unsub = staffRegistrationService.subscribe(loadRequests);
    return () => unsub();
  }, [empId]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New password and confirm password do not match.');
      return;
    }

    try {
      const csrf = await fetchServerCsrfToken();
      const fp = await getDeviceFingerprint();
      await fetch('/api/v1/auth/staff/change-password', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf || '',
          'x-device-fingerprint': fp,
        },
        body: JSON.stringify({ identifier: empId, newPassword }),
      });
    } catch {
      // Non-fatal if offline; local update proceeds
    }

    const updated = staffPermissionService.updateOwnPassword(empId, newPassword);
    if (updated) {
      setPassSuccess('✅ Password changed successfully! Hashed and stored securely. Future logins require your new password.');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPassError('Failed to update password. Please try again.');
    }
  };

  const handleProfileRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditSuccess(null);

    if (!editName.trim() || !editContact.trim()) {
      setEditError('Full Name and Contact Number are required.');
      return;
    }

    const res = staffRegistrationService.submitProfileChangeRequest(
      empId,
      {
        name: userProfile?.name || '',
        contact: userProfile?.contact || '',
        email: userProfile?.email || '',
        address: userProfile?.officeAddress || '',
      },
      {
        name: editName.trim() !== userProfile?.name ? editName.trim() : undefined,
        contact: editContact.trim() !== userProfile?.contact ? editContact.trim() : undefined,
        email: editEmail.trim() !== userProfile?.email ? editEmail.trim() : undefined,
        address: editAddress.trim() !== userProfile?.officeAddress ? editAddress.trim() : undefined,
        remarks: editRemarks.trim(),
      }
    );

    if (res.success) {
      setEditSuccess('✅ Profile modification request submitted for Admin Ekta Meena review.');
      setEditRemarks('');
      loadRequests();
    } else {
      setEditError(res.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-center font-black text-xl">
            {userProfile?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {userProfile?.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                {userProfile?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Employee ID: <span className="font-mono font-bold text-slate-700">{userProfile?.employeeId}</span> • Assigned: <strong>{userProfile?.beat}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(['profile', 'password', 'request_edit'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'profile' && 'My Details'}
              {tab === 'password' && 'Change Password'}
              {tab === 'request_edit' && 'Request Changes'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Profile Details */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User size={16} className="text-red-700" />
            <span>Official Postal Employee Profile</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Designation</span>
              <div className="text-sm font-bold text-slate-800">{userProfile?.designationType || userProfile?.designation || 'Postman'}</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Beat</span>
              <div className="text-sm font-bold text-slate-800">{userProfile?.beat || 'Beat 2'}</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number</span>
              <div className="text-sm font-mono font-bold text-slate-800">{userProfile?.contact || 'Not Recorded'}</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Email Address</span>
              <div className="text-sm font-bold text-slate-800">{userProfile?.email}</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 sm:col-span-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Sub-Office / Base</span>
              <div className="text-sm font-bold text-slate-800">{userProfile?.subOffice || userProfile?.assignedOffice || 'Dadabari S.O. (324009)'}</div>
              <div className="text-xs text-slate-500">{userProfile?.officeAddress}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Change Password */}
      {activeTab === 'password' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <KeyRound size={16} className="text-red-700" />
            <span>Secure Password Update (SHA-256 Hashed)</span>
          </h2>

          {passError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {passError}
            </div>
          )}

          {passSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
              {passSuccess}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Lock size={14} /> Update & Hash Password
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Request Profile Changes */}
      {activeTab === 'request_edit' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Edit3 size={16} className="text-red-700" />
              <span>Submit Profile Correction Request</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Changes to your personal details require authorization from Admin <strong>Ekta Meena</strong>. Current details will remain active until approved.
            </p>
          </div>

          {editError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {editError}
            </div>
          )}

          {editSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
              {editSuccess}
            </div>
          )}

          <form onSubmit={handleProfileRequestSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Corrected Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Mobile Number</label>
                <input
                  type="tel"
                  value={editContact}
                  onChange={e => setEditContact(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Residential / Address Update</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Modification</label>
              <textarea
                value={editRemarks}
                onChange={e => setEditRemarks(e.target.value)}
                placeholder="e.g. Spelling error in surname as per Aadhaar card..."
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
            >
              Submit for Admin Approval
            </button>
          </form>

          {/* Submission History */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase">My Request History</h3>
            {myRequests.length === 0 ? (
              <div className="text-xs text-slate-400">No profile change requests submitted.</div>
            ) : (
              <div className="space-y-2">
                {myRequests.map(r => (
                  <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800">
                        {r.proposedValues.name ? `Name: ${r.proposedValues.name} ` : ''}
                        {r.proposedValues.contact ? `Mobile: ${r.proposedValues.contact} ` : ''}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Submitted: {new Date(r.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        r.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
