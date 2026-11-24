import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './FirebaseAuthProvider';
import { customerAuthService } from '../../services/customerAuthService';
import { staffPermissionService } from '../../services/staffPermissionService';
import { featureVisibilityService } from '../../services/featureVisibilityService';
import { dataClearanceSanitizer, SecurityClearanceLevel } from '../../services/dataClearanceSanitizer';
import { FeatureVisibilityKey, ServiceModulePermissions, UserRole, VendorSystemId } from '../../types/models';
import { ShieldAlert, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export type StaffRole =
  | 'OWNER'
  | 'MASTER_ADMIN'
  | 'DEVELOPER'
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'CIRCLE_INCHARGE'
  | 'DIVISION_INCHARGE'
  | 'DISTRICT_INCHARGE'
  | 'DISTRICT_MANAGER'
  | 'DISTRICT_OFFICE_STAFF'
  | 'BLOCK_INCHARGE'
  | 'OFFICE_INCHARGE'
  | 'SALES_FIELD_STAFF'
  | 'CATEGORY_MANAGER'
  | 'SPM'
  | 'PA'
  | 'POSTMAN'
  | 'GDS'
  | 'STAFF'
  | 'VIEWER'
  | 'CUSTOMER'
  | UserRole;

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredTier?: SecurityClearanceLevel;
  allowedRoles?: StaffRole[];
  requiredModule?: keyof ServiceModulePermissions;
  requiredFeature?: FeatureVisibilityKey;
  requiredVendor?: VendorSystemId;
  requiredBeat?: string;
  fallbackRedirect?: string;
}

