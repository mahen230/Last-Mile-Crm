import React, { useState } from 'react';
import { useAuth } from '../components/auth/FirebaseAuthProvider';
import {
  Building2,
  ShieldCheck,
  UserCheck,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { getDefaultFixedKmForBeat } from '../services/staffPermissionService';

export default function LoginPage() {
  const {
    signIn,
    signInWithPassword,
    registerStaff,
    error,
    clearError,
  } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('mahen.comtech@gmail.com');
  const [password, setPassword] = useState('Mahen@2304');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmployeeId, setRegEmployeeId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'POSTMAN' | 'STAFF'>('POSTMAN');
  const [regBeat, setRegBeat] = useState('Beat 2');
  const [regOffice, setRegOffice] = useState('Dadabari S.O. (324009)');
  const [regFixedKm, setRegFixedKm] = useState<number>(18);
  const [regContact, setRegContact] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setIsLoading(true);
    await signInWithPassword(email.trim(), password.trim());
    setIsLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim() || !regEmployeeId.trim()) {
      return;
    }
    setIsLoading(true);
    await registerStaff({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword.trim(),
      employeeId: regEmployeeId.trim(),
      role: regRole,
      beat: regBeat,
      assignedOffice: regOffice.trim() || 'Dadabari S.O. (324009)',
      fixedKm: Number(regFixedKm) || 18,
      contact: regContact.trim(),
    });
    setIsLoading(false);
  };

  const handleQuickFillAdmin = () => {
    clearError();
    setMode('LOGIN');
    setEmail('mahen.comtech@gmail.com');
    setPassword('Mahen@2304');
  };

  const handleQuickFillStaff = (staffEmail: string, staffPass: string) => {
    clearError();
    setMode('LOGIN');
    setEmail(staffEmail);
    setPassword(staffPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Left Brand & Security Column (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-red-900 via-red-950 to-slate-950 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-red-800/40">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-400 tracking-wide">
                  भारतीय डाक विभाग · Department of Posts
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  India Post CRM & Postman OS
                </h1>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h2 className="text-2xl font-bold text-white leading-snug">
                Dadabari Sub-Post Office (324009) Operations Portal
              </h2>
              <p className="text-xs text-red-100/80 leading-relaxed">
                Restricted access portal for authenticated Postmen, Postal Assistants, and Master System Administrators. Integrated with Google Sheets & Gmail Backup Engine, Special Reimbursements, and Departmental Exam LMS.
              </p>
            </div>

            {/* Quick Credential Presets for Instant Verification */}
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-semibold text-amber-300">
                Authorized Demo & Master Credentials (Click to Fill):
              </div>

              <button
                type="button"
                onClick={handleQuickFillAdmin}
                className="w-full text-left p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-amber-500/40 transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-amber-300">
                    Master Super Admin (Full System Access)
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 mt-0.5 tabular-nums">
                    mahen.comtech@gmail.com · Pass: Mahen@2304
                  </div>
                </div>
                <ArrowRight size={15} className="text-amber-400 group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickFillStaff('ektamahenmeena@gmail.com', 'Staff@123')}
                className="w-full text-left p-3 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 border border-slate-700/80 transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-white">
                    Ekta Meena · Staff (Beat 2 · Fixed 18 KM)
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
                    ektamahenmeena@gmail.com · Pass: Staff@123
                  </div>
                </div>
                <ArrowRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickFillStaff('muskan.sharma@indiapost.gov.in', 'Post@123')}
                className="w-full text-left p-3 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 border border-slate-700/80 transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-white">
                    Muskan Sharma · Postman (Beat 1 · Fixed 16 KM)
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5 tabular-nums">
                    muskan.sharma@indiapost.gov.in · Pass: Post@123
                  </div>
                </div>
                <ArrowRight size={15} className="text-slate-400 group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-red-800/40 text-[11px] text-red-200/70 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <ShieldCheck size={14} />
              <span>Strict Role-Based Access & Auto-Backup Active</span>
            </div>
            <p>
              All field entries, scheme leads, and reimbursement claims are linked to your Employee ID and backed up to mahen.comtech@gmail.com.
            </p>
          </div>
        </div>

        {/* Right Authentication Form Column (7 cols) */}
        <div className="lg:col-span-7 p-8 bg-white text-slate-900 flex flex-col justify-between">
          <div>
            {/* Segmented Mode Selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-6 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  clearError();
                  setMode('LOGIN');
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center justify-center gap-2 ${
                  mode === 'LOGIN'
                    ? 'bg-red-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound size={15} />
                <span>Staff & Admin Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  clearError();
                  setMode('REGISTER');
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center justify-center gap-2 ${
                  mode === 'REGISTER'
                    ? 'bg-red-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus size={15} />
                <span>New Staff Registration</span>
              </button>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{error}</div>
                <button
                  type="button"
                  onClick={clearError}
                  className="text-red-700 hover:text-red-950 font-bold px-1.5"
                >
                  ✕
                </button>
              </div>
            )}

            {mode === 'LOGIN' ? (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Official / Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="mahen.comtech@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Security Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
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
                  type="submit"
                  disabled={isLoading}
                  id="password-login-submit-btn"
                  className="w-full py-3 px-4 bg-red-800 hover:bg-red-900 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserCheck size={17} />
                  <span>{isLoading ? 'Authenticating...' : 'Sign In to Operations OS'}</span>
                </button>

                <div className="relative my-5 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative inline-block px-3 bg-white text-[11px] text-slate-500 font-semibold">
                    OR CONNECT GOOGLE WORKSPACE (SHEETS & GMAIL SYNC)
                  </div>
                </div>

                {/* Official Google Sign-In Button for OAuth Workspace Sync */}
                <button
                  type="button"
                  onClick={() => signIn()}
                  id="google-signin-btn"
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-300 shadow-2xs transition cursor-pointer"
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 block">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name (Postman / Staff) *
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
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Employee ID (CSI / GDS ID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={regEmployeeId}
                      onChange={(e) => setRegEmployeeId(e.target.value)}
                      placeholder="e.g. CSI-10348920"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address *
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
                      Create Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Designation / Role
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as 'POSTMAN' | 'STAFF')}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                    >
                      <option value="POSTMAN">Postman / Mail Deliverer</option>
                      <option value="STAFF">Postal Assistant / Staff</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Assigned Beat No.
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
                    </select>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Posted Office Name
                    </label>
                    <input
                      type="text"
                      value={regOffice}
                      onChange={(e) => setRegOffice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={regContact}
                      onChange={(e) => setRegContact(e.target.value)}
                      placeholder="10-digit mobile"
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
                  <span>{isLoading ? 'Registering Account...' : 'Register & Enter Operations OS'}</span>
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>Kota Division · Rajasthan Postal Circle</span>
            <span className="font-mono tabular-nums">PIN 324009</span>
          </div>
        </div>
      </div>
    </div>
  );
}
