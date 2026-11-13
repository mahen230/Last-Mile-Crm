import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleWorkspaceProvider } from '../../lib/firebase';
import { setInMemoryAccessToken } from '../../lib/google-workspace';
import { staffPermissionService } from '../../services/staffPermissionService';
import {
  clearUserSession,
  createNewSecureSession,
  fetchServerCsrfToken,
  getBrowserProfileId,
  getDeviceFingerprint,
  subscribeToSessionInvalidation,
} from '../../services/authSecurityService';
import { StaffProfile } from '../../types/models';

interface AuthContextType {
  user: User | any | null;
  userProfile: StaffProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInWithPassword: (identifier: string, password: string) => Promise<boolean>;
  registerStaff: (params: {
    name: string;
    email: string;
    password: string;
    employeeId: string;
    role: 'POSTMAN' | 'STAFF' | 'ADMIN';
    designationType?: string;
    beat: string;
    assignedOffice: string;
    subOffice?: string;
    officePincode?: string;
    fixedKm: number;
    contact?: string;
  }) => Promise<boolean>;
  signInAsViewer: () => Promise<void>;
  switchStaffProfile: (email: string) => void;
  signOut: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: false,
  signIn: async () => {},
  signInWithPassword: async () => false,
  registerStaff: async () => false,
  signInAsViewer: async () => {},
  switchStaffProfile: () => {},
  signOut: async () => {},
  error: null,
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const FirebaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userProfile, setUserProfile] = useState<StaffProfile | null>(() => {
    return staffPermissionService.getActiveSession();
  });

  const [user, setUser] = useState<User | any | null>(() => {
    const initialSession = staffPermissionService.getActiveSession();
    if (!initialSession) return null;
    return {
      uid: initialSession.uid || initialSession.id,
      email: initialSession.email,
      displayName: initialSession.name,
      photoURL: initialSession.photoURL || null,
      emailVerified: true,
    } as any;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performLocalAndServerSignOut = useCallback(async (reasonMessage?: string) => {
    try {
      await auth.signOut();
    } catch {
      // ignore firebase signout fallback
    }
    try {
      const csrf = await fetchServerCsrfToken();
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrf || '',
        },
      });
    } catch {
      // ignore network error during logout
    }
    try {
      localStorage.removeItem('postman_auth');
    } catch {
      // ignore storage error
    }
    const active = staffPermissionService.getActiveSession();
    if (active?.id) {
      clearUserSession(active.id);
    }
    if (active?.employeeId) {
      clearUserSession(active.employeeId);
    }
    if (active?.email) {
      clearUserSession(active.email);
    }
    setInMemoryAccessToken(null);
    staffPermissionService.setActiveSession(null);
    setUser(null);
    setUserProfile(null);
    setError(reasonMessage || null);
  }, []);

  useEffect(() => {
    // 1. Sync active verified local staff session (no unverified auto-grant)
    const localSession = staffPermissionService.getActiveSession();
    if (localSession) {
      setUserProfile(localSession);
      setUser({
        uid: localSession.uid || localSession.id,
        email: localSession.email,
        displayName: localSession.name,
        photoURL: localSession.photoURL || null,
        emailVerified: true,
      } as any);
    }
    setLoading(false);

    // 2. Listen to Firebase auth state (non-blocking)
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          const profile = staffPermissionService.getStaffProfileByEmail(firebaseUser.email || '');
          profile.uid = firebaseUser.uid;
          setUserProfile(profile);
          staffPermissionService.setActiveSession(profile);
        } else {
          const currentActive = staffPermissionService.getActiveSession();
          if (currentActive) {
            setUserProfile(currentActive);
            setUser({
              uid: currentActive.uid || currentActive.id,
              email: currentActive.email,
              displayName: currentActive.name,
              photoURL: currentActive.photoURL || null,
              emailVerified: true,
            } as any);
          } else {
            setInMemoryAccessToken(null);
            setUser(null);
            setUserProfile(null);
          }
        }
        setLoading(false);
      });
    } catch (e) {
      console.warn('Firebase Auth listener fallback active:', e);
      setLoading(false);
    }

    // 3. Listen to staff permission & profile changes
    const unsubStaff = staffPermissionService.subscribe(() => {
      const active = staffPermissionService.getActiveSession();
      if (active) {
        setUserProfile((prev) => {
          if (
            prev &&
            prev.id === active.id &&
            prev.email === active.email &&
            prev.role === active.role &&
            prev.beat === active.beat &&
            prev.subOffice === active.subOffice &&
            prev.name === active.name
          ) {
            return prev;
          }
          return { ...active };
        });
        setUser((prev: any) => {
          const nextUid = active.uid || active.id;
          if (prev && prev.uid === nextUid && prev.email === active.email && prev.displayName === active.name) {
            return prev;
          }
          return {
            uid: nextUid,
            email: active.email,
            displayName: active.name,
            photoURL: active.photoURL || null,
            emailVerified: true,
          };
        });
      }
    });

    // 4. Enforce Single-Browser Session Invalidation across tabs and devices
    const unsubSessionInvalidation = subscribeToSessionInvalidation((reason) => {
      void performLocalAndServerSignOut(
        reason || 'Your session was invalidated because this account logged in from another browser or device.'
      );
    });

    return () => {
      unsubscribe();
      unsubStaff();
      unsubSessionInvalidation();
    };
  }, [performLocalAndServerSignOut]);

  const signIn = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleWorkspaceProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setInMemoryAccessToken(credential.accessToken);
      }
      if (result?.user) {
        const profile = staffPermissionService.getStaffProfileByEmail(result.user.email || '');
        profile.uid = result.user.uid;
        setUser(result.user);
        setUserProfile(profile);
        staffPermissionService.setActiveSession(profile);
        await createNewSecureSession(profile.id, {
          email: profile.email,
          name: profile.name,
          beat: profile.beat,
        });
      }
    } catch (err: any) {
      setError(
        err?.message || 'Google sign-in unavailable in this context. Please sign in with Employee ID and password.'
      );
    }
  };

  const signInWithPassword = async (identifier: string, password: string): Promise<boolean> => {
    setError(null);
    const cleanId = identifier.trim();
    const cleanPass = password.trim();
    const fp = await getDeviceFingerprint();
    const browserProfileId = getBrowserProfileId();
    const csrfToken = await fetchServerCsrfToken();

    let serverResponded = false;
    let serverOk = false;
    let serverErrorCode = '';
    let serverErrorMsg = '';
    let serverUser: any = null;

    try {
      const res = await fetch('/api/v1/auth/staff/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || '',
          'x-device-fingerprint': fp,
          'x-browser-profile-id': browserProfileId,
        },
        body: JSON.stringify({
          identifier: cleanId,
          employeeId: cleanId,
          password: cleanPass,
          deviceFingerprint: fp,
          browserProfileId,
        }),
      });
      serverResponded = true;
      const payload = await res.json().catch(() => ({}));
      if (res.ok && payload?.success) {
        serverOk = true;
        serverUser = payload.user;
      } else {
        serverErrorCode = payload?.error || '';
        serverErrorMsg = payload?.message || 'Invalid staff credentials.';
        if (res.status === 429 || res.status === 403) {
          setError(serverErrorMsg);
          return false;
        }
      }
    } catch {
      serverResponded = false;
    }

    if (serverResponded && !serverOk && serverErrorCode !== 'STAFF_NOT_FOUND') {
      setError(serverErrorMsg || 'Invalid staff credentials.');
      return false;
    }

    const authRes = staffPermissionService.authenticateWithPassword(cleanId, cleanPass);
    if (!serverOk && (!authRes.success || !authRes.profile)) {
      setError(serverErrorMsg || authRes.error || 'लॉगिन विफल रहा। कृपया Employee ID और पासवर्ड जांचें।');
      return false;
    }

    const profile =
      authRes.profile ||
      staffPermissionService.findStaffProfileByIdentifier(serverUser?.employeeId || serverUser?.email || cleanId) ||
      staffPermissionService.getStaffProfileByEmail(serverUser?.email || cleanId);

    if (serverUser && typeof serverUser.hasCustomPassword === 'boolean') {
      profile.hasCustomPassword = serverUser.hasCustomPassword;
    }

    staffPermissionService.setActiveSession(profile);
    setUserProfile(profile);
    setUser({
      uid: profile.uid || profile.id,
      email: profile.email,
      displayName: profile.name,
      emailVerified: true,
    } as any);

    await createNewSecureSession(profile.id, {
      email: profile.email,
      name: profile.name,
      beat: profile.beat,
    });
    return true;
  };

  const registerStaff = async (params: {
    name: string;
    email: string;
    password: string;
    employeeId: string;
    role: 'POSTMAN' | 'STAFF' | 'ADMIN';
    designationType?: string;
    beat: string;
    assignedOffice: string;
    subOffice?: string;
    officePincode?: string;
    fixedKm: number;
    contact?: string;
  }): Promise<boolean> => {
    setError(null);
    try {
      const fp = await getDeviceFingerprint();
      const browserProfileId = getBrowserProfileId();
      const csrfToken = await fetchServerCsrfToken();

      const res = await fetch('/api/v1/auth/staff/register', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || '',
          'x-device-fingerprint': fp,
          'x-browser-profile-id': browserProfileId,
        },
        body: JSON.stringify(params),
      }).catch(() => null);

      if (res && !res.ok && res.status === 409) {
        const payload = await res.json().catch(() => ({}));
        setError(payload?.message || 'Staff account already exists.');
        return false;
      }

      const profile = staffPermissionService.registerStaffAccount(params);
      staffPermissionService.setActiveSession(profile);
      setUserProfile(profile);
      setUser({
        uid: profile.id,
        email: profile.email,
        displayName: profile.name,
        emailVerified: true,
      } as any);

      await createNewSecureSession(profile.id, {
        email: profile.email,
        name: profile.name,
        beat: profile.beat,
      });
      return true;
    } catch (err: any) {
      setError(err.message || 'पंजीकरण विफल रहा।');
      return false;
    }
  };

  const signInAsViewer = async (): Promise<void> => {
    setError(null);
    const profile = staffPermissionService.getStaffProfileByEmail('viewer@indiapost.gov.in');
    staffPermissionService.setActiveSession(profile);
    setUserProfile(profile);
    setUser({
      uid: profile.id,
      email: profile.email,
      displayName: profile.name,
      emailVerified: true,
    } as any);
  };

  const switchStaffProfile = (identifierOrEmail: string) => {
    setError(null);
    if (!staffPermissionService.isSuperAdmin(userProfile)) {
      setError('Unauthorized: Only Master Admin (Ekta Meena) can switch active operational profiles.');
      return;
    }
    const profile =
      staffPermissionService.findStaffProfileByIdentifier(identifierOrEmail) ||
      staffPermissionService.getStaffProfileByEmail(identifierOrEmail);
    profile.mustChangePassword = false;
    staffPermissionService.setActiveSession(profile);
    setUserProfile({ ...profile });
    setUser({
      uid: profile.id,
      email: profile.email,
      displayName: profile.name,
      emailVerified: true,
    } as any);
  };

  const signOut = async () => {
    await performLocalAndServerSignOut();
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signIn,
        signInWithPassword,
        registerStaff,
        signInAsViewer,
        switchStaffProfile,
        signOut,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