/**
 * Robust Route Guard & Security Interceptor Component
 * Prevents unauthorized mounting or payload leakage of private dashboards,
 * employee logs, financial reconciliation sheets, and operational tools.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredTier = 'STAFF',
  allowedRoles,
  requiredModule,
  requiredFeature,
  requiredVendor,
  requiredBeat,
  fallbackRedirect = '/login',
}) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();
  const [, setVisibilityTick] = useState(0);

  useEffect(() => {
    return featureVisibilityService.subscribe(() => setVisibilityTick((v) => v + 1));
  }, []);

  // 1. Loading State: Do not mount or leak child component tree
  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
        <div className="w-10 h-10 border-4 border-red-800 border-t-amber-400 rounded-full animate-spin" />
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
          Verifying Security Clearance...
        </div>
      </div>
    );
  }

  // 2. Resolve Session & Clearance
  const activeCustomer = customerAuthService.getActiveCustomer();
  const isCustomerAuth = customerAuthService.isAuthenticatedCustomer();
  const isStaffAuth = Boolean(userProfile || user);

  // Unauthenticated check: instantly redirect without rendering children
  if (requiredTier !== 'PUBLIC') {
    if (requiredTier === 'CUSTOMER' && !isCustomerAuth && !isStaffAuth) {
      return <Navigate to={fallbackRedirect} state={{ from: location }} replace />;
    }
    if ((requiredTier === 'STAFF' || requiredTier === 'ADMIN') && !isStaffAuth) {
      return <Navigate to={fallbackRedirect} state={{ from: location }} replace />;
    }
  }

  // 3. Customer vs Staff Tier Isolation
  // Prevent Customer accounts from accessing private operational tools
  if ((requiredTier === 'STAFF' || requiredTier === 'ADMIN') && isCustomerAuth && !isStaffAuth) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-white shadow-2xl space-y-5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-950 border border-red-700 text-red-400 flex items-center justify-center mx-auto">
          <ShieldAlert size={32} />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/80 text-red-300 text-xs font-black uppercase tracking-wider">
          <Lock size={13} /> 403 Forbidden: Restricted Postal Operations
        </div>
        <h2 className="text-xl font-bold text-white">
          Departmental Clearance Required
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-lg mx-auto">
          You are currently signed in as a <strong>Citizen Customer ({activeCustomer?.name})</strong>. Internal postman field sheets, ACG-61 fuel calculations, and staff rosters are strictly restricted to verified Department of Posts personnel.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/login"
            className="px-4 py-2.5 bg-red-800 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>Switch to Staff Login Gate</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/portal"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
          >
            Return to Public Citizen Portal
          </Link>
        </div>
      </div>
    );
  }

  // 4. Role-Based Access Control (RBAC) Check
  if (allowedRoles && allowedRoles.length > 0 && userProfile) {
    const userRole = userProfile.role as StaffRole;
    const isMasterAdmin = staffPermissionService.isSuperAdmin(userProfile);
    const hasRole = isMasterAdmin || allowedRoles.includes(userRole);

    if (!hasRole) {
      return (
        <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-red-200 rounded-3xl shadow-xl text-slate-900 space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-center mx-auto">
            <Lock size={32} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase">
            <ShieldAlert size={14} /> Role Clearance Denied
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Authorized Personnel Only
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-lg mx-auto">
            This operational module requires one of the following roles:{' '}
            <strong className="text-red-700">{allowedRoles.join(', ')}</strong>. Your active profile (
            <strong>{userProfile.name}</strong>) has role <span className="font-mono font-bold">{userRole}</span>.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/dashboard"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>Back to Dashboard</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      );
    }
  }

  // 5. Service Module Permissions Guard
  if (requiredModule && userProfile) {
    const isModuleAllowed = staffPermissionService.canAccessServiceModule(userProfile, requiredModule);
    if (!isModuleAllowed) {
      return (
        <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-red-200 rounded-3xl shadow-xl text-slate-900 space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-center mx-auto">
            <Lock size={32} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase">
            <ShieldCheck size={14} /> Module Clearance Required
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Permission Required: {String(requiredModule)}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-lg mx-auto">
            Your staff account is not assigned active permission for this service module. Please contact Master Admin Ekta Meena (Ektamahenmeena@gmail.com) for authorization.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/dashboard"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>Return to Dashboard</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      );
    }
  }

  // 5b. Granular Feature Visibility & Vendor Isolation Guard
  if (userProfile) {
    const effectiveFeature = requiredFeature || featureVisibilityService.mapPathToFeature(location.pathname);
    const isWhiteLabel = featureVisibilityService.isWhiteLabelPostalMode(userProfile);

    if (requiredVendor && !featureVisibilityService.canAccessVendorSystem(userProfile, requiredVendor)) {
      return (
        <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-900 space-y-4 text-center">
          <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mx-auto">
            <Lock size={26} />
          </div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            Vendor Scope Boundary
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Access Restricted to Assigned Vendor Workspace
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            Your active profile (<strong>{userProfile.name}</strong>) is scoped to your assigned operational vendor system and cannot open external vendor directories or unrelated partner consoles.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
            >
              <span>Return to Dashboard</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      );
    }

    if (effectiveFeature && !featureVisibilityService.isFeatureVisible(userProfile, effectiveFeature)) {
      return (
        <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-900 space-y-4 text-center">
          <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mx-auto">
            <Lock size={26} />
          </div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            {isWhiteLabel ? 'India Post Vendor System · Section Not Enabled' : 'Module Visibility Restricted'}
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Section Currently Hidden for Your Role
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            This module is currently hidden by system visibility controls. Your active workspace displays only the sections enabled for your role ({userProfile.role || 'Staff'}).
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/properties"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
            >
              <span>Open Property Directory</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/customers"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
            >
              <span>Open Members Directory</span>
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              Dashboard
            </Link>
          </div>
        </div>
      );
    }
  }

  // 6. Beat Clearance Check
  if (requiredBeat && userProfile) {
    const ctx = dataClearanceSanitizer.resolveContext(userProfile);
    const clearance = dataClearanceSanitizer.assertClearance(ctx, 'STAFF', requiredBeat);
    if (!clearance.authorized) {
      return (
        <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-red-200 rounded-3xl shadow-xl text-slate-900 space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            Beat Isolation Enforcement
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-lg mx-auto">
            {clearance.reason}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/dashboard"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      );
    }
  }

  // All clearance checks cleared: securely render protected component tree
  return <>{children}</>;
};

/**
 * Higher-Order Component (HOC) Pattern for Route Guarding
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function GuardedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
