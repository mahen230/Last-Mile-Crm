import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import Layout from './components/Layout';
import PublicHomePortal from './components/PublicHomePortal';
import Dashboard from './components/Dashboard';
import { FirebaseAuthProvider, useAuth } from './components/auth/FirebaseAuthProvider';
import { staffPermissionService } from './services/staffPermissionService';
import { featureVisibilityService } from './services/featureVisibilityService';
import { FeatureVisibilityKey, ServiceModulePermissions } from './types/models';
import LoginPage from './pages/LoginPage';
import XpeedoHomeLoginPage from './pages/XpeedoHomeLoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { OTAUpdateNotification } from './components/common/OTAUpdateNotification';
import { dataConsolidationService } from './services/dataConsolidationService';
import { kotaOsHierarchyService } from './services/kotaOsHierarchyService';

// Lazy-load CRM & administrative modules for instant 0ms initial load on Public Home & Dashboard
const CustomerList = lazy(() => import('./components/customers/CustomerList'));
const HouseholdsView = lazy(() => import('./components/crm/HouseholdsView'));
const PropertiesView = lazy(() => import('./components/crm/PropertiesView'));
const SequenceWisePropertyHub = lazy(() => import('./components/crm/SequenceWisePropertyHub'));
const UnifiedPropertyFamilyHub = lazy(() => import('./components/crm/UnifiedPropertyFamilyHub'));
const FamilyView = lazy(() => import('./components/crm/FamilyView'));
const LeadsPipelineView = lazy(() => import('./components/crm/LeadsPipelineView'));
const ServicesCatalogView = lazy(() => import('./components/crm/ServicesCatalogView'));
const FollowUpsView = lazy(() => import('./components/crm/FollowUpsView'));
const TasksView = lazy(() => import('./components/crm/TasksView'));
const AddressResolutionView = lazy(() => import('./components/crm/AddressResolutionView'));
const BusinessesView = lazy(() => import('./components/crm/BusinessesView'));
const CommercialPropertyHub = lazy(() => import('./components/crm/CommercialPropertyHub'));
const BeatsView = lazy(() => import('./components/crm/BeatsView'));
const BeatManagementView = lazy(() => import('./components/crm/BeatManagementView'));
const StaffView = lazy(() => import('./components/crm/StaffView'));
const OfficeMasterView = lazy(() => import('./components/crm/OfficeMasterView'));
const StaffMasterView = lazy(() => import('./components/crm/StaffMasterView'));
const RoleAccessDashboard = lazy(() => import('./components/crm/RoleAccessDashboard'));
const SpecialFormsView = lazy(() => import('./components/crm/SpecialFormsView'));
const Acg61ChargeReportView = lazy(() => import('./components/crm/Acg61ChargeReportView'));
const CommunicationView = lazy(() => import('./components/crm/CommunicationView'));
const DataQualityView = lazy(() => import('./components/crm/DataQualityView'));
const AuditLogView = lazy(() => import('./components/crm/AuditLogView'));
const SettingsView = lazy(() => import('./components/crm/SettingsView'));
const BeatMap = lazy(() => import('./components/crm/BeatMap'));
const PostalLMSView = lazy(() => import('./components/crm/PostalLMSView'));
const ReportsView = lazy(() => import('./components/crm/ReportsView'));
const MasterSourceSync = lazy(() => import('./components/MasterSourceSync'));
const MasterDataHub = lazy(() => import('./components/crm/MasterDataHub'));
const AIAssistantView = lazy(() => import('./components/crm/AIAssistantView'));
const CustomerPortal = lazy(() => import('./components/customer-facing/CustomerPortal'));

