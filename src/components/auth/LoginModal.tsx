import React, { useMemo, useState } from 'react';
import { 
  Lock, User, ShieldCheck, KeyRound, UserPlus, 
  ArrowRight, CheckCircle2, AlertCircle, Phone, Mail, Building, Flame 
} from 'lucide-react';
import { DEFAULT_STAFF_FALLBACK_PASSWORD, staffPermissionService } from '../../services/staffPermissionService';
import { staffRegistrationService } from '../../services/staffRegistrationService';
import { useAuth } from './FirebaseAuthProvider';

interface LoginModalProps {
  onLoginSuccess: () => void;
}

const isMasterAdminInput = (val: string): boolean => {
  const clean = (val || '').trim().toLowerCase();
  return (
    clean === 'ektamahenmeena@gmail.com' ||
    clean === 'master-admin-01' ||
    clean === 'staff-master-ekta'
  );
};

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const { signInWithPassword, signInAsMasterAdminNoPassword, signInStaffDirect } = useAuth();
  const [viewMode, setViewMode] = useState<'LOGIN' | 'FIRST_LOGIN_CHANGE' | 'REGISTER' | 'FORGOT_PASSWORD'>('LOGIN');
  const directoryStaffList = useMemo(() => staffPermissionService.getDirectoryStaff(), []);

  // Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // First Login Password Change State
  const [pendingEmployeeId, setPendingEmployeeId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Staff Registration Form State
  const [regEmpId, setRegEmpId] = useState('');
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDesignation, setRegDesignation] = useState('Postman');
  const [regBeat, setRegBeat] = useState('Beat 2');
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Forgot Password / OTP State
  const [forgotId, setForgotId] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [resetNewPass, setResetNewPass] = useState('');
  const [otpStep, setOtpStep] = useState<'ID' | 'VERIFY'>('ID');

  const handleInstantAdminLogin = async () => {
    setError('');
    setStatusMessage('');
    setLoading(true);
    try {
      const ok = await signInAsMasterAdminNoPassword();
      setLoading(false);
      if (ok) {
        onLoginSuccess();
        return;
      }
    } catch {
      // Fallback handled cleanly below
    }
    const fallback = staffPermissionService.authenticateWithPassword('ektamahenmeena@gmail.com', '', {
      allowAdminPasswordless: true,
      skipPasswordCheck: true,
    });
    setLoading(false);
    if (fallback.success) {
      onLoginSuccess();
    }
  };

  const handleQuickSelectDirectoryStaff = async (empId: string) => {
    if (!empId) return;
    setError('');
    setStatusMessage('');
    setLoading(true);
    try {
      const ok = await signInStaffDirect(empId);
      setLoading(false);
      if (ok) {
        onLoginSuccess();
        return;
      }
    } catch {
      // Fallback handled cleanly below
    }
    const directRes = staffPermissionService.authenticateWithPassword(empId, '', {
      allowAdminPasswordless: true,
      skipPasswordCheck: true,
    });
    setLoading(false);
    if (directRes.success) {
      onLoginSuccess();
    } else {
      setError(directRes.error || 'Unable to sign in selected staff member.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');
    const rawUser = username.trim();
    const rawPass = password.trim();
    const isAdmin = isMasterAdminInput(rawUser);

    if (!rawUser || (!rawPass && !isAdmin)) {
      setError('Please enter Employee ID / Mobile / Email and Password.');
      return;
    }

    setLoading(true);
    const ok = await signInWithPassword(rawUser, rawPass);
    setLoading(false);

    if (ok) {
      onLoginSuccess();
    } else {
      setError(`Invalid credentials. Verify Employee ID / Email and use custom password or ${DEFAULT_STAFF_FALLBACK_PASSWORD}.`);
    }
  };

  const handleFirstPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const updated = staffPermissionService.updateOwnPassword(pendingEmployeeId, newPassword);
    if (updated) {
      localStorage.setItem('postman_auth', 'true');
      onLoginSuccess();
    } else {
      setError('Failed to update password. Please try again.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRegSuccess(null);

    const res = staffRegistrationService.submitRegistrationRequest({
      employeeId: regEmpId,
      name: regName,
      mobile: regMobile,
      email: regEmail,
      designation: regDesignation,
      requestedBeat: regBeat,
    });

    if (res.success) {
      setRegSuccess(res.message);
      setRegEmpId('');
      setRegName('');
      setRegMobile('');
      setRegEmail('');
    } else {
      setError(res.message);
    }
  };

  const handleForgotIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = staffPermissionService.initiatePasswordResetOtp(forgotId);
    if (res.success && res.otp) {
      setGeneratedOtp(res.otp);
      setOtpStep('VERIFY');
    } else {
      setError(res.error || 'No employee found with this ID.');
    }
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (forgotOtp.trim() !== generatedOtp) {
      setError('Invalid OTP code. Please enter the verification OTP.');
      return;
    }
    if (resetNewPass.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    const updated = staffPermissionService.updateOwnPassword(forgotId, resetNewPass);
    if (updated) {
      setViewMode('LOGIN');
      setUsername(forgotId);
      setPassword(resetNewPass);
      setError('');
      setStatusMessage('Password reset successful. Please sign in with your new password.');
    } else {
      setError('Failed to reset password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-white my-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-red-600/20 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400 mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Xpeedo Last Mile</h2>
          <p className="text-xs text-slate-400 mt-0.5">Xpeedo Last Mile • Dadabari S.O. • PIN 324009 • XPEEDO Private Limited</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 text-center mb-4">
            {error}
          </div>
        )}

        {statusMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 text-center mb-4">
            {statusMessage}
          </div>
        )}

        {/* MODE 1: STANDARD LOGIN */}
        {viewMode === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Instant AI Studio Master Admin Login */}
            <button
              type="button"
              onClick={handleInstantAdminLogin}
              disabled={loading}
              className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
            >
              <Flame className="w-4 h-4 shrink-0" />
              <span>Instant Admin Login (AI Studio · No Password)</span>
            </button>

            {/* Quick Select Employee from Directory */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Quick Select Employee from Directory ({directoryStaffList.length} Staff · Instant Sign-In)
              </label>
              <select
                value=""
                disabled={loading}
                onChange={(e) => {
                  if (e.target.value) {
                    void handleQuickSelectDirectoryStaff(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-red-500 transition cursor-pointer"
              >
                <option value="">-- Choose Employee ({directoryStaffList.length} Dadabari S.O. Staff) --</option>
                {directoryStaffList.map((emp) => {
                  const empId = emp.employeeId || emp.id.replace(/^STAFF-/, '');
                  return (
                    <option key={emp.id} value={empId}>
                      {emp.beat} • {emp.name} (ID: {empId} | Mob: {emp.contact})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Employee ID / Mobile / Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. 50457421, 8769706002, ektamahenmeena@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-red-500 transition text-white"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">
                  {isMasterAdminInput(username)
                    ? 'Password (Optional for Master Admin)'
                    : `Password (Default: ${DEFAULT_STAFF_FALLBACK_PASSWORD})`}
                </label>
                <button
                  type="button"
                  onClick={() => { setViewMode('FORGOT_PASSWORD'); setError(''); }}
                  className="text-[11px] text-slate-400 hover:text-red-400 transition"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    isMasterAdminInput(username)
                      ? 'Optional (leave blank for Admin bypass)'
                      : `Default: ${DEFAULT_STAFF_FALLBACK_PASSWORD} or custom password`
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-red-500 transition text-white"
                  required={!isMasterAdminInput(username)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-red-700/30 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Authenticate & Enter Xpeedo Last Mile'}
            </button>

            {/* Registration Request Link */}
            <div className="pt-4 border-t border-slate-800 text-center space-y-2">
              <button
                type="button"
                onClick={() => { setViewMode('REGISTER'); setError(''); setRegSuccess(null); }}
                className="text-xs text-red-400 hover:text-red-300 font-bold transition flex items-center justify-center gap-1.5 mx-auto"
              >
                <UserPlus size={14} />
                <span>New Staff? Request Registration</span>
              </button>

              <div className="text-[11px] text-slate-500">
                Sign in with your <span className="text-slate-300 font-mono">Employee ID</span>, Mobile, or Email (default <span className="text-slate-300 font-mono">Post@1234</span>).
                <br />
                Master Admin: <span className="text-slate-300 font-mono">ektamahenmeena@gmail.com</span>
              </div>
            </div>
          </form>
        )}

        {/* MODE 2: MANDATORY FIRST-LOGIN PASSWORD CHANGE */}
        {viewMode === 'FIRST_LOGIN_CHANGE' && (
          <form onSubmit={handleFirstPasswordChange} className="space-y-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 text-center">
              <strong>First Login Detected:</strong> For postal security, you must set a new personal password before accessing field records.
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">New Secure Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 characters..."
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password..."
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-red-700/30 cursor-pointer"
            >
              Save New Password & Enter CRM
            </button>
          </form>
        )}

        {/* MODE 3: NEW STAFF REGISTRATION REQUEST */}
        {viewMode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div className="text-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Staff Registration Request</h3>
              <p className="text-[11px] text-slate-400">Awaiting approval by Admin Ekta Meena</p>
            </div>

            {regSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs text-center">
                {regSuccess}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Employee ID *</label>
              <input
                type="text"
                value={regEmpId}
                onChange={e => setRegEmpId(e.target.value)}
                placeholder="e.g. 50510325 or CSI-10294815"
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name *</label>
              <input
                type="text"
                value={regName}
                onChange={e => setRegName(e.target.value)}
                placeholder="As per postal service book"
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  value={regMobile}
                  onChange={e => setRegMobile(e.target.value)}
                  placeholder="10-digit Mobile"
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="name@indiapost.gov.in"
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Designation</label>
                <select
                  value={regDesignation}
                  onChange={e => setRegDesignation(e.target.value)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="Postman">Postman</option>
                  <option value="GDS (BPM / ABPM / Dak Sevak)">GDS</option>
                  <option value="PA (Postal Assistant)">Postal Assistant (PA)</option>
                  <option value="MTS (Multi Tasking Staff)">MTS</option>
                  <option value="Mail Guard">Mail Guard</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Requested Beat</label>
                <select
                  value={regBeat}
                  onChange={e => setRegBeat(e.target.value)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  {Array.from({ length: 33 }, (_, i) => `Beat ${i + 1}`).map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition mt-2 cursor-pointer shadow-md"
            >
              Submit Registration Request
            </button>

            <button
              type="button"
              onClick={() => { setViewMode('LOGIN'); setError(''); }}
              className="w-full py-2 text-xs text-slate-400 hover:text-white transition"
            >
              ← Back to Login
            </button>
          </form>
        )}

        {/* MODE 4: FORGOT PASSWORD / OTP RECOVERY */}
        {viewMode === 'FORGOT_PASSWORD' && (
          <div className="space-y-4">
            <div className="text-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Reset Employee Password</h3>
              <p className="text-[11px] text-slate-400">Verify identity via Employee ID OTP</p>
            </div>

            {otpStep === 'ID' ? (
              <form onSubmit={handleForgotIdSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Enter Employee ID</label>
                  <input
                    type="text"
                    value={forgotId}
                    onChange={e => setForgotId(e.target.value)}
                    placeholder="e.g. 50510312"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition"
                >
                  Generate Verification OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-xl text-xs text-center font-mono">
                  OTP Code: <strong>{generatedOtp}</strong>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Enter OTP Code</label>
                  <input
                    type="text"
                    value={forgotOtp}
                    onChange={e => setForgotOtp(e.target.value)}
                    placeholder="6-digit OTP"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
                  <input
                    type="password"
                    value={resetNewPass}
                    onChange={e => setResetNewPass(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition"
                >
                  Confirm & Reset Password
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => { setViewMode('LOGIN'); setError(''); setOtpStep('ID'); }}
              className="w-full py-1 text-xs text-slate-400 hover:text-white transition"
            >
              ← Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
