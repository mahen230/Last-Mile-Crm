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
  ChevronDown,
  ChevronUp,
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
import { createNewSecureSession, getActiveSessionToken } from '../services/authSecurityService';
import { customerAuthService } from '../services/customerAuthService';
import { POSTAL_AUTH_DATABASE_SCHEMA_SQL } from '../server/secureAuthBackendReference';
import { DesignationType } from '../types/models';
import SearchableOfficeSelect from '../components/common/SearchableOfficeSelect';

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
  initialTier?: 'STAFF' | 'CUSTOMER';
  isStaffDirect?: boolean;
}

export default function LoginPage({
  isModal = false,
  onClose,
  initialMode = 'LOGIN',
  initialTier,
  isStaffDirect = false,
}: LoginPageProps) {
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
    if (dest === '/login' || dest === '/' || dest === '/home' || dest === '/staff-gateway') {
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
  // Citizens / Customers are primary (First). Staff Gateway is discrete and secured.
  const [authTier, setAuthTier] = useState<'STAFF' | 'CUSTOMER'>(() => {
    if (initialTier) return initialTier;
    if (typeof window !== 'undefined' && (window.location.pathname.includes('staff') || isStaffDirect)) {
      return 'STAFF';
    }
    return 'CUSTOMER';
  });

  // Customer Tier State (Registration First! as requested)
  const [custRegMode, setCustRegMode] = useState<'REGISTER' | 'LOGIN'>('REGISTER');
  const [custName, setCustName] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [custRegLocality, setCustRegLocality] = useState('Dadabari Extension');
  const [custRegPincode, setCustRegPincode] = useState('324009');
  const [custRegScheme, setCustRegScheme] = useState('Sukanya Samriddhi Yojana (SSY)');
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

  // Mobile drawer / presets collapse state
  const [showMobilePresets, setShowMobilePresets] = useState(false);

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

  // 1. Customer Handlers
  const handleCustomerRegister = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    if (!custName.trim() || !custMobile.trim()) {
      setLocalError('Please enter your Full Name and 10-digit Indian Mobile Number.');
      return;
    }
    const cleanMobile = custMobile.replace(/\D/g, '').slice(-10);
    if (!/^\d{10}$/.test(cleanMobile)) {
      setLocalError('Please enter a valid 10-digit Indian Mobile Number.');
      return;
    }
    const res = customerAuthService.registerCustomerAccount({
      name: custName.trim(),
      mobile: cleanMobile,
      colony: custRegLocality,
      pincode: custRegPincode,
      schemeInterest: custRegScheme,
    });
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(finishCustomerLogin, 400);
    }
  };

  const handleCustomerGoogleSignIn = async () => {
    clearMessages();
    setIsLoading(true);
    try {
      await signIn();
      customerAuthService.signInWithGoogle({
        uid: `goog_${Date.now()}`,
        displayName: 'Google Citizen User',
        email: 'citizen@gmail.com',
      });
      setIsLoading(false);
      finishCustomerLogin();
    } catch {
      setIsLoading(false);
      setLocalError('Google OAuth sign-in failed. Please try mobile OTP verification.');
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

  // 2. Staff Handlers
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

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
      await createNewSecureSession(identifier.trim());
      finishLoginAndEnterCRM();
    } else {
      const updatedLockout = securityAuthService.recordFailedAttempt(identifier.trim());
      setLockoutStatus(updatedLockout);

      if (updatedLockout.isLocked) {
        setLocalError(
          `[ACCOUNT LOCKED] Exceeded 5 consecutive failed login attempts. This account is locked for 15 minutes.`
        );
      } else {
        setLocalError(
          `Authentication failed. Invalid Employee ID or password. (${updatedLockout.remainingAttempts} attempts remaining before 15-minute lockout).`
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
      await createNewSecureSession(updated.employeeId || updated.email);
      finishLoginAndEnterCRM();
    }
  };

  const handleQuickFillAdmin = async () => {
    clearMessages();
    setMode('LOGIN');
    setIdentifier('mahen.comtech@gmail.com');
    setPassword('Mahen@2304');
    securityAuthService.recordSuccessfulLogin('mahen.comtech@gmail.com');
    await createNewSecureSession('mahen.comtech@gmail.com');
    loginAsMasterAdmin();
    finishLoginAndEnterCRM();
  };

  const handleQuickFillStaff = async (
    staffIdOrEmail: string,
    staffPass: string = DEFAULT_STAFF_FALLBACK_PASSWORD
  ) => {
    clearMessages();
    setMode('LOGIN');
    setIdentifier(staffIdOrEmail);
    setPassword(staffPass);
    securityAuthService.recordSuccessfulLogin(staffIdOrEmail);
    await createNewSecureSession(staffIdOrEmail);
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

  // Reusable Preset Buttons Component for high visual clarity
  const presetsList = (
    <div className="space-y-2">
      {/* 1-Click Master Admin */}
      <button
        type="button"
        onClick={handleQuickFillAdmin}
        id="master-admin-bypass-btn"
        className="w-full text-left p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400/80 transition flex items-center justify-between group shadow-sm cursor-pointer"
      >
        <div className="min-w-0">
          <div className="text-xs font-black uppercase tracking-wide flex items-center gap-1.5 truncate">
            <ShieldCheck size={14} className="shrink-0" />
            <span className="truncate">1-Click Master Admin Access</span>
          </div>
          <div className="text-[11px] font-mono text-slate-900 mt-0.5 truncate">
            CSI-10023401 • mahen.comtech@gmail.com
          </div>
        </div>
        <ArrowRight size={15} className="text-slate-950 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
      </button>

      {/* Beat 5: Mohit Arvind */}
      <button
        type="button"
        onClick={() => handleQuickFillStaff('10310736', DEFAULT_STAFF_FALLBACK_PASSWORD)}
        className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-amber-400/40 transition flex items-center justify-between group text-white cursor-pointer"
      >
        <div className="min-w-0">
          <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 truncate">
            <BadgeCheck size={14} className="text-amber-400 shrink-0" />
            <span className="truncate">Beat 5 • Mohit Arvind (Mahaveer Nagar)</span>
          </div>
          <div className="text-[10px] font-mono text-slate-200 mt-0.5 truncate">
            Emp ID: 10310736 • 19 KM/d • ₹1,573 Claim
          </div>
        </div>
        <ArrowRight size={14} className="text-amber-300 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
      </button>

      {/* Beat 17: Priyanshu Trivedi */}
      <button
        type="button"
        onClick={() => handleQuickFillStaff('50507003', DEFAULT_STAFF_FALLBACK_PASSWORD)}
        className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-sky-400/40 transition flex items-center justify-between group text-white cursor-pointer"
      >
        <div className="min-w-0">
          <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5 truncate">
            <BadgeCheck size={14} className="text-sky-400 shrink-0" />
            <span className="truncate">Beat 17 • Priyanshu Trivedi (Talwandi)</span>
          </div>
          <div className="text-[10px] font-mono text-slate-200 mt-0.5 truncate">
            Emp ID: 50507003 • 28 KM/d • ₹2,520 Claim
          </div>
        </div>
        <ArrowRight size={14} className="text-sky-300 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
      </button>

      {/* Beat 2: Ekta Meena */}
      <button
        type="button"
        onClick={() => handleQuickFillStaff('50457421', DEFAULT_STAFF_FALLBACK_PASSWORD)}
        className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition flex items-center justify-between group text-white cursor-pointer"
      >
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-200 truncate">
            Beat 2 Staff • Ekta Meena / M.K. Meena
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
            Emp ID: CSI-10294812 • 18 KM/d • Pass: Post@1234
          </div>
        </div>
        <ArrowRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
      </button>
    </div>
  );

  const contentCard = (
    <div className="max-w-4xl w-full mx-auto bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col lg:grid lg:grid-cols-12 relative">
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

      {/* Left Column: Official India Post Crimson Identity & Presets (5 cols on lg) */}
      <div className="lg:col-span-5 bg-gradient-to-b from-red-800 via-red-900 to-slate-900 p-6 sm:p-7 text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-red-700/40">
        <div className="space-y-4">
          {/* Official Emblem & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
              📮
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                भारतीय डाक विभाग • India Post
              </div>
              <h1 className="text-lg font-black text-white tracking-tight leading-tight truncate">
                {authTier === 'STAFF' ? 'Kota Division Staff Gate' : 'Citizen Public Services'}
              </h1>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-100 leading-snug">
              {authTier === 'STAFF'
                ? 'Directory-Verified Staff & Beat Operations Portal'
                : '100% Sovereign Guarantee Citizen Portal'}
            </h2>
            <p className="text-xs text-red-100/80 leading-relaxed">
              {authTier === 'STAFF'
                ? 'Authenticate using your Employee ID (CSI/GDS ID), Mobile, or Email. Default postal directory password is Post@1234.'
                : 'Access postal parcel tracking, Sukanya Samriddhi (SSA), PLI calculators, and doorstep pickup service.'}
            </p>
          </div>

          {/* Desktop Presets View (Hidden on mobile to save scroll space) */}
          {authTier === 'STAFF' && (
            <div className="hidden lg:block pt-2">
              <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <ShieldCheck size={14} />
                <span>1-Click Verified Staff Access (Dadabari SO):</span>
              </div>
              {presetsList}
            </div>
          )}
        </div>

        {/* Footer info in left column */}
        <div className="pt-4 border-t border-red-700/40 text-[11px] text-red-200/80 flex items-center justify-between">
          <span className="font-mono">PIN 324009 • Rajasthan Circle</span>
          <button
            type="button"
            onClick={() => setShowArchModal(true)}
            className="text-amber-300 hover:text-white underline font-mono text-[10px] cursor-pointer"
          >
            RBAC Specs
          </button>
        </div>
      </div>

      {/* Right Column: Clean, High-Contrast Authentication Form (7 cols on lg) */}
      <div className="lg:col-span-7 p-5 sm:p-7 bg-white text-slate-900 flex flex-col justify-between">
        <div>
          {/* Top Primary Tier Switcher: Citizen (Default/Primary) vs Official Staff */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-4 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                clearMessages();
                setAuthTier('CUSTOMER');
              }}
              className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer touch-target ${
                authTier === 'CUSTOMER'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={14} />
              <span>Citizen & Customer Portal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                clearMessages();
                setAuthTier('STAFF');
              }}
              className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer touch-target ${
                authTier === 'STAFF'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound size={14} />
              <span>Official Staff Gateway</span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* TIER 1: CITIZEN / CUSTOMER AUTHENTICATION FLOW            */}
          {/* ========================================================= */}
          {authTier === 'CUSTOMER' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                <div className="font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-amber-700" />
                    <span>Citizen Doorstep Postal & Banking Portal</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded">
                    100% Sovereign Guarantee
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/80">
                  Register for doorstep services, Sukanya Samriddhi (SSY), Postal Life Insurance (PLI), SCSS pension, or IPPB banking.
                </p>
              </div>

              {/* Sub-Switcher: Registration (First!) vs Quick Login */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setCustRegMode('REGISTER');
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    custRegMode === 'REGISTER'
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus size={13} />
                  <span>1. New Citizen Registration</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setCustRegMode('LOGIN');
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    custRegMode === 'LOGIN'
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone size={13} />
                  <span>2. Quick Citizen Login</span>
                </button>
              </div>

              {activeError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{activeError}</div>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{successMessage}</div>
                </div>
              )}

              {/* Citizen Registration Form (First Priority!) */}
              {custRegMode === 'REGISTER' ? (
                <form onSubmit={handleCustomerRegister} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar Sharma"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white min-h-[42px]"
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
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white min-h-[42px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Locality / Colony *
                      </label>
                      <select
                        value={custRegLocality}
                        onChange={(e) => setCustRegLocality(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white min-h-[42px]"
                      >
                        <option value="Dadabari Extension">Dadabari Extension (324009)</option>
                        <option value="Keshavpura Sector 1-7">Keshavpura Sector 1-7 (324005)</option>
                        <option value="Mahaveer Nagar Vistar">Mahaveer Nagar Vistar (324005)</option>
                        <option value="Teachers Colony & Shastri Nagar">Teachers Colony (324009)</option>
                        <option value="Vigyan Nagar Industrial Area">Vigyan Nagar (324005)</option>
                        <option value="Basant Vihar Sector A-C">Basant Vihar (324009)</option>
                        <option value="Pratap Chowk Baran">Pratap Chowk (Baran 325205)</option>
                        <option value="Anta NTPC Township">Anta NTPC (Baran 325202)</option>
                        <option value="Sadar Bazar Bundi">Sadar Bazar (Bundi 323001)</option>
                        <option value="ACC Colony Lakheri">ACC Lakheri (Bundi 323803)</option>
                        <option value="Other Hadoti Locality">Other Pan-India Locality</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Postal Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={custRegPincode}
                        onChange={(e) => setCustRegPincode(e.target.value)}
                        placeholder="324009"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white min-h-[42px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Primary Service / Scheme of Interest
                    </label>
                    <select
                      value={custRegScheme}
                      onChange={(e) => setCustRegScheme(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white min-h-[42px]"
                    >
                      <option value="Sukanya Samriddhi Yojana (SSY)">Sukanya Samriddhi Yojana (SSY · 8.2% Tax Free)</option>
                      <option value="Senior Citizen Savings Scheme (SCSS)">Senior Citizen Savings Scheme (SCSS · 8.2% Quarterly Pension)</option>
                      <option value="Postal Life Insurance (PLI / RPLI)">Postal Life Insurance (PLI · Highest Bonus)</option>
                      <option value="IPPB Digital Banking & Aadhaar ATM">IPPB Digital Banking & Aadhaar Doorstep ATM</option>
                      <option value="Speed Post & Parcel Booking">Speed Post & Parcel Doorstep Booking</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <CheckCircle2 size={15} />
                    <span>Register Citizen Account & Proceed</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setCustRegMode('LOGIN')}
                      className="text-xs font-bold text-blue-900 hover:underline cursor-pointer"
                    >
                      Already registered? Click here to Login
                    </button>
                  </div>
                </form>
              ) : (
                /* Citizen Login Form */
                <div className="space-y-4">
                  {/* Google Sign In */}
                  <button
                    type="button"
                    onClick={handleCustomerGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs transition cursor-pointer min-h-[44px]"
                  >
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 block">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                    <span>Sign in with Google Account</span>
                  </button>

                  <div className="relative my-3 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative inline-block px-3 bg-white text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      OR VERIFY WITH MOBILE SMS OTP
                    </div>
                  </div>

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
                          placeholder="e.g. Ramesh Kumar Sharma"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white min-h-[42px]"
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
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white min-h-[42px]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
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
                          className="text-red-700 underline font-bold cursor-pointer"
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
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center tracking-widest font-black min-h-[44px]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                      >
                        <CheckCircle2 size={15} />
                        <span>Verify OTP & Enter Citizen Portal</span>
                      </button>
                    </form>
                  )}

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setCustRegMode('REGISTER')}
                      className="text-xs font-bold text-blue-900 hover:underline cursor-pointer"
                    >
                      New User? Click here to Register
                    </button>
                  </div>
                </div>
              )}

              {/* Discrete Staff Link only visible at the bottom */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Department of Posts · India Post</span>
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setAuthTier('STAFF');
                  }}
                  className="text-slate-400 hover:text-slate-700 font-semibold flex items-center gap-1 transition cursor-pointer"
                  title="Official Departmental Staff Gateway (Restricted Access)"
                >
                  <Lock size={11} className="text-slate-400" />
                  <span>Authorized Staff Gateway →</span>
                </button>
              </div>
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
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center justify-center gap-1 cursor-pointer touch-target ${
                    mode === 'LOGIN'
                      ? 'bg-red-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <KeyRound size={12} />
                  <span>Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setMode('REGISTER');
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center justify-center gap-1 cursor-pointer touch-target ${
                    mode === 'REGISTER'
                      ? 'bg-red-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus size={12} />
                  <span>Registration</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setMode('FORGOT_PASSWORD');
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center justify-center gap-1 cursor-pointer touch-target ${
                    mode === 'FORGOT_PASSWORD'
                      ? 'bg-red-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone size={12} />
                  <span>Forgot</span>
                </button>
              </div>

              {/* Single Session & Security Status Indicator */}
              <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                  <span>Single-Device Session & Token Protection Active</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  Anti-Concurrent
                </span>
              </div>

              {/* Brute-Force Rate Limiting & Account Lockout Banner */}
              {lockoutStatus.isLocked && (
                <div className="mb-3 p-3 rounded-xl bg-red-950 border border-red-700 text-white space-y-1.5 animate-pulse">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-200">
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                    <span>ACCOUNT TEMPORARILY LOCKED</span>
                  </div>
                  <p className="text-xs text-red-100 leading-relaxed">
                    5 consecutive failed attempts detected. Cooldown lock active for 15 minutes.
                  </p>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-red-800/80">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-amber-300">
                      <Timer size={14} />
                      <span>
                        {Math.floor(lockoutStatus.secondsRemaining / 60)}m{' '}
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
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {lockoutStatus.failedAttempts} failed attempt(s).{' '}
                      <strong className="text-red-700 font-mono">{lockoutStatus.remainingAttempts}</strong> remaining before lockout.
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
                      Employee ID / CSI ID / Mobile *
                    </label>
                    <div className="relative">
                      <IdCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);
                          setLockoutStatus(securityAuthService.checkLockout(e.target.value));
                        }}
                        placeholder="e.g. 10310736, 50507003, 50510312"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:bg-white min-h-[42px]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Password (Default: <span className="font-mono text-red-700 font-bold">Post@1234</span>) *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          clearMessages();
                          setForgotIdentifier(identifier);
                          setMode('FORGOT_PASSWORD');
                        }}
                        className="text-[11px] font-bold text-red-700 hover:text-red-900 hover:underline cursor-pointer"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:bg-white min-h-[42px]"
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

                  {/* 1-Click Master Admin Instant Bypass */}
                  <button
                    type="button"
                    onClick={handleQuickFillAdmin}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <ShieldCheck size={16} />
                    <span>Enter CRM Dashboard (Master Admin Instant Access)</span>
                    <ArrowRight size={14} />
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || lockoutStatus.isLocked}
                    id="password-login-submit-btn"
                    className="w-full py-2.5 px-4 bg-red-800 hover:bg-red-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <UserCheck size={16} />
                    <span>{isLoading ? 'Verifying Credentials...' : 'Sign In with Employee ID'}</span>
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
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 min-h-[40px]"
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
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 min-h-[40px]"
                      />
                    </div>
                  </div>

                  {/* Module 1: Live Searchable Office Directory with + Add Custom Office */}
                  <SearchableOfficeSelect
                    value={regOfficeName}
                    pincodeValue={regPincode}
                    onChange={(selected) => {
                      setRegOfficeName(selected.officeName);
                      setRegPincode(selected.pincode);
                    }}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Designation *
                      </label>
                      <select
                        value={regDesignation}
                        onChange={(e) => setRegDesignation(e.target.value as DesignationType)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 min-h-[40px]"
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
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 min-h-[40px]"
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
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 min-h-[40px]"
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
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 min-h-[40px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Password *</label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 8 chars"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 min-h-[40px]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-red-800 hover:bg-red-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <CheckCircle2 size={15} />
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
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700 min-h-[42px]"
                        />
                        <button
                          type="submit"
                          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[42px]"
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
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 min-h-[40px]"
                        />
                        <input
                          type="password"
                          required
                          value={newResetPassword}
                          onChange={(e) => setNewResetPassword(e.target.value)}
                          placeholder="New password"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 min-h-[40px]"
                        />
                        <input
                          type="password"
                          required
                          value={confirmResetPassword}
                          onChange={(e) => setConfirmResetPassword(e.target.value)}
                          placeholder="Confirm"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 min-h-[40px]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                      >
                        <CheckCircle2 size={15} />
                        <span>Verify OTP & Update Password</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Mobile-Friendly Quick Presets Accordion Toggle */}
              <div className="lg:hidden mt-4 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowMobilePresets(!showMobilePresets)}
                  className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-amber-600" />
                    <span>⚡ 1-Click Fast Access (Master Admin, Beat 5, Beat 17)</span>
                  </span>
                  {showMobilePresets ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
                {showMobilePresets && (
                  <div className="mt-2 p-2 bg-slate-900 rounded-2xl">
                    {presetsList}
                  </div>
                )}

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">Authorized Personnel Only</span>
                  <button
                    type="button"
                    onClick={() => {
                      clearMessages();
                      setAuthTier('CUSTOMER');
                    }}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>← Return to Public Citizen Portal</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Clean Footer Bar */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>Kota Division • Rajasthan Circle</span>
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

      {/* Enterprise RBAC & Architecture Modal */}
      {showArchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
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
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/60 border-b border-slate-800 text-xs overflow-x-auto">
              <button
                type="button"
                onClick={() => setArchModalTab('SQL')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                  archModalTab === 'SQL' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database size={13} />
                <span>PostgreSQL / Cloud SQL Schema</span>
              </button>
              <button
                type="button"
                onClick={() => setArchModalTab('EXPRESS')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                  archModalTab === 'EXPRESS' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 size={13} />
                <span>Express RBAC Middleware</span>
              </button>
              <button
                type="button"
                onClick={() => setArchModalTab('LOGS')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                  archModalTab === 'LOGS' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity size={13} />
                <span>Security Logs</span>
              </button>
              <button
                type="button"
                onClick={() => setArchModalTab('HASH_TEST')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                  archModalTab === 'HASH_TEST' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame size={13} />
                <span>PBKDF2 Test</span>
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
                      <span>{copiedCode ? 'Copied' : 'Copy SQL'}</span>
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
    if (!token) return res.status(401).json({ error: 'UNAUTHENTICATED' });

    const session = verifySessionToken(token);
    if (!session) return res.status(401).json({ error: 'SESSION_EXPIRED' });

    // Tier Hierarchy: CUSTOMER (1) < STAFF (2) < ADMIN (3)
    if (tierWeight[session.tier] < tierWeight[minTier]) {
      return res.status(403).json({ error: 'INSUFFICIENT_SECURITY_TIER' });
    }

    if (allowedRoles && !allowedRoles.includes(session.role) && session.role !== 'MASTER_ADMIN') {
      return res.status(403).json({ error: 'ROLE_CLEARANCE_DENIED' });
    }

    next();
  };
}`}
                  </pre>
                </div>
              )}

              {archModalTab === 'LOGS' && (
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
              )}

              {archModalTab === 'HASH_TEST' && (
                <div className="space-y-3 font-sans">
                  <div className="text-xs text-slate-300">
                    Test WebCrypto PBKDF2 (100,000 iterations + SHA-256 + 16-byte random salt):
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
                      <span>{isHashing ? 'Computing...' : 'Hash'}</span>
                    </button>
                  </div>
                  {computedPbkdf2Hash && (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                      <div className="text-emerald-400 font-mono text-[11px] break-all">
                        {computedPbkdf2Hash}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Department of Posts • ISMS ISO 27001 Aligned</span>
              <button
                type="button"
                onClick={() => setShowArchModal(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {contentCard}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 text-slate-900 flex flex-col justify-center py-6 px-3 sm:px-6 lg:px-8">
      {contentCard}
    </div>
  );
}