// Role-Based Views: Admin & Postman Workspaces
const StaffRegistrationsView = lazy(() => import('./components/admin/StaffRegistrationsView'));
const ProfileApprovalsView = lazy(() => import('./components/admin/ProfileApprovalsView'));
const AdminVerificationsView = lazy(() => import('./components/admin/AdminVerificationsView'));
const DailyVerificationView = lazy(() => import('./components/postman/DailyVerificationView'));
const MySubmissionsView = lazy(() => import('./components/postman/MySubmissionsView'));
const MyBeatDirectoryView = lazy(() => import('./components/postman/MyBeatDirectoryView'));
const MyProfileView = lazy(() => import('./components/postman/MyProfileView'));
const StaffStorefrontView = lazy(() => import('./components/postman/StaffStorefrontView'));
const MasterDataUploadView = lazy(() => import('./components/admin/MasterDataUploadView'));
const PostmanAllDayArticlesOverview = lazy(() => import('./components/postman/PostmanAllDayArticlesOverview'));
const OfficialStaffDocumentsHub = lazy(() => import('./components/crm/OfficialStaffDocumentsHub'));
const ColleagueStaffDirectory = lazy(() => import('./components/crm/ColleagueStaffDirectory'));
const OfficialApplicationsView = lazy(() => import('./components/crm/OfficialApplicationsView'));
const StaffProductStudioView = lazy(() => import('./components/crm/StaffProductStudioView'));
const AICommercialIntelligenceHub = lazy(() => import('./components/crm/AICommercialIntelligenceHub'));
const VendorProductEcosystemHub = lazy(() => import('./components/crm/VendorProductEcosystemHub'));
const DynamicProductPageView = lazy(() => import('./components/common/DynamicProductPageView'));
const PrivateDevConsole = lazy(() => import('./pages/PrivateDevConsole'));
const BrandStorePage = lazy(() => import('./pages/BrandStorePage'));
const CustomerRegisterPage = lazy(() => import('./pages/CustomerRegisterPage'));
const B2BPartnerPortalPage = lazy(() => import('./pages/B2BPartnerPortalPage'));
const LocationIntelligenceHub = lazy(() => import('./components/crm/LocationIntelligenceHub'));
const DoorstepSurveyWorkflowView = lazy(() => import('./components/postman/DoorstepSurveyWorkflowView'));
const DataBackupCenterView = lazy(() => import('./components/admin/DataBackupCenterView'));
const PartnerBrandManagementHub = lazy(() => import('./components/admin/PartnerBrandManagementHub'));
const PartnerLoginPage = lazy(() => import('./pages/PartnerLoginPage'));
const PartnerScopedWorkspacePage = lazy(() => import('./pages/PartnerScopedWorkspacePage'));
const BrandOwnerLoginPage = lazy(() => import('./pages/BrandOwnerLoginPage'));
const BrandOwnerPortalPage = lazy(() => import('./pages/BrandOwnerPortalPage'));
const BrandStaffCustomerLoginPage = lazy(() => import('./pages/BrandStaffCustomerLoginPage'));
const BrandScopedPortalPage = lazy(() => import('./pages/BrandScopedPortalPage'));
const IndiaPostStorefrontView = lazy(() => import('./components/crm/IndiaPostStorefrontView'));
const ProductTargetDashboard = lazy(() => import('./components/crm/ProductTargetDashboard'));
const IndiaPostMasterSearchAndInspectionView = lazy(() =>
  import('./components/xpeedo/IndiaPostMasterSearchAndInspectionView')
);
const PublicShortLinkPortalPage = lazy(() => import('./pages/PublicShortLinkPortalPage'));
const LastMileVendorView = lazy(() => import('./components/crm/LastMileVendorView'));

// India Post Command Center & Operations Modules
const OwnerCommandDashboard = lazy(() => import('./components/xpeedo/OwnerCommandDashboard'));
const ClientsDirectoryView = lazy(() => import('./components/xpeedo/ClientsDirectoryView'));
const ClientDetailsView = lazy(() => import('./components/xpeedo/ClientDetailsView'));
const ProjectsAndTasksView = lazy(() => import('./components/xpeedo/ProjectsAndTasksView'));
const IndiaPostCommandWorkspace = lazy(() => import('./components/xpeedo/IndiaPostCommandWorkspace'));
const SettingsRbacMigrationView = lazy(() => import('./components/xpeedo/SettingsRbacMigrationView'));
const DepartmentsDirectoryView = lazy(() =>
  import('./components/xpeedo/OperationsSupportViews').then((m) => ({
    default: m.DepartmentsDirectoryView,
  }))
);
const EmployeesDirectoryView = lazy(() =>
  import('./components/xpeedo/OperationsSupportViews').then((m) => ({
    default: m.EmployeesDirectoryView,
  }))
);
const WorkflowsAutomationView = lazy(() =>
  import('./components/xpeedo/OperationsSupportViews').then((m) => ({
    default: m.WorkflowsAutomationView,
  }))
);
const DocumentsCenterView = lazy(() =>
  import('./components/xpeedo/OperationsSupportViews').then((m) => ({
    default: m.DocumentsCenterView,
  }))
);
const FinanceLedgerView = lazy(() =>
  import('./components/xpeedo/OperationsSupportViews').then((m) => ({
    default: m.FinanceLedgerView,
  }))
);
const ReportsCenterView = lazy(() =>
  import('./components/xpeedo/OperationsSupportViews').then((m) => ({
    default: m.ReportsCenterView,
  }))
);
const NotificationsCenterView = lazy(() =>
  import('./components/xpeedo/OperationsSupportViews').then((m) => ({
    default: m.NotificationsCenterView,
  }))
);
import { xpeedoOpsService } from './services/xpeedoOpsService';

