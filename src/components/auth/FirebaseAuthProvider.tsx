import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleWorkspaceProvider } from '../../lib/firebase';
import { setInMemoryAccessToken } from '../../lib/google-workspace';
import { staffPermissionService } from '../../services/staffPermissionService';
import { StaffProfile } from '../../types/models';

interface AuthContextType {
  user: User | any | null;
  userProfile: StaffProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<boolean>;
  registerStaff: (params: {
    name: string;
    email: string;
    password: string;
    employeeId: string;
    role: 'POSTMAN' | 'STAFF' | 'ADMIN';
    beat: string;
    assignedOffice: string;
    fixedKm: number;
    contact?: string;
  }) => Promise<boolean>;
  signInWithStaffEmail: (email: string, name?: string, role?: string, beat?: string) => Promise<boolean>;
  signInAsViewer: () => Promise<void>;
  switchStaffProfile: (email: string) => void;
  signOut: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signIn: async () => {},
  signInWithPassword: async () => false,
  registerStaff: async () => false,
  signInWithStaffEmail: async () => false,
  signInAsViewer: async () => {},
  switchStaffProfile: () => {},
  signOut: async () => {},
  error: null,
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const FirebaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | any | null>(null);
  const [userProfile, setUserProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check local staff session first for instant fast boot
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
      setLoading(false);
    }

    // 2. Listen to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const profile = staffPermissionService.getStaffProfileByEmail(firebaseUser.email || '');
        profile.uid = firebaseUser.uid;
        setUserProfile(profile);
        staffPermissionService.setActiveSession(profile);
      } else if (!staffPermissionService.getActiveSession()) {
        setInMemoryAccessToken(null);
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    // 3. Listen to staff permission changes
    const unsubStaff = staffPermissionService.subscribe(() => {
      const active = staffPermissionService.getActiveSession();
      if (active) {
        setUserProfile(active);
      }
    });

    return () => {
      unsubscribe();
      unsubStaff();
    };
  }, []);

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
      }
    } catch (err: any) {
      console.error('Error signing in with Google:', err);
      let errMsg = 'Google साइन-इन विफल रहा।';
      if (err.code === 'auth/popup-blocked') {
        errMsg = 'ब्राउज़र पॉप-अप ब्लॉक हो गया है। कृपया सीधे नीचे दिए गए ईमेल व पासवर्ड लॉगिन का उपयोग करें।';
      } else if (err.code === 'auth/popup-closed-by-user') {
        errMsg = 'साइन-इन विंडो बंद कर दी गई थी।';
      } else if (err.code === 'auth/network-request-failed') {
        errMsg = 'नेटवर्क कनेक्शन की समस्या है। कृपया इंटरनेट जांचें।';
      } else if (err.message) {
        errMsg = `लॉगिन त्रुटि: ${err.message}`;
      }
      setError(errMsg);
    }
  };

  const signInWithPassword = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    const authRes = staffPermissionService.authenticateWithPassword(email, password);
    if (!authRes.success || !authRes.profile) {
      setError(authRes.error || 'लॉगिन विफल रहा। कृपया ईमेल और पासवर्ड जांचें।');
      return false;
    }

    const profile = authRes.profile;
    staffPermissionService.setActiveSession(profile);
    setUserProfile(profile);
    setUser({
      uid: profile.uid || profile.id,
      email: profile.email,
      displayName: profile.name,
      emailVerified: true,
    } as any);
    return true;
  };

  const registerStaff = async (params: {
    name: string;
    email: string;
    password: string;
    employeeId: string;
    role: 'POSTMAN' | 'STAFF' | 'ADMIN';
    beat: string;
    assignedOffice: string;
    fixedKm: number;
    contact?: string;
  }): Promise<boolean> => {
    setError(null);
    try {
      const profile = staffPermissionService.registerStaffAccount(params);
      staffPermissionService.setActiveSession(profile);
      setUserProfile(profile);
      setUser({
        uid: profile.id,
        email: profile.email,
        displayName: profile.name,
        emailVerified: true,
      } as any);
      return true;
    } catch (err: any) {
      setError(err.message || 'पंजीकरण विफल रहा।');
      return false;
    }
  };

  const signInWithStaffEmail = async (email: string, name?: string, role?: string, beat?: string): Promise<boolean> => {
    setError(null);
    try {
      const profile = staffPermissionService.getStaffProfileByEmail(email);
      if (name) profile.name = name;
      if (role) profile.role = role as any;
      if (beat) profile.beat = beat;
      
      staffPermissionService.saveStaffProfile(profile);
      staffPermissionService.setActiveSession(profile);
      
      setUserProfile(profile);
      setUser({
        uid: profile.id,
        email: profile.email,
        displayName: profile.name,
        emailVerified: true,
      } as any);
      return true;
    } catch (err: any) {
      console.error('Error in staff login:', err);
      setError(err.message || 'स्टाफ लॉगिन विफल रहा');
      return false;
    }
  };

  const signInAsViewer = async (): Promise<void> => {
    setError(null);
    await signInWithStaffEmail('viewer@indiapost.gov.in', 'Field Observer (Viewer)', 'VIEWER', 'All Beats');
  };

  const switchStaffProfile = (email: string) => {
    const profile = staffPermissionService.getStaffProfileByEmail(email);
    staffPermissionService.setActiveSession(profile);
    setUserProfile(profile);
    setUser({
      uid: profile.id,
      email: profile.email,
      displayName: profile.name,
      emailVerified: true,
    } as any);
  };

  const signOut = async () => {
    try {
      await auth.signOut();
    } catch (e) {
      console.warn('Firebase signout error:', e);
    }
    setInMemoryAccessToken(null);
    staffPermissionService.setActiveSession(null);
    setUser(null);
    setUserProfile(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      signIn, 
      signInWithPassword,
      registerStaff,
      signInWithStaffEmail, 
      signInAsViewer, 
      switchStaffProfile, 
      signOut, 
      error, 
      clearError 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

