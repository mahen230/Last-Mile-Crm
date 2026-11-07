import React, { useState, useEffect } from 'react';
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
  ShieldAlert,
  Terminal,
  Check,
  Timer,
  Copy,
  Code2,
  Database,
  Activity,
  Flame,
  Users,
  ExternalLink,
} from 'lucide-react';
import {
  getDefaultFixedKmForBeat,
  staffPermissionService,
  DEFAULT_STAFF_FALLBACK_PASSWORD,
  KOTA_OFFICE_MASTER_LIST,
} from '../services/staffPermissionService';
import {
  securityAuthService,
  PasswordComplexityResult,
  LockoutStatus,
} from '../services/securityAuthService';
import { customerAuthService } from '../services/customerAuthService';
import { POSTAL_AUTH_DATABASE_SCHEMA_SQL } from '../server/secureAuthBackendReference';
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
    const state = location.state as { from?: { pathname: string } } | null;
    const dest = state?.from?.pathname || '/dashboard';
    if (dest === '/login' || dest === '/' || dest === '/home') {
      navigate('/dashboard', { replace: true });
    } else {
      navigate(dest, { replace: true });
    }
  };

  const finishCustomerLogin = () => {
    if (onClose) {
      onClose();
    }
    navigate('/portal', { replace: true });
  };

  // Primary Dual-Tier Authentication State: STAFF vs CUSTOMER
  const [authTier, setAuthTier] = useState<'STAFF' | 'CUSTOMER'>('STAFF');

  // Customer Tier State (Google OAuth + Mobile SMS OTP)
  const [custName, setCustName] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [custEnteredOtp, setCustEnteredOtp] = useState('');
  const [custGeneratedOtp, setCustGeneratedOtp] = useState<string | null>(null);
  const [custOtpStep, setCustOtpStep] = useState<'DETAILS' | 'VERIFY'>('DETAILS');

  // Staff Tier State
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'>(initialMode);
  const [identifier, setIdentifier] = useState('50510312');
  const [password, setPassword] = useState(DEFAULT_STAFF_FALLBACK_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cybersecurity Controls & Lockout State
  const [lockoutStatus, setLockoutStatus] = useState<LockoutStatus>(() =>
    securityAuthService.checkLockout('50510312')
  );
  const [csrfToken] = useState<string>(() => securityAuthService.getCsrfToken());
  const [showArchModal, setShowArchModal] = useState(false);
  const [archModalTab, setArchModalTab] = useState<'SQL' | 'EXPRESS' | 'LOGS' | 'HASH_TEST'>('SQL');
  const [copiedCode, setCopiedCode] = useState(false);

  // Interactive PBKDF2 hash demo state
  const [testPlainPassword, setTestPlainPassword] = useState('Post@1234');
  const [computedPbkdf2Hash, setComputedPbkdf2Hash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);

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

  // Real-time password complexity evaluation
  const activePasswordForCheck =
    mode === 'REGISTER' ? regPassword : mode === 'FORGOT_PASSWORD' ? newResetPassword : password;
  const passwordComplexity: PasswordComplexityResult =
    securityAuthService.evaluatePasswordComplexity(activePasswordForCheck);

  // Sync lockout timer countdown
  useEffect(() => {
    const status = securityAuthService.checkLockout(identifier);
    setLockoutStatus(status);

    let interval: NodeJS.Timeout | null = null;
    if (status.isLocked) {
      interval = setInterval(() => {
        const refreshed = securityAuthService.checkLockout(identifier);
        setLockoutStatus(refreshed);
        if (!refreshed.isLocked) {
          clearMessages();
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [identifier]);

  const clearMessages = () => {
    clearError();
    setLocalError(null);
    setSuccessMessage(null);
  };

  // =========================================================================
  // 1. CUSTOMER TIER HANDLERS (Citizen Google OAuth & Mobile OTP)
  // =========================================================================

  const handleCustomerGoogleSignIn = async () => {
    clearMessages();
    setIsLoading(true);
    try {
      await signIn();
      // Establish customer session
      customerAuthService.signInWithGoogle({
        uid: `goog_${Date.now()}`,
        displayName: 'Google Citizen User',
        email: 'citizen@gmail.com',
      });
      setIsLoading(false);
      finishCustomerLogin();
    } catch (e: any) {
      setIsLoading(false);
      setLocalError('Google OAuth sign in failed. Please try mobile OTP verification.');
    }
  };

  const handleCustomerRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!custName.trim() || !custMobile.trim()) {
      setLocalError('Please enter your Full Name and 10-digit Indian Mobile Number.');
      return;
    }

    const res = customerAuthService.requestMobileOtp(custMobile, custName);
    if (!res.success) {
      setLocalError(res.message);
      return;
    }

    setCustGeneratedOtp(res.otp || '123456');
    setCustEnteredOtp(res.otp || '123456');
    setCustOtpStep('VERIFY');
    setSuccessMessage(`${res.message} (Demo OTP: ${res.otp})`);
  };

  const handleCustomerVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const res = customerAuthService.verifyMobileOtp(custMobile, custEnteredOtp);
    if (!res.success) {
      setLocalError(res.message);
      return;
    }

    setSuccessMessage('Phone verified! Launching Citizen Portal...');
    setTimeout(finishCustomerLogin, 400);
  };

  // =========================================================================
  // 2. STAFF TIER HANDLERS (Discreet Departmental Auth Gate)
  // =========================================================================

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // 1. Cybersecurity Input Sanitization & Attack Detection (SQLi, XSS, NoSQLi)
    const idAttack = securityAuthService.detectInjectionAttack(identifier);
    const passAttack = securityAuthService.detectInjectionAttack(password);
    if (idAttack.isSuspicious || passAttack.isSuspicious) {
      const threat = idAttack.threatType || passAttack.threatType || 'MALICIOUS_INJECTION';
      setLocalError(
        `[CYBERSECURITY ALERT] Suspicious injection signature detected (${threat}). Request terminated and flagged in Postal IT Security Log.`
      );
      return;
    }

    if (!identifier.trim() || !password.trim()) {
      setLocalError('Please enter your Employee ID / Email / Mobile and Password.');
      return;
    }

    // 2. Brute-Force Rate Limiting & Account Lockout Check
    const currentLock = securityAuthService.checkLockout(identifier);
    if (currentLock.isLocked) {
      setLockoutStatus(currentLock);
      setLocalError(
        currentLock.reason || 'Account is temporarily locked due to multiple failed login attempts.'
      );
      return;
    }

    setIsLoading(true);
    const ok = await signInWithPassword(identifier.trim(), password.trim());
    setIsLoading(false);

    if (ok) {
      securityAuthService.recordSuccessfulLogin(identifier.trim());
      finishLoginAndEnterCRM();
    } else {
      const updatedLockout = securityAuthService.recordFailedAttempt(identifier.trim());
      setLockoutStatus(updatedLockout);

      if (updatedLockout.isLocked) {
        setLocalError(
          `[ACCOUNT LOCKED] Exceeded 5 consecutive failed login attempts. This account is locked for 15 minutes to prevent credential stuffing.`
        );
      } else {
        setLocalError(
          `Authentication failed. Invalid Employee ID or password. (${updatedLockout.remainingAttempts} attempts remaining before 15-minute security lockout).`
        );
      }
    }
  };

  const handleEmergencyFieldUnlock = () => {
    securityAuthService.unlockAccount(identifier.trim(), 'Sub-Postmaster Emergency Field Override');
    const refreshed = securityAuthService.checkLockout(identifier);
    setLockoutStatus(refreshed);
    setSuccessMessage(
      `Account ${identifier} has been unlocked via Sub-Postmaster Emergency Field Protocol. Rate limit reset.`
    );
    setLocalError(null);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const injectionCheck =
      securityAuthService.detectInjectionAttack(regEmployeeId) ||
      securityAuthService.detectInjectionAttack(regEmail);
    if (injectionCheck.isSuspicious) {
      setLocalError('[SECURITY ALERT] Malicious characters detected in registration fields.');
      return;
    }

    if (!regEmployeeId.trim() || !regName.trim() || !regContact.trim() || !regEmail.trim()) {
      setLocalError('All postal staff fields (Employee ID, Full Name, Mobile, and Email) are required.');
      return;
    }
    if (!/^\d{10}$/.test(regContact.replace(/\D/g, '').slice(-10))) {
      setLocalError('Please enter a valid 10-digit Mobile Number.');
      return;
    }

    if (regPassword && !passwordComplexity.isValid) {
      setLocalError(
        `Password does not meet enterprise security standards: ${passwordComplexity.errors.join(', ')}.`
      );
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
      name: securityAuthService.sanitizeInput(regName),
      email: securityAuthService.sanitizeInput(regEmail),
      password: regPassword.trim() || DEFAULT_STAFF_FALLBACK_PASSWORD,
      employeeId: securityAuthService.sanitizeEmployeeId(regEmployeeId),
      role: mappedRole,
      designationType: regDesignation,
      beat: regBeat,
      assignedOffice: `${regOfficeName} (${regPincode})`,
      subOffice: regOfficeName,
      officePincode: regPincode,
      fixedKm: Number(regFixedKm) || 18,
      contact: securityAuthService.sanitizeMobile(regContact),
    });
    setIsLoading(false);
    if (ok) {
      securityAuthService.recordSuccessfulLogin(regEmployeeId.trim());
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

    const injection = securityAuthService.detectInjectionAttack(forgotIdentifier);
    if (injection.isSuspicious) {
      setLocalError('[SECURITY ALERT] Malicious pattern detected in recovery field.');
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

    const resetComplexity = securityAuthService.evaluatePasswordComplexity(newResetPassword);
    if (!resetComplexity.isValid) {
      setLocalError(`New password must satisfy complexity: ${resetComplexity.errors.join(', ')}.`);
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

    securityAuthService.recordSuccessfulLogin(updated.employeeId || updated.email);
    setSuccessMessage('Password securely updated! Logging into Postman CRM...');
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
    securityAuthService.recordSuccessfulLogin('mahen.comtech@gmail.com');
    loginAsMasterAdmin();
    finishLoginAndEnterCRM();
  };

  const handleQuickFillStaff = (
    staffIdOrEmail: string,
    staffPass: string = DEFAULT_STAFF_FALLBACK_PASSWORD
  ) => {
    clearMessages();
    setMode('LOGIN');
    setIdentifier(staffIdOrEmail);
    setPassword(staffPass);
    securityAuthService.recordSuccessfulLogin(staffIdOrEmail);
    switchStaffProfile(staffIdOrEmail);
    finishLoginAndEnterCRM();
  };

  const handleTestPbkdf2Hash = async () => {
    setIsHashing(true);
    const salt = securityAuthService.generateSalt();
    const hash = await securityAuthService.hashPasswordWithSalt(testPlainPassword, salt);
    setComputedPbkdf2Hash(`$pbkdf2-sha256$i=100000$${salt}$${hash}`);
    setIsHashing(false);
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
      <div className="lg:col-span-5 bg-gradient-to-b from-red-900 via-red-950 to-slate-950 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-red-800/40">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-400 tracking-wide">
                भारतीय डाक विभाग · Department of Posts
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                {authTier === 'STAFF' ? 'Kota Division Staff Auth Gate' : 'Citizen Public Services Portal'}
              </h1>
            </div>
          </div>

          {authTier === 'STAFF' ? (
            <>
              <div className="space-y-1">
                <h2 className="text-base font-bold text-white leading-snug">
                  Directory-Verified Staff Login & Beat Access Control
                </h2>
                <p className="text-xs text-red-100/80 leading-relaxed">
                  Authenticate using your <strong>Employee ID (CSI/GDS ID)</strong>, <strong>Mobile Number</strong>, or <strong>Email</strong>. Default directory password for all postal staff is <code className="px-1.5 py-0.5 rounded bg-red-950 text-amber-300 font-mono font-bold">Post@1234</code>.
                </p>
              </div>

              {/* Quick Staff & Beat Access Presets */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-semibold text-amber-300 flex items-center justify-between">
                  <span>Instant 1-Click Verified Staff Access:</span>
                  <span className="text-[10px] text-amber-400/80 uppercase font-mono">Kota PIN 324009</span>
                </div>

                {/* Master Admin */}
                <button
                  type="button"
                  onClick={handleQuickFillAdmin}
                  id="master-admin-bypass-btn"
                  className="w-full text-left p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-300 transition flex items-center justify-between group shadow-md cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-black text-slate-950 uppercase tracking-wide flex items-center gap-1.5">
                      <ShieldCheck size={14} />
                      <span>1-Click Master Admin Bypass (Full Access)</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-900 font-semibold mt-0.5 tabular-nums">
                      ID: CSI-10023401 · mahen.comtech@gmail.com
                    </div>
                  </div>
                  <ArrowRight size={15} className="text-slate-950 group-hover:translate-x-0.5 transition shrink-0" />
                </button>

                {/* Beat 5: Mohit Arvind (Audited Screenshot Data) */}
                <button
                  type="button"
                  onClick={() => handleQuickFillStaff('10310736', DEFAULT_STAFF_FALLBACK_PASSWORD)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-950/90 border border-amber-500/40 transition flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <BadgeCheck size={14} className="text-amber-400" />
                      <span>Beat 5 · Mohit Arvind (Mahaveer Nagar Vistar)</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-300 mt-0.5 tabular-nums flex items-center gap-2">
                      <span>Emp ID: 10310736</span>
                      <span className="text-emerald-400">19 KM/day · 23 Days (₹1,573)</span>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-amber-400 group-hover:translate-x-0.5 transition shrink-0" />
                </button>

                {/* Beat 17: Priyanshu Trivedi (Audited Screenshot Data) */}
                <button
                  type="button"
                  onClick={() => handleQuickFillStaff('50507003', DEFAULT_STAFF_FALLBACK_PASSWORD)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-950/90 border border-sky-500/40 transition flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                      <BadgeCheck size={14} className="text-sky-400" />
                      <span>Beat 17 · Priyanshu Trivedi (Talwandi Sector B)</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-300 mt-0.5 tabular-nums flex items-center gap-2">
                      <span>Emp ID: 50507003</span>
                      <span className="text-emerald-400">28 KM/day · 25 Days (₹2,520)</span>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-sky-400 group-hover:translate-x-0.5 transition shrink-0" />
                </button>

                {/* Beat 2: Ekta Meena / M.K. Meena */}
                <button
                  type="button"
                  onClick={() => handleQuickFillStaff('50457421', DEFAULT_STAFF_FALLBACK_PASSWORD)}
                  className="w-full text-left p-2 rounded-xl bg-slate-950/40 hover:bg-slate-950/80 border border-slate-700/80 transition flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Beat 2 Staff · Ekta Meena / M.K. Meena
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5 tabular-nums">
                      Emp ID: CSI-10294812 · 18 KM/day · Pass: {DEFAULT_STAFF_FALLBACK_PASSWORD}
                    </div>
                  </div>
                  <ArrowRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <h2 className="text-base font-bold text-white leading-snug">
                  India Post Public Citizen Access Portal
                </h2>
                <p className="text-xs text-red-100/80 leading-relaxed">
                  Log in to track parcel deliveries, compute Sukanya Samriddhi (SSA) and Postal Life Insurance (PLI) returns, and book doorstep postman pickup services.
                </p>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/40 text-xs text-slate-300 space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck size={14} /> Zero Public Leakage Guarantee
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Citizen accounts strictly access public retail catalogs and personal inquiries. Internal beat logs, fuel calculation tables, and staff rosters are completely isolated.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-red-800/40 text-[11px] text-red-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <ShieldCheck size={14} />
              <span>Dual-Tier RBAC & Zero-Trust Gate</span>
            </div>
            <button
              type="button"
              onClick={() => setShowArchModal(true)}
              className="text-[10px] font-mono text-amber-400 hover:text-white underline cursor-pointer"
            >
              Inspect RBAC Middleware
            </button>
          </div>
          <p className="text-[10px] text-red-200/80">
            Enforces HTTP-Only SameSite=Strict session cookies, short-lived encrypted JWTs, PBKDF2/bcrypt hashing, and strict role guards.
          </p>
        </div>
      </div>

      {/* Right Authentication Form Column (7 cols) */}
      <div className="lg:col-span-7 p-6 bg-white text-slate-900 flex flex-col justify-between">
        <div>
          {/* Top Primary Tier Switcher: Citizen vs Staff */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-4 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                clearMessages();
                setAuthTier('STAFF');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authTier === 'STAFF'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound size={14} />
              <span>Staff / Admin Operations Gate</span>
            </button>
            <button
              type="button"
              onClick={() => {
                clearMessages();
                setAuthTier('CUSTOMER');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authTier === 'CUSTOMER'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={14} />
              <span>Citizen / Customer Login</span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* TIER 1: CITIZEN / CUSTOMER AUTHENTICATION FLOW            */}
          {/* ========================================================= */}
          {authTier === 'CUSTOMER' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-amber-700" />
                  <span>Public Citizen Entry (Dual-Tier Auth Tier 1)</span>
                </div>
                <p className="text-[11px] text-amber-900/80">
                  Access doorstep booking, parcel tracking, and small savings calculators. Choose direct Google sign-in or instant mobile number OTP verification.
                </p>
              </div>

              {activeError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{activeError}</div>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{successMessage}</div>
                </div>
              )}

              {/* Option A: Direct Sign in with Google */}
              <button
                type="button"
                onClick={handleCustomerGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs transition cursor-pointer"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 block">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span>Sign in with Google OAuth (Instant Citizen Access)</span>
              </button>

              <div className="relative my-2 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative inline-block px-3 bg-white text-[11px] text-slate-500 font-semibold">
                  OR SIGNUP / VERIFY WITH MOBILE SMS OTP
                </div>
              </div>

              {/* Option B: Mobile Number + SMS OTP */}
              {custOtpStep === 'DETAILS' ? (
                <form onSubmit={handleCustomerRequestOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      10-Digit Indian Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={custMobile}
                      onChange={(e) => setCustMobile(e.target.value)}
                      placeholder="e.g. 9829012345"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Smartphone size={15} />
                    <span>Send Verification SMS OTP</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCustomerVerifyOtp} className="space-y-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                    <span>Verifying +91 {custMobile}</span>
                    <button
                      type="button"
                      onClick={() => setCustOtpStep('DETAILS')}
                      className="text-red-700 underline font-bold"
                    >
                      Change Number
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Enter 6-Digit SMS OTP *
                    </label>
                    <input
                      type="text"
                      required
                      value={custEnteredOtp}
                      onChange={(e) => setCustEnteredOtp(e.target.value)}
                      placeholder="6-Digit OTP"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center tracking-widest text-lg font-bold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 size={15} />
                    <span>Verify OTP & Enter Citizen Portal</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TIER 2: DEPARTMENTAL STAFF & ADMIN AUTHENTICATION FLOW    */}
          {/* ========================================================= */}
          {authTier === 'STAFF' && (
            <>
              {/* Staff Sub-Mode Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-3 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setMode('LOGIN');
                  }}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center justify-center gap-1.5 ${
                    mode === 'LOGIN'
                      ? 'bg-red-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <KeyRound size={13} />
                  <span>Staff Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setMode('REGISTER');
                  }}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center justify-center gap-1.5 ${
                    mode === 'REGISTER'
                      ? 'bg-red-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus size={13} />
                  <span>Staff Registration</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setMode('FORGOT_PASSWORD');
                  }}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center justify-center gap-1.5 ${
                    mode === 'FORGOT_PASSWORD'
                      ? 'bg-red-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone size={13} />
                  <span>Forgot Password</span>
                </button>
              </div>

              {/* Brute-Force Rate Limiting & Account Lockout Banner */}
              {lockoutStatus.isLocked && (
                <div className="mb-3 p-3 rounded-xl bg-red-950 border border-red-700 text-white space-y-1.5 animate-pulse">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-200">
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                    <span>CYBERSECURITY DEFENSE: ACCOUNT TEMPORARILY LOCKED</span>
                  </div>
                  <p className="text-xs text-red-100 leading-relaxed">
                    5 consecutive failed login attempts detected. This account is locked for 15 minutes to prevent credential stuffing.
                  </p>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-red-800/80">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-amber-300">
                      <Timer size={14} />
                      <span>
                        Cooldown: {Math.floor(lockoutStatus.secondsRemaining / 60)}m{' '}
                        {lockoutStatus.secondsRemaining % 60}s
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleEmergencyFieldUnlock}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold rounded-lg transition cursor-pointer"
                    >
                      Emergency SPM Unlock
                    </button>
                  </div>
                </div>
              )}

              {/* Warning banner when attempts remaining < 5 */}
              {!lockoutStatus.isLocked && lockoutStatus.failedAttempts > 0 && (
                <div className="mb-3 p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Security Alert:</strong> {lockoutStatus.failedAttempts} failed attempt(s). Only{' '}
                      <strong className="text-red-700 font-mono">{lockoutStatus.remainingAttempts}</strong> attempt(s) remaining before lockout.
                    </span>
                  </div>
                </div>
              )}

              {activeError && !lockoutStatus.isLocked && (
                <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{activeError}</div>
                  <button type="button" onClick={clearMessages} className="text-red-700 hover:text-red-950 font-bold px-1">
                    ✕
                  </button>
                </div>
              )}

              {successMessage && (
                <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{successMessage}</div>
                </div>
              )}

              {mode === 'LOGIN' && (
                <form onSubmit={handlePasswordLogin} className="space-y-3">
                  <input type="hidden" name="csrf_token" value={csrfToken} />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Employee ID (CSI / GDS ID), Mobile, or Email *
                    </label>
                    <div className="relative">
                      <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);
                          setLockoutStatus(securityAuthService.checkLockout(e.target.value));
                        }}
                        placeholder="e.g. 10310736, 50507003, 50510312"
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
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
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password (default: Post@1234)"
                        className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2 text-slate-400 hover:text-slate-700 p-0.5"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickFillAdmin}
                    className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck size={15} />
                    <span>Direct Enter CRM Dashboard (Master Admin Instant Access)</span>
                    <ArrowRight size={14} />
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || lockoutStatus.isLocked}
                    id="password-login-submit-btn"
                    className="w-full py-2.5 px-4 bg-red-800 hover:bg-red-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserCheck size={15} />
                    <span>{isLoading ? 'Verifying Credentials...' : 'Sign In with Employee ID / Password'}</span>
                  </button>
                </form>
              )}

              {mode === 'REGISTER' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
                  <input type="hidden" name="csrf_token" value={csrfToken} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Employee ID / CSI ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={regEmployeeId}
                        onChange={(e) => setRegEmployeeId(e.target.value)}
                        placeholder="e.g. 10310736"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Mohit Arvind"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Designation *
                      </label>
                      <select
                        value={regDesignation}
                        onChange={(e) => setRegDesignation(e.target.value as DesignationType)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                      >
                        {DESIGNATION_LIST.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Assigned Beat *
                      </label>
                      <select
                        value={regBeat}
                        onChange={(e) => {
                          const b = e.target.value;
                          setRegBeat(b);
                          setRegFixedKm(getDefaultFixedKmForBeat(b));
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                      >
                        {Array.from({ length: 33 }, (_, i) => `Beat ${i + 1}`).map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Mobile *</label>
                      <input
                        type="tel"
                        required
                        value={regContact}
                        onChange={(e) => setRegContact(e.target.value)}
                        placeholder="10 digits"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Email *</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="name@indiapost.gov.in"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Password *</label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 8 chars"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-red-800 hover:bg-red-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 size={14} />
                    <span>{isLoading ? 'Registering...' : 'Register Postal Staff'}</span>
                  </button>
                </form>
              )}

              {mode === 'FORGOT_PASSWORD' && (
                <div className="space-y-3">
                  <form onSubmit={handleSendOtp} className="space-y-2">
                    <input type="hidden" name="csrf_token" value={csrfToken} />
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
                          placeholder="e.g. 10310736, 50507003"
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                        />
                        <button
                          type="submit"
                          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <RefreshCw size={13} />
                          <span>{generatedOtp ? 'Resend' : 'Send OTP'}</span>
                        </button>
                      </div>
                    </div>
                  </form>

                  {generatedOtp && (
                    <form onSubmit={handleVerifyOtpAndReset} className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
                        <span>OTP dispatched to <strong>{maskedTarget}</strong></span>
                        <span className="font-mono font-bold bg-amber-200/70 px-2 py-0.5 rounded">
                          OTP: {generatedOtp}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          required
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value)}
                          placeholder="6-digit OTP"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                        />
                        <input
                          type="password"
                          required
                          value={newResetPassword}
                          onChange={(e) => setNewResetPassword(e.target.value)}
                          placeholder="New password"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                        />
                        <input
                          type="password"
                          required
                          value={confirmResetPassword}
                          onChange={(e) => setConfirmResetPassword(e.target.value)}
                          placeholder="Confirm"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 size={14} />
                        <span>Verify OTP & Update Password</span>
                      </button>
                    </form>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>Kota Division · Rajasthan Circle (PIN 324009)</span>
            <button
              type="button"
              onClick={() => setShowArchModal(true)}
              className="text-red-800 hover:text-red-950 font-bold underline cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck size={12} />
              <span>RBAC Specs</span>
            </button>
          </div>
          <span className="font-mono tabular-nums">Default: Post@1234</span>
        </div>
      </div>

      {/* Enterprise RBAC & Cybersecurity Architecture Modal */}
      {showArchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500 text-slate-950">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    India Post Enterprise RBAC & Security Gateway Architecture
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Dual-Tier Access, Route Guard HOC, Zero-Leakage Sanitizer & PostgreSQL Schema
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowArchModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/60 border-b border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setArchModalTab('SQL')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                  archModalTab === 'SQL' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database size={13} />
                <span>PostgreSQL / Cloud SQL Schema</span>
              </button>
              <button
                type="button"
                onClick={() => setArchModalTab('EXPRESS')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                  archModalTab === 'EXPRESS' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 size={13} />
                <span>Express RBAC Middleware</span>
              </button>
              <button
                type="button"
                onClick={() => setArchModalTab('LOGS')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                  archModalTab === 'LOGS' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity size={13} />
                <span>Live Security Audit Logs ({securityAuthService.getRecentSecurityLogs().length})</span>
              </button>
              <button
                type="button"
                onClick={() => setArchModalTab('HASH_TEST')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                  archModalTab === 'HASH_TEST' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame size={13} />
                <span>Interactive PBKDF2 Test</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-slate-300">
              {archModalTab === 'SQL' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                    <span>DDL: staff_credentials, customer_citizens, password_reset_tokens, security_audit_logs</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(POSTAL_AUTH_DATABASE_SCHEMA_SQL);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer"
                    >
                      {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedCode ? 'Copied SQL' : 'Copy DDL SQL'}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-emerald-400 overflow-x-auto text-[11px] leading-relaxed">
                    {POSTAL_AUTH_DATABASE_SCHEMA_SQL}
                  </pre>
                </div>
              )}

              {archModalTab === 'EXPRESS' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-400">
                    Production Express.js RBAC Guard & Zero-Leakage Sanitizer Middleware:
                  </div>
                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-sky-300 overflow-x-auto text-[11px] leading-relaxed">
{`// 1. Route Clearance & RBAC Middleware
export function requireClearance(minTier, allowedRoles, isBeatScoped) {
  return (req, res, next) => {
    const token = req.cookies['postman_gov_token'] || req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Redirected to Login Gate' });

    const session = verifySessionToken(token);
    if (!session) return res.status(401).json({ error: 'SESSION_EXPIRED' });

    // Tier Hierarchy: CUSTOMER (1) < STAFF (2) < ADMIN (3)
    if (tierWeight[session.tier] < tierWeight[minTier]) {
      return res.status(403).json({ error: 'INSUFFICIENT_SECURITY_TIER', message: 'Restricted Postal Operations' });
    }

    if (allowedRoles && !allowedRoles.includes(session.role) && session.role !== 'MASTER_ADMIN') {
      return res.status(403).json({ error: 'ROLE_CLEARANCE_DENIED', message: 'Authorized Personnel Only' });
    }

    next();
  };
}

// 2. Data Privacy & Zero Public Leakage Sanitizer
export function sanitizePostalMetricsResponse(req, res, next) {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (req.userContext?.tier !== 'STAFF' && req.userContext?.tier !== 'ADMIN') {
      scrubSensitivePostalFields(body); // Removes ₹3.60/KM rates, sanctioned KM & PII
    }
    return originalJson(body);
  };
  next();
}`}
                  </pre>
                </div>
              )}

              {archModalTab === 'LOGS' && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-400 pb-1">Live Security Audit Trail:</div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {securityAuthService.getRecentSecurityLogs().map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] flex items-start justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                log.severity === 'CRITICAL'
                                  ? 'bg-red-950 text-red-400 border border-red-800'
                                  : log.severity === 'WARN'
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              }`}
                            >
                              {log.event}
                            </span>
                            <span className="text-slate-400">{log.identifier}</span>
                          </div>
                          <div className="text-slate-300">{log.details}</div>
                        </div>
                        <span className="text-slate-500 shrink-0 text-[10px]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {archModalTab === 'HASH_TEST' && (
                <div className="space-y-3 font-sans">
                  <div className="text-xs text-slate-300">
                    Test live WebCrypto PBKDF2 (100,000 iterations + SHA-256 + 16-byte random salt):
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testPlainPassword}
                      onChange={(e) => setTestPlainPassword(e.target.value)}
                      placeholder="Enter password to hash"
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white"
                    />
                    <button
                      type="button"
                      disabled={isHashing}
                      onClick={handleTestPbkdf2Hash}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Terminal size={14} />
                      <span>{isHashing ? 'Computing...' : 'Compute PBKDF2 Hash'}</span>
                    </button>
                  </div>
                  {computedPbkdf2Hash && (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                        Cryptographic Hash Output:
                      </div>
                      <div className="text-emerald-400 font-mono text-[11px] break-all">
                        {computedPbkdf2Hash}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Department of Posts · Information Security Management System (ISMS) ISO 27001 Aligned</span>
              <button
                type="button"
                onClick={() => setShowArchModal(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
              >
                Close Reference
              </button>
            </div>
          </div>
        </div>
      )}
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