function ServiceModuleGuard({
  moduleKey,
  featureKey,
  moduleTitle,
  children,
}: {
  moduleKey: keyof ServiceModulePermissions;
  featureKey?: FeatureVisibilityKey;
  moduleTitle: string;
  children: React.ReactNode;
}) {
  const { userProfile } = useAuth();
  const [, setVisTick] = useState(0);
  useEffect(() => featureVisibilityService.subscribe(() => setVisTick((v) => v + 1)), []);

  if (staffPermissionService.isSuperAdmin(userProfile)) {
    return <>{children}</>;
  }

  const legacyAllowed = staffPermissionService.canAccessServiceModule(userProfile, moduleKey);
  const featureAllowed = featureKey ? featureVisibilityService.isFeatureVisible(userProfile, featureKey) : true;
  const isWhiteLabel = featureVisibilityService.isWhiteLabelPostalMode(userProfile);

  if (legacyAllowed && featureAllowed) {
    return <>{children}</>;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-xl mx-auto my-8 shadow-sm text-center space-y-4">
      <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mx-auto">
        <Lock size={28} />
      </div>
      <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
        {isWhiteLabel ? 'India Post Vendor System · Visibility Control' : 'Service-Level Visibility Control'}
      </div>
      <h2 className="text-lg font-bold text-slate-900">
        Module Not Enabled: {moduleTitle}
      </h2>
      <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
        Your profile (<strong>{userProfile?.name}</strong> ·{' '}
        <span className="font-mono">{userProfile?.employeeId || userProfile?.email}</span>) does not currently have{' '}
        <strong>{moduleTitle}</strong> enabled in your workspace visibility settings.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          to="/properties"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        >
          <span>Properties</span>
          <ArrowRight size={14} />
        </Link>
        <Link
          to="/customers"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
        >
          Members
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

function WorkspaceBoundaryGuard({
  requiredWorkspace,
  children,
}: {
  requiredWorkspace?: 'INDIA_POST' | 'XPEEDO_EV';
  children: React.ReactNode;
}) {
  const { userProfile } = useAuth();
  const [, setTick] = useState(0);
  useEffect(() => xpeedoOpsService.subscribe(() => setTick((t) => t + 1)), []);

  if (!requiredWorkspace || staffPermissionService.isSuperAdmin(userProfile)) {
    return <>{children}</>;
  }
  const scoped = xpeedoOpsService.getScopedWorkspaceKeys(userProfile);
  if (scoped === 'ALL' || scoped.includes(requiredWorkspace)) {
    return <>{children}</>;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-xl mx-auto my-8 text-center space-y-4">
      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mx-auto">
        <Lock size={22} />
      </div>
      <div className="text-xs font-mono font-semibold uppercase text-slate-500">
        Workspace Isolation Boundary
      </div>
      <h2 className="text-lg font-bold text-slate-900">
        Restricted Workspace: {requiredWorkspace}
      </h2>
      <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
        Your active role scope (<strong>{userProfile?.name}</strong>) is strictly isolated and does
        not permit access to <strong>{requiredWorkspace}</strong> records or screens.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
      >
        <span>Return to Permitted Dashboard</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

function DashboardRouter({ onSwitchToCustomerPortal }: { onSwitchToCustomerPortal: () => void }) {
  const { userProfile } = useAuth();
  const isWhiteLabel = featureVisibilityService.isWhiteLabelPostalMode(userProfile);
  const strictVendor = featureVisibilityService.isStrictlyScopedToVendor(userProfile);
  const isFieldPostal =
    isWhiteLabel ||
    strictVendor === 'INDIA_POST' ||
    ['POSTMAN', 'GDS', 'SALES_FIELD_STAFF'].includes(String(userProfile?.role || '').toUpperCase());

  if (isFieldPostal) {
    return <Dashboard onSwitchToCustomerPortal={onSwitchToCustomerPortal} />;
  }
  return <OwnerCommandDashboard />;
}

function DormantRetailRedirect() {
  const { userProfile } = useAuth();
  return <Navigate to={userProfile ? '/dashboard' : '/'} replace />;
}

function AuthenticatedApp() {
  const { user, userProfile } = useAuth();
  const [showPortalMode, setShowPortalMode] = useState(false);
  const [retailActive, setRetailActive] = useState(() =>
    featureVisibilityService.isRetailServicesActive()
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    return featureVisibilityService.subscribe(() => {
      setRetailActive(featureVisibilityService.isRetailServicesActive());
    });
  }, []);

  const isPublicRoute =
    location.pathname === '/' ||
    location.pathname === '/home' ||
    location.pathname === '/portal' ||
    location.pathname === '/staff-gateway' ||
    location.pathname === '/dev-command-secure-portal' ||
    location.pathname === '/b2b-partner' ||
    location.pathname.startsWith('/brand') ||
    location.pathname.startsWith('/partner/login') ||
    location.pathname.startsWith('/partner/workspace') ||
    location.pathname.startsWith('/client/login') ||
    location.pathname.startsWith('/client/workspace') ||
    location.pathname.startsWith('/product/');

  if (location.pathname.startsWith('/brand-login')) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-center text-xs font-semibold text-slate-600">Loading India Post Portal Login...</div>}>
        <Routes>
          <Route path="/brand-login/:brandSlug" element={<BrandOwnerLoginPage />} />
          <Route path="/brand-login" element={<BrandOwnerLoginPage />} />
        </Routes>
      </Suspense>
    );
  }

  if (location.pathname.startsWith('/brand-portal')) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-center text-xs font-semibold text-slate-600">Loading India Post Command Workspace...</div>}>
        <Routes>
          <Route path="/brand-portal/:brandSlug" element={<BrandOwnerPortalPage />} />
          <Route path="/brand-portal" element={<BrandOwnerPortalPage />} />
        </Routes>
      </Suspense>
    );
  }

  if (location.pathname.startsWith('/brand-access')) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-center text-xs font-semibold text-slate-600">Loading India Post Staff &amp; Customer Portal...</div>}>
        <Routes>
          <Route path="/brand-access/:brandSlug" element={<BrandStaffCustomerLoginPage />} />
          <Route path="/brand-access" element={<BrandStaffCustomerLoginPage />} />
        </Routes>
      </Suspense>
    );
  }

  if (location.pathname.startsWith('/brand-member-portal')) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-center text-xs font-semibold text-slate-600">Loading India Post Member Workspace...</div>}>
        <Routes>
          <Route path="/brand-member-portal/:brandSlug" element={<BrandScopedPortalPage />} />
          <Route path="/brand-member-portal" element={<BrandScopedPortalPage />} />
        </Routes>
      </Suspense>
    );
  }

  if (location.pathname.startsWith('/partner/login') || location.pathname.startsWith('/client/login')) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-center text-xs font-semibold text-slate-600">Loading India Post Bulk Customer Portal...</div>}>
        <Routes>
          <Route path="/client/login/:partnerSlug" element={<PartnerLoginPage />} />
          <Route path="/client/login" element={<PartnerLoginPage />} />
          <Route path="/partner/login/:partnerSlug" element={<PartnerLoginPage />} />
          <Route path="/partner/login" element={<PartnerLoginPage />} />
        </Routes>
      </Suspense>
    );
  }

  if (location.pathname.startsWith('/partner/workspace') || location.pathname.startsWith('/client/workspace')) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-center text-xs font-semibold text-slate-600">Loading India Post Workspace...</div>}>
        <Routes>
          <Route path="/client/workspace/:partnerSlug" element={<PartnerScopedWorkspacePage />} />
          <Route path="/client/workspace" element={<PartnerScopedWorkspacePage />} />
          <Route path="/partner/workspace/:partnerSlug" element={<PartnerScopedWorkspacePage />} />
          <Route path="/partner/workspace" element={<PartnerScopedWorkspacePage />} />
        </Routes>
      </Suspense>
    );
  }

  if (location.pathname === '/dev-command-secure-portal') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-950 p-8 text-center text-sm font-bold text-amber-300">Verifying Master Gateway...</div>}>
        <PrivateDevConsole />
      </Suspense>
    );
  }

  if (!retailActive && (location.pathname === '/' || location.pathname === '/home')) {
    if (userProfile) {
      return <Navigate to={kotaOsHierarchyService.getDefaultWorkspacePath(userProfile)} replace />;
    }
    return (
      <>
        <XpeedoHomeLoginPage />
        <OTAUpdateNotification />
      </>
    );
  }

  if (!retailActive && location.pathname === '/b2b-partner') {
    return <DormantRetailRedirect />;
  }

  if (location.pathname === '/register') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-950 p-8 text-center text-sm font-bold text-slate-300">Loading Customer Registration...</div>}>
        <CustomerRegisterPage />
      </Suspense>
    );
  }

  if (location.pathname === '/b2b-partner') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-center text-sm font-bold text-slate-700">Loading India Post Bulk Customer Portal...</div>}>
        <B2BPartnerPortalPage />
      </Suspense>
    );
  }

  if (location.pathname.startsWith('/s/')) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-950 p-8 text-center text-sm font-bold text-slate-300">Loading India Post Short Link Portal...</div>}>
        <Routes>
          <Route path="/s/:shortCode" element={<PublicShortLinkPortalPage />} />
        </Routes>
      </Suspense>
    );
  }

  if (location.pathname.startsWith('/brand')) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-center text-sm font-bold text-slate-700">Loading India Post Bulk Showcase...</div>}>
        <Routes>
          <Route path="/brand/:brandSlug" element={<BrandStorePage />} />
          <Route path="/brand" element={<BrandStorePage />} />
        </Routes>
      </Suspense>
    );
  }

  if (location.pathname === '/staff-gateway') {
    if (userProfile) {
      return <Navigate to="/dashboard" replace />;
    }
    return <LoginPage initialTier="STAFF" isStaffDirect={true} />;
  }

  if (location.pathname === '/login' || (!user && !userProfile && !isPublicRoute)) {
    if (location.pathname === '/login' && userProfile) {
      return <Navigate to="/dashboard" replace />;
    }
    if (!retailActive && location.pathname !== '/login') {
      return <XpeedoHomeLoginPage />;
    }
    return (
      <LoginPage
        initialTier={retailActive ? 'CUSTOMER' : 'STAFF'}
        isStaffDirect={!retailActive}
      />
    );
  }

  const triggerStaffAuthModal = () => {
    window.dispatchEvent(new CustomEvent('open-staff-auth-modal'));
  };

  if (showPortalMode) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <PublicHomePortal
          isStandalone={true}
          onToggleStandalone={() => setShowPortalMode(false)}
          onOpenStaffLogin={() => {
            setShowPortalMode(false);
            setTimeout(triggerStaffAuthModal, 50);
          }}
        />
        <OTAUpdateNotification />
      </div>
    );
  }

  return (
    <>
      <Layout onOpenCustomerPortal={() => setShowPortalMode(true)}>
      <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-slate-600">Loading Module...</div>}>
        <Routes>
          <Route
            path="/"
            element={
              <PublicHomePortal
                isStandalone={false}
                onToggleStandalone={() => setShowPortalMode(true)}
                onOpenStaffLogin={triggerStaffAuthModal}
              />
            }
          />
          <Route
            path="/home"
            element={
              <PublicHomePortal
                isStandalone={false}
                onToggleStandalone={() => setShowPortalMode(true)}
                onOpenStaffLogin={triggerStaffAuthModal}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredTier="STAFF">
                <DashboardRouter onSwitchToCustomerPortal={() => navigate('/')} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crm"
            element={
              <ProtectedRoute requiredTier="STAFF">
                <Dashboard onSwitchToCustomerPortal={() => navigate('/')} />
              </ProtectedRoute>
            }
          />

          {/* Xpeedo IT Services — Owner Command Center & Client Operations */}
          <Route
            path="/clients"
            element={
              <ProtectedRoute requiredTier="STAFF">
                <ClientsDirectoryView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/:clientId"
            element={
              <ProtectedRoute requiredTier="STAFF">
                <ClientDetailsView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute requiredTier="STAFF">
                <ProjectsAndTasksView mode="PROJECTS" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/task-management"
            element={
              <ProtectedRoute requiredTier="STAFF">
                <ProjectsAndTasksView mode="TASKS" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute requiredTier="STAFF">
                <EmployeesDirectoryView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/departments"
            element={
              <ProtectedRoute requiredTier="STAFF">
                <DepartmentsDirectoryView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflows"
            element={
              <ProtectedRoute requiredTier="STAFF">
                <WorkflowsAutomationView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/india-post"
            element={
              <ProtectedRoute requiredTier="STAFF">
                <WorkspaceBoundaryGuard requiredWorkspace="INDIA_POST">
                  <IndiaPostCommandWorkspace />
                </WorkspaceBoundaryGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/xpeedo-ev"
            element={<Navigate to="/india-post" replace />}
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute requiredTier="STAFF">
                <DocumentsCenterView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance"
            element={
              <ProtectedRoute requiredTier="STAFF">
                <FinanceLedgerView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports-center"
            element={
              <ProtectedRoute requiredTier="STAFF">
                <ReportsCenterView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute requiredTier="STAFF">
                <NotificationsCenterView />
              </ProtectedRoute>
            }
          />

        {/* Staff Directory, Auto-Managed Office Master & Colony-Beat Address Engine */}
        <Route
          path="/staff-master"
          element={
            <ProtectedRoute requiredTier="ADMIN" allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN', 'SUPER_ADMIN', 'CIRCLE_INCHARGE', 'DIVISION_INCHARGE', 'DISTRICT_INCHARGE', 'DISTRICT_MANAGER', 'CATEGORY_MANAGER']}>
              <StaffMasterView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute requiredTier="ADMIN" allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN', 'SUPER_ADMIN']}>
              <StaffView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/office-master"
          element={
            <ProtectedRoute requiredTier="ADMIN" requiredVendor="INDIA_POST" allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN', 'SUPER_ADMIN', 'CIRCLE_INCHARGE', 'DIVISION_INCHARGE', 'DISTRICT_INCHARGE', 'DISTRICT_MANAGER', 'CATEGORY_MANAGER']}>
              <OfficeMasterView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/last-mile-vendors"
          element={
            <ProtectedRoute requiredTier="STAFF">
              <LastMileVendorView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/role-access-dashboard"
          element={
            <ProtectedRoute requiredTier="ADMIN" allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN', 'SUPER_ADMIN', 'CIRCLE_INCHARGE', 'DIVISION_INCHARGE', 'DISTRICT_INCHARGE', 'DISTRICT_MANAGER', 'CATEGORY_MANAGER', 'BLOCK_INCHARGE', 'OFFICE_INCHARGE']}>
              <RoleAccessDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/address-resolution"
          element={
            <ProtectedRoute requiredTier="ADMIN" allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN', 'SUPER_ADMIN']}>
              <AddressResolutionView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/beats"
          element={
            <ProtectedRoute requiredTier="ADMIN" allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN', 'SUPER_ADMIN']}>
              <BeatManagementView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/beat-management"
          element={
            <ProtectedRoute requiredTier="ADMIN" allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN', 'SUPER_ADMIN']}>
              <BeatManagementView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/beats-overview"
          element={
            <ProtectedRoute requiredTier="ADMIN" allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN', 'SUPER_ADMIN']}>
              <BeatsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/beats-map"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="beats">
              <BeatMap />
            </ProtectedRoute>
          }
        />

        {/* Role-Based Workspaces & Administration */}
        <Route
          path="/staff-registrations"
          element={
            <ProtectedRoute requiredTier="ADMIN" allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN']}>
              <StaffRegistrationsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile-approvals"
          element={
            <ProtectedRoute requiredTier="ADMIN" allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN']}>
              <ProfileApprovalsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verifications"
          element={
            <ProtectedRoute requiredTier="ADMIN" allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN']}>
              <AdminVerificationsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/daily-verification"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="dailyVerification" allowedRoles={['OWNER', 'DEVELOPER', 'POSTMAN', 'GDS', 'STAFF', 'ADMIN', 'MASTER_ADMIN']}>
              <DailyVerificationView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-submissions"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="communication" allowedRoles={['OWNER', 'DEVELOPER', 'POSTMAN', 'GDS', 'STAFF', 'ADMIN', 'MASTER_ADMIN']}>
              <MySubmissionsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-beat"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="beats" allowedRoles={['OWNER', 'DEVELOPER', 'POSTMAN', 'GDS', 'STAFF', 'ADMIN', 'MASTER_ADMIN']}>
              <MyBeatDirectoryView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/beat-merchant-register"
          element={
            retailActive ? (
              <ProtectedRoute requiredTier="STAFF" requiredFeature="storefront" requiredVendor="COMMERCIAL_PARTNERS" allowedRoles={['OWNER', 'DEVELOPER', 'POSTMAN', 'GDS', 'STAFF', 'ADMIN', 'MASTER_ADMIN']}>
                <StaffStorefrontView />
              </ProtectedRoute>
            ) : (
              <DormantRetailRedirect />
            )
          }
        />
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute requiredTier="STAFF">
              <MyProfileView />
            </ProtectedRoute>
          }
        />

        {/* 1. CRM Section (Members & Property Management) */}
        <Route
          path="/customers"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="members">
              <ServiceModuleGuard moduleKey="crmSection" featureKey="members" moduleTitle="Members Directory">
                <CustomerList
                  onAddLead={(customer) => navigate('/leads', { state: { initialCustomer: customer } })}
                  onAddFollowUp={(customer) => navigate('/follow-ups', { state: { initialCustomer: customer } })}
                />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/households"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="property">
              <ServiceModuleGuard moduleKey="crmSection" featureKey="property" moduleTitle="Households & Property Registry">
                <HouseholdsView />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="property">
              <ServiceModuleGuard moduleKey="crmSection" featureKey="property" moduleTitle="Property Registry">
                <PropertiesView />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sequence-properties"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="property">
              <ServiceModuleGuard moduleKey="crmSection" featureKey="property" moduleTitle="Sequence Property Ledger">
                <SequenceWisePropertyHub />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/property-sequence"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="property">
              <ServiceModuleGuard moduleKey="crmSection" featureKey="property" moduleTitle="Sequence Property Ledger">
                <SequenceWisePropertyHub />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/unified-properties"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="property">
              <ServiceModuleGuard moduleKey="crmSection" featureKey="property" moduleTitle="Property & Family Hub">
                <UnifiedPropertyFamilyHub />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/unified-family"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="property">
              <ServiceModuleGuard moduleKey="crmSection" featureKey="property" moduleTitle="Property & Family Hub">
                <UnifiedPropertyFamilyHub />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/family"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="members">
              <ServiceModuleGuard moduleKey="crmSection" featureKey="members" moduleTitle="Members & Family Tree">
                <FamilyView />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/businesses"
          element={
            retailActive ? (
              <ProtectedRoute requiredTier="STAFF" requiredFeature="commercialDirectory" requiredVendor="COMMERCIAL_PARTNERS">
                <ServiceModuleGuard moduleKey="crmSection" featureKey="commercialDirectory" moduleTitle="Commercial Directory">
                  <BusinessesView />
                </ServiceModuleGuard>
              </ProtectedRoute>
            ) : (
              <DormantRetailRedirect />
            )
          }
        />
        <Route
          path="/commercial-directory"
          element={
            retailActive ? (
              <ProtectedRoute requiredTier="STAFF" requiredFeature="commercialDirectory" requiredVendor="COMMERCIAL_PARTNERS">
                <ServiceModuleGuard moduleKey="crmSection" featureKey="commercialDirectory" moduleTitle="Commercial Store Directory">
                  <CommercialPropertyHub />
                </ServiceModuleGuard>
              </ProtectedRoute>
            ) : (
              <DormantRetailRedirect />
            )
          }
        />
        <Route
          path="/commercial-intelligence"
          element={
            retailActive ? (
              <ProtectedRoute requiredTier="STAFF" requiredFeature="commercialDirectory" requiredVendor="COMMERCIAL_PARTNERS">
                <ServiceModuleGuard moduleKey="crmSection" featureKey="commercialDirectory" moduleTitle="Commercial Intelligence Engine">
                  <AICommercialIntelligenceHub />
                </ServiceModuleGuard>
              </ProtectedRoute>
            ) : (
              <DormantRetailRedirect />
            )
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="dailyOperations">
              <ServiceModuleGuard moduleKey="crmSection" featureKey="dailyOperations" moduleTitle="Field Tasks & Daily Operations">
                <TasksView />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/location-intelligence"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="locationIntelligence">
              <ServiceModuleGuard moduleKey="crmSection" featureKey="locationIntelligence" moduleTitle="Location Intelligence, Street & House Master">
                <LocationIntelligenceHub />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doorstep-surveys"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="dailyVerification">
              <ServiceModuleGuard moduleKey="crmSection" featureKey="dailyVerification" moduleTitle="Doorstep Survey Workflow">
                <DoorstepSurveyWorkflowView />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-backup-center"
          element={
            <ProtectedRoute
              requiredTier="ADMIN"
              requiredFeature="dataBackupCenter"
              allowedRoles={['OWNER', 'DEVELOPER', 'MASTER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'DIVISIONAL_HEAD', 'ASST_DIVISIONAL_ADMIN', 'DEO']}
            >
              <DataBackupCenterView />
            </ProtectedRoute>
          }
        />

        {/* 2. Special Bills Section (Fuel Bill, Charge Report, Outsider Bill, BYOD) */}
        <Route
          path="/special-forms"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="officialDocuments">
              <ServiceModuleGuard
                moduleKey="specialBillsSection"
                featureKey="officialDocuments"
                moduleTitle="Special Bills Section (Fuel Bill, Charge Report, Outsider Bill, BYOD)"
              >
                <SpecialFormsView />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/charge-report"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="officialDocuments">
              <ServiceModuleGuard
                moduleKey="specialBillsSection"
                featureKey="officialDocuments"
                moduleTitle="Special Bills Section (ACG-61 Charge Report)"
              >
                <Acg61ChargeReportView />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/official-documents"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="officialDocuments">
              <ServiceModuleGuard
                moduleKey="specialBillsSection"
                featureKey="officialDocuments"
                moduleTitle="Official Staff Documents & Statutory Reports Hub"
              >
                <OfficialStaffDocumentsHub />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/statutory-reports"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="officialDocuments">
              <ServiceModuleGuard
                moduleKey="specialBillsSection"
                featureKey="officialDocuments"
                moduleTitle="Official Staff Documents & Statutory Reports Hub"
              >
                <OfficialStaffDocumentsHub />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-directory"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="staffDirectory">
              <ColleagueStaffDirectory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/official-applications"
          element={
            <ProtectedRoute
              requiredTier="STAFF"
              requiredFeature="officialDocuments"
              allowedRoles={['OWNER', 'DEVELOPER', 'POSTMAN', 'GDS', 'STAFF', 'POSTMASTER', 'ADMIN', 'MASTER_ADMIN']}
            >
              <OfficialApplicationsView />
            </ProtectedRoute>
          }
        />

        {/* 3. Departmental Learning Section (GDS to MTS / Postman / PA LMS) */}
        <Route
          path="/postal-lms"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="lms">
              <ServiceModuleGuard
                moduleKey="departmentalLearningSection"
                featureKey="lms"
                moduleTitle="Departmental Learning Section (GDS to MTS / Postman / PA LMS)"
              >
                <PostalLMSView />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />

        {/* 4. Product & Scheme Lead Section (PLI, SSA, IPPB, Savings Schemes) */}
        <Route
          path="/leads"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="leadsAndSchemes">
              <ServiceModuleGuard
                moduleKey="productSchemeLeadSection"
                featureKey="leadsAndSchemes"
                moduleTitle="Product & Scheme Lead Section (PLI, SSA, IPPB, Savings Schemes)"
              >
                <LeadsPipelineView />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/services"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="leadsAndSchemes">
              <ServiceModuleGuard
                moduleKey="productSchemeLeadSection"
                featureKey="leadsAndSchemes"
                moduleTitle="Product & Scheme Lead Section (PLI, SSA, IPPB, Savings Schemes)"
              >
                <ServicesCatalogView />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/follow-ups"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="leadsAndSchemes">
              <ServiceModuleGuard
                moduleKey="productSchemeLeadSection"
                featureKey="leadsAndSchemes"
                moduleTitle="Product & Scheme Lead Section (PLI, SSA, IPPB, Savings Schemes)"
              >
                <FollowUpsView />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />

        {/* 5. Content Sharing & Customer Request Dispatch Capabilities */}
        <Route
          path="/communication"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="communication">
              <ServiceModuleGuard
                moduleKey="contentSharingDispatchSection"
                featureKey="communication"
                moduleTitle="Content Sharing & Customer Request Dispatch Capabilities"
              >
                <CommunicationView />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />

        {/* Governance & System */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute
              requiredTier="STAFF"
              requiredFeature="reports"
              allowedRoles={[
                'OWNER',
                'DEVELOPER',
                'MASTER_ADMIN',
                'SUPER_ADMIN',
                'ADMIN',
                'CIRCLE_INCHARGE',
                'DIVISION_INCHARGE',
                'DIVISIONAL_HEAD',
                'ASST_DIVISIONAL_ADMIN',
                'DISTRICT_MANAGER',
                'DISTRICT_INCHARGE',
                'CATEGORY_MANAGER',
                'SUBDIVISION_INCHARGE',
                'CLUSTER_INCHARGE',
                'BLOCK_INCHARGE',
                'OFFICE_INCHARGE',
                'POSTMASTER',
                'ASST_POSTMASTER',
                'SUB_POSTMASTER',
                'LAST_MILE_SUPERVISOR',
                'MARKETING_TEAM',
              ]}
            >
              <ReportsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data-quality"
          element={
            <ProtectedRoute requiredTier="ADMIN" allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN', 'SUPER_ADMIN']}>
              <DataQualityView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-log"
          element={
            <ProtectedRoute requiredTier="ADMIN" allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN', 'SUPER_ADMIN']}>
              <AuditLogView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/master-data-upload"
          element={
            <ProtectedRoute requiredTier="ADMIN" allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN', 'SUPER_ADMIN']}>
              <MasterDataUploadView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/master-upload"
          element={
            <ProtectedRoute requiredTier="ADMIN" allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN', 'SUPER_ADMIN']}>
              <MasterDataUploadView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/postman-articles"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="dailyOperations" allowedRoles={['OWNER', 'DEVELOPER', 'POSTMAN', 'GDS', 'STAFF', 'POSTMASTER', 'ADMIN', 'MASTER_ADMIN']}>
              <ServiceModuleGuard
                moduleKey="specialBillsSection"
                featureKey="dailyOperations"
                moduleTitle="Monthly Fuel Bills & Article Register"
              >
                <PostmanAllDayArticlesOverview />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/fuel-bills"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="dailyOperations" allowedRoles={['OWNER', 'DEVELOPER', 'POSTMAN', 'GDS', 'STAFF', 'POSTMASTER', 'ADMIN', 'MASTER_ADMIN']}>
              <ServiceModuleGuard
                moduleKey="specialBillsSection"
                featureKey="dailyOperations"
                moduleTitle="Monthly Fuel Bills & Article Register"
              >
                <PostmanAllDayArticlesOverview />
              </ServiceModuleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/master-data-hub"
          element={
            <ProtectedRoute requiredTier="ADMIN" allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN', 'SUPER_ADMIN']}>
              <MasterDataHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/colony-master"
          element={
            <ProtectedRoute requiredTier="ADMIN" allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN', 'SUPER_ADMIN']}>
              <MasterDataHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/unified-master-hub"
          element={
            <ProtectedRoute requiredTier="ADMIN" allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN', 'SUPER_ADMIN']}>
              <MasterDataHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/master-source"
          element={
            <ProtectedRoute requiredTier="ADMIN" allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN', 'SUPER_ADMIN']}>
              <MasterSourceSync />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="aiAssistant" requiredVendor="COMMERCIAL_PARTNERS">
              <AIAssistantView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute requiredTier="ADMIN" allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN', 'SUPER_ADMIN']}>
              <SettingsRbacMigrationView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/india-post-storefront"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="showcase" developerOnly={true}>
              <IndiaPostStorefrontView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product-targets"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="productTargets">
              <ProductTargetDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/master-search"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="masterSearch">
              <IndiaPostMasterSearchAndInspectionView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/last-mile-ops"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="lastMileOps">
              <PostmanAllDayArticlesOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff-storefront"
          element={
            <ProtectedRoute requiredTier="STAFF" requiredFeature="storefront" developerOnly={true}>
              <StaffProductStudioView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor-ecosystem"
          element={
            retailActive ? (
              <ProtectedRoute requiredTier="STAFF" requiredFeature="vendorSection">
                <VendorProductEcosystemHub />
              </ProtectedRoute>
            ) : (
              <DormantRetailRedirect />
            )
          }
        />
        <Route
          path="/vendor-ecosystem/:vendorId"
          element={
            retailActive ? (
              <ProtectedRoute requiredTier="STAFF" requiredFeature="vendorSection">
                <VendorProductEcosystemHub />
              </ProtectedRoute>
            ) : (
              <DormantRetailRedirect />
            )
          }
        />
        <Route
          path="/partner-brand-management"
          element={
            <ProtectedRoute
              requiredTier="ADMIN"
              requiredFeature="vendorSection"
              allowedRoles={['OWNER', 'DEVELOPER', 'ADMIN', 'MASTER_ADMIN', 'SUPER_ADMIN']}
            >
              <PartnerBrandManagementHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:productKey"
          element={
            retailActive ? (
              <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
                <DynamicProductPageView />
              </div>
            ) : (
              <DormantRetailRedirect />
            )
          }
        />

          <Route path="/staff-gateway" element={<LoginPage initialTier="STAFF" isStaffDirect={true} />} />
          <Route
            path="/login"
            element={
              <LoginPage
                initialTier={retailActive ? 'CUSTOMER' : 'STAFF'}
                isStaffDirect={!retailActive}
              />
            }
          />
          <Route
            path="/portal"
            element={
              retailActive ? (
                <ProtectedRoute requiredTier="PUBLIC">
                  <CustomerPortal onBackToCRM={() => navigate('/')} />
                </ProtectedRoute>
              ) : (
                <DormantRetailRedirect />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
    <OTAUpdateNotification />
  </>
);
}

export default function App() {
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  useEffect(() => {
    dataConsolidationService.runInitialConsolidationAndBrandResetIfNeeded();
    const onQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  return (
    <>
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}
      <BrowserRouter>
        <FirebaseAuthProvider>
          <AuthenticatedApp />
        </FirebaseAuthProvider>
      </BrowserRouter>
    </>
  );
}
