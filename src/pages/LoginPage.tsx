import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../components/auth/FirebaseAuthProvider';
import {
  Building2,
  ShieldCheck,
  UserCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  Smartphone,
  BadgeCheck,
  RefreshCw,
  X,
  IdCard,
} from 'lucide-react';
import {
  getDefaultFixedKmForBeat,
  staffPermissionService,
  DEFAULT_STAFF_FALLBACK_PASSWORD,
  KOTA_OFFICE_MASTER_LIST,
} from '../services/staffPermissionService';
import { DesignationType } from '../types/models';

const DESIGNATION_LIST: DesignationType[] = [
  'Postman',
  'GDS (BPM / ABPM / Dak Sevak)',
  'PA (Postal Assistant)',
  'MTS (Multi Tasking Staff)',
  'SPM / Postmaster',
  'Inspector (IP / ASP)',
  'Sorting Assistant (SA)',
  'Mail Guard',
];

interface LoginPageProps {
  isModal?: boolean;
  onClose?: () => void;
  initialMode?: 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';
}

export default function LoginPage({ isModal = false, onClose, initialMode = 'LOGIN' }: LoginPageProps) {
  const {
    signIn,
    signInWithPassword,
    registerStaff,
    loginAsMasterAdmin,
    switchStaffProfile,
    error,
    clearError,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const finishLoginAndEnterCRM = () => {
    if (onClose) {
      onClose();
    }
    if (location.pathname === '/login' || location.pathname === '/' || location.pathname === '/home') {
      navigate('/dashboard', { replace: true });
    }
  };

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'>(initialMode);
  const [identifier, setIdentifier] = useState('50510312');
  const [password, setPassword] = useState(DEFAULT_STAFF_FALLBACK_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Registration state (strictly for Postal Staff)
  const [regEmployeeId, setRegEmployeeId] = useState('');
  const [regName, setRegName] = useState('');
  const [regDesignation, setRegDesignation] = useState<DesignationType>('Postman');
  const [regOfficeName, setRegOfficeName] = useState('Dadabari S.O.');
  const [regPincode, setRegPincode] = useState('324009');
  const [regBeat, setRegBeat] = useState('Beat 2');
  const [regFixedKm, setRegFixedKm] = useState<number>(18);
  const [regContact, setRegContact] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState(DEFAULT_STAFF_FALLBACK_PASSWORD);

  // Forgot Password / OTP Recovery state
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [maskedTarget, setMaskedTarget] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');

  const clearMessages = () => {
    clearError();
    setLocalError(null);
    setSuccessMessage(null);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!identifier.trim() || !password.trim()) {
      setLocalError('Please enter your Employee ID / Email / Mobile and Password.');
      return;
    }
    setIsLoading(true);
    const ok = await signInWithPassword(identifier.trim(), password.trim());
    setIsLoading(false);
    if (ok) {
      finishLoginAndEnterCRM();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!regEmployeeId.trim() || !regName.trim() || !regContact.trim() || !regEmail.trim()) {
      setLocalError('All postal staff fields (Employee ID, Full Name, Mobile, and Email) are required.');
      return;
    }
    if (!/^\d{10}$/.test(regContact.replace(/\D/g, '').slice(-10))) {
      setLocalError('Please enter a valid 10-digit Mobile Number.');
      return;
    }

    setIsLoading(true);
    const mappedRole =
      regDesignation.includes('Postmaster') || regDesignation.includes('Inspector')
        ? 'ADMIN'
        : regDesignation.includes('Postman') || regDesignation.includes('GDS')
        ? 'POSTMAN'
        : 'STAFF';

    const ok = await registerStaff({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword.trim() || DEFAULT_STAFF_FALLBACK_PASSWORD,
      employeeId: regEmployeeId.trim(),
      role: mappedRole,
      designationType: regDesignation,
      beat: regBeat,
      assignedOffice: `${regOfficeName} (${regPincode})`,
      subOffice: regOfficeName,
      officePincode: regPincode,
      fixedKm: Number(regFixedKm) || 18,
      contact: regContact.trim(),
    });
    setIsLoading(false);
    if (ok) {
      finishLoginAndEnterCRM();
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!forgotIdentifier.trim()) {
      setLocalError('Please enter your registered Employee ID / CSI ID or Mobile Number.');
      return;
    }
    const res = staffPermissionService.initiatePasswordResetOtp(forgotIdentifier.trim());
    if (!res.success || !res.otp) {
      setLocalError(res.error || 'Could not locate employee in Staff Directory.');
      return;
    }
    setGeneratedOtp(res.otp);
    setEnteredOtp(res.otp);
    setMaskedTarget(res.maskedContact || '');
    setSuccessMessage(`OTP dispatched to registered mobile/email ${res.maskedContact}. (Demo OTP: ${res.otp})`);
  };

  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!generatedOtp || enteredOtp.trim() !== generatedOtp) {
      setLocalError('Invalid OTP entered. Please check the 6-digit verification code.');
      return;
    }
    if (!newResetPassword.trim() || newResetPassword.trim().length < 6) {
      setLocalError('New password must be at least 6 characters.');
      return;
    }
    if (newResetPassword.trim() !== confirmResetPassword.trim()) {
      setLocalError('New password and confirm password do not match.');
      return;
    }

    const updated = staffPermissionService.updateOwnPassword(forgotIdentifier.trim(), newResetPassword.trim());
    if (!updated) {
      setLocalError('Failed to update password. Please try again.');
      return;
    }

    setSuccessMessage('Password updated! Signing you in...');
    const ok = await signInWithPassword(updated.employeeId || updated.email, newResetPassword.trim());
    if (ok) {
      finishLoginAndEnterCRM();
    }
  };

  const handleQuickFillAdmin = () => {
    clearMessages();
    setMode('LOGIN');
    setIdentifier('mahen.comtech@gmail.com');
    setPassword('Mahen@2304');
    loginAsMasterAdmin();
    finishLoginAndEnterCRM();
  };

  const handleQuickFillStaff = (staffIdOrEmail: string, staffPass: string = DEFAULT_STAFF_FALLBACK_PASSWORD) => {
    clearMessages();
    setMode('LOGIN');
    setIdentifier(staffIdOrEmail);
    setPassword(staffPass);
    switchStaffProfile(staffIdOrEmail);
    finishLoginAndEnterCRM();
  };

  const activeError = localError || error;

  const contentCard = (
    <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
      {isModal && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          title="Close Authentication Modal"
        >
          <X size={18} />
        </button>
      )}

      {/* Left Brand & Directory Quick-Login Presets (5 cols) */}
      <div className="lg:col-span-5 bg-gradient-to-b from-red-900 via-red-950 to-slate-950 p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-red-800/40">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-400 tracking-wide">
                भारतीय डाक विभाग · Department of Posts
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Kota Division Staff Auth Gate
              </h1>
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-white leading-snug">
              Directory-Verified Staff Login & Beat Access Control
            </h2>
            <p className="text-xs text-red-100/80 leading-relaxed">
              Authenticate using your <strong>Employee ID (CSI/GDS ID)</strong>, <strong>Mobile Number</strong>, or <strong>Email</strong>. Default directory password for all postal staff is <code className="px-1.5 py-0.5 rounded bg-red-950 text-amber-300 font-mono font-bold">Post@1234</code>.
            </p>
          </div>

          {/* Instant Directory Verification Presets */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-semibold text-amber-300">
              Instant 1-Click Staff & Admin Access (Click to Enter Immediately):
            </div>

            <button
              type="button"
              onClick={handleQuickFillAdmin}
              id="master-admin-bypass-btn"
              className="w-full text-left p-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-300 transition flex items-center justify-between group shadow-md cursor-pointer"
            >
              <div>
                <div className="text-xs font-black text-slate-950 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck size={15} />
                  <span>1-Click Master Admin Bypass (Full Access)</span>
                </div>
                <div className="text-[11px] font-mono text-slate-900 font-semibold mt-0.5 tabular-nums">
                  ID: CSI-10023401 · mahen.comtech@gmail.com (All Offices & Beats)
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-950 group-hover:translate-x-0.5 transition shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickFillStaff('50457421', DEFAULT_STAFF_FALLBACK_PASSWORD)}
              className="w-full text-left p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 border border-slate-700/80 transition flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-white">
                  Beat 2 Staff · Ekta Meena / M.K. Meena
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
                  Emp ID: CSI-10294812 · Default Pass: {DEFAULT_STAFF_FALLBACK_PASSWORD}
                </div>
              </div>
              <ArrowRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickFillStaff('50510312', DEFAULT_STAFF_FALLBACK_PASSWORD)}
              className="w-full text-left p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 border border-slate-700/80 transition flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-white">
                  Muskan Sharma · Postman (Beat 1 Only)
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
                  Emp ID: 50510312 · Default Pass: {DEFAULT_STAFF_FALLBACK_PASSWORD}
                </div>
              </div>
              <ArrowRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickFillStaff('10317473', DEFAULT_STAFF_FALLBACK_PASSWORD)}
              className="w-full text-left p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 border border-slate-700/80 transition flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-white">
                  Ramkishan Meghwal · Postman (Beat 6 Only)
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
                  Emp ID: 10317473 · Default Pass: {DEFAULT_STAFF_FALLBACK_PASSWORD}
                </div>
              </div>
              <ArrowRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
            </button>
          </div>
        </div>

        <div className="pt-5 border-t border-red-800/40 text-[11px] text-red-200/70 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-300">
            <ShieldCheck size={14} />
            <span>Beat-Restricted Isolation & First-Login Security</span>
          </div>
          <p>
            Non-admin staff strictly view and manage records assigned to their respective Beat. First-time login with <span className="font-mono text-white">Post@1234</span> prompts a personal password update.
          </p>
        </div>
      </div>

      {/* Right Authentication Form Column (7 cols) */}
      <div className="lg:col-span-7 p-7 bg-white text-slate-900 flex flex-col justify-between">
        <div>
          {/* Top Mode Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-5 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                clearMessages();
                setMode('LOGIN');
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center justify-center gap-1.5 ${
                mode === 'LOGIN'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound size={14} />
              <span>Staff Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                clearMessages();
                setMode('REGISTER');
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center justify-center gap-1.5 ${
                mode === 'REGISTER'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus size={14} />
              <span>New Staff Registration</span>
            </button>
            <button
              type="button"
              onClick={() => {
                clearMessages();
                setMode('FORGOT_PASSWORD');
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center justify-center gap-1.5 ${
                mode === 'FORGOT_PASSWORD'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone size={14} />
              <span>Forgot Password</span>
            </button>
          </div>

          {activeError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{activeError}</div>
              <button
                type="button"
                onClick={clearMessages}
                className="text-red-700 hover:text-red-950 font-bold px-1.5"
              >
                ✕
              </button>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {mode === 'LOGIN' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Employee ID (CSI / GDS ID), Mobile Number, or Official Email *
                </label>
                <div className="relative">
                  <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 50510312, CSI-10294812, 9521279186, or email"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Security Password (Default: <span className="font-mono text-red-700">Post@1234</span>) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      clearMessages();
                      setForgotIdentifier(identifier);
                      setMode('FORGOT_PASSWORD');
                    }}
                    className="text-xs font-bold text-red-700 hover:text-red-900 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (default: Post@1234)"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-0.5"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleQuickFillAdmin}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck size={18} />
                <span>Direct Enter CRM Dashboard (Master Admin Instant Access)</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="submit"
                disabled={isLoading}
                id="password-login-submit-btn"
                className="w-full py-3 px-4 bg-red-800 hover:bg-red-900 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck size={17} />
                <span>{isLoading ? 'Authenticating with Directory...' : 'Sign In with Employee ID / Password'}</span>
              </button>

              {/* Toggle below the login form to switch between Staff Login and New Staff Registration */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-600 font-medium">
                  New postal employee joining Kota Division?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setMode('REGISTER');
                  }}
                  className="font-bold text-red-800 hover:text-red-950 flex items-center gap-1 underline cursor-pointer"
                >
                  <UserPlus size={14} />
                  <span>Switch to New Staff Registration</span>
                </button>
              </div>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative inline-block px-3 bg-white text-[11px] text-slate-500 font-semibold">
                  OR CONNECT GOOGLE WORKSPACE (SHEETS & GMAIL SYNC)
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await signIn();
                  finishLoginAndEnterCRM();
                }}
                id="google-signin-btn"
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs transition cursor-pointer"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 block">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span>Sign in with Google Workspace</span>
              </button>
            </form>
          )}

          {mode === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                <BadgeCheck size={15} className="text-red-700 shrink-0" />
                <span>
                  <strong>Postal Staff Registration Only:</strong> Requires valid Department of Posts Employee ID / CSI ID and Kota Division S.O. assignment.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Employee ID / CSI ID / GDS ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={regEmployeeId}
                    onChange={(e) => setRegEmployeeId(e.target.value)}
                    placeholder="e.g. 10310735 or CSI-10348920"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name (Postal Employee) *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar Sharma"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designation (Post / Cadre) *
                  </label>
                  <select
                    value={regDesignation}
                    onChange={(e) => setRegDesignation(e.target.value as DesignationType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                  >
                    {DESIGNATION_LIST.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Post Office / S.O. (Kota Directory) *
                  </label>
                  <select
                    value={regOfficeName}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      setRegOfficeName(selectedName);
                      const matched = KOTA_OFFICE_MASTER_LIST.find((o) => o.name === selectedName);
                      if (matched) {
                        setRegPincode(matched.pin);
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Beat Number *
                  </label>
                  <select
                    value={regBeat}
                    onChange={(e) => {
                      const b = e.target.value;
                      setRegBeat(b);
                      setRegFixedKm(getDefaultFixedKmForBeat(b));
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
                    value={regPincode}
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
                    value={regFixedKm}
                    onChange={(e) => setRegFixedKm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number (10-Digit) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={regContact}
                    onChange={(e) => setRegContact(e.target.value)}
                    placeholder="e.g. 9829012345"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official / Personal Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@indiapost.gov.in"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Initial Password
                  </label>
                  <input
                    type="text"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Default: Post@1234"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-red-800 hover:bg-red-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={16} />
                <span>{isLoading ? 'Registering Postal Staff...' : 'Register Postal Staff & Sign In'}</span>
              </button>

              <div className="pt-1 flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-600">Already registered in the Staff Directory?</span>
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setMode('LOGIN');
                  }}
                  className="font-bold text-red-800 hover:text-red-950 underline cursor-pointer"
                >
                  Back to Staff Login
                </button>
              </div>
            </form>
          )}

          {mode === 'FORGOT_PASSWORD' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <div className="font-bold text-slate-900 mb-0.5">
                  Staff Password Recovery (Employee ID / Mobile OTP)
                </div>
                <p>
                  Enter your registered <strong>Employee ID (CSI / GDS ID)</strong> or <strong>Mobile Number</strong> to verify via OTP and reset your password.
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Employee ID or Mobile Number *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder="e.g. 50510312, 10310735, or 9521279186"
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <RefreshCw size={14} />
                      <span>{generatedOtp ? 'Resend OTP' : 'Send OTP'}</span>
                    </button>
                  </div>
                </div>
              </form>

              {generatedOtp && (
                <form onSubmit={handleVerifyOtpAndReset} className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
                    <span>OTP sent to <strong>{maskedTarget}</strong></span>
                    <span className="font-mono font-bold bg-amber-200/70 px-2 py-0.5 rounded">
                      OTP: {generatedOtp}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        6-Digit OTP *
                      </label>
                      <input
                        type="text"
                        required
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        placeholder="6-digit OTP"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        New Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={newResetPassword}
                        onChange={(e) => setNewResetPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmResetPassword}
                        onChange={(e) => setConfirmResetPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 size={16} />
                    <span>Verify OTP & Update Password</span>
                  </button>
                </form>
              )}

              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setMode('LOGIN');
                  }}
                  className="font-bold text-red-800 hover:text-red-950 underline cursor-pointer"
                >
                  ← Back to Staff Login
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Kota Division · Rajasthan Postal Circle (17 S.O. / H.O. Directory)</span>
          <span className="font-mono tabular-nums">Default Pass: Post@1234</span>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        {contentCard}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      {contentCard}
    </div>
  );
}
