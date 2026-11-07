import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import Layout from './components/Layout';
import PublicHomePortal from './components/PublicHomePortal';
import Dashboard from './components/Dashboard';
import { FirebaseAuthProvider, useAuth } from './components/auth/FirebaseAuthProvider';
import { staffPermissionService } from './services/staffPermissionService';
import { ServiceModulePermissions } from './types/models';
import LoginPage from './pages/LoginPage';
import LoginModal from './components/auth/LoginModal';
import { OTAUpdateNotification } from './components/common/OTAUpdateNotification';

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
const BeatsView = lazy(() => import('./components/crm/BeatsView'));
const BeatManagementView = lazy(() => import('./components/crm/BeatManagementView'));
const StaffView = lazy(() => import('./components/crm/StaffView'));
const OfficeMasterView = lazy(() => import('./components/crm/OfficeMasterView'));
const StaffMasterView = lazy(() => import('./components/crm/StaffMasterView'));
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
const MasterDataUploadView = lazy(() => import('./components/admin/MasterDataUploadView'));
const PostmanAllDayArticlesOverview = lazy(() => import('./components/postman/PostmanAllDayArticlesOverview'));

function ServiceModuleGuard({
  moduleKey,
  moduleTitle,
  children,
}: {
  moduleKey: keyof ServiceModulePermissions;
  moduleTitle: string;
  children: React.ReactNode;
}) {
  const { userProfile, loginAsMasterAdmin } = useAuth();
  const allowed = staffPermissionService.canAccessServiceModule(userProfile, moduleKey);

  if (allowed) {
    return <>{children}</>;
  }

  return (
    <div className="bg-white rounded-3xl border border-red-200 p-8 max-w-2xl mx-auto my-8 shadow-lg text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-center mx-auto">
        <Lock size={30} />
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase">
        <ShieldAlert size={14} /> Granular Service-Level Access Control
      </div>
      <h2 className="text-xl font-black text-slate-900">
        Authorization Required: {moduleTitle}
      </h2>
      <p className="text-xs text-slate-600 leading-relaxed max-w-lg mx-auto">
        Your current staff profile (<strong>{userProfile?.name}</strong> •{' '}
        <span className="font-mono">{userProfile?.employeeId || userProfile?.email}</span>) does not have active authorization for the{' '}
        <strong>{moduleTitle}</strong> module, or your account approval status is currently{' '}
        <span className="font-bold text-red-700">
          {userProfile?.permissions?.approvalStatus || 'Restricted'}
        </span>
        .
      </p>
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 max-w-lg mx-auto text-left space-y-1.5">
        <div className="font-bold text-slate-900">Scoped Access & Approval Engine:</div>
        <div>• Super Admin (<strong>mahen.comtech@gmail.com</strong>) can approve or revoke access to each of the 5 Service Modules per staff member.</div>
        <div>• Assigned Beats Scope: <strong>{(userProfile?.permissions?.allowedBeats || [userProfile?.beat]).join(', ')}</strong></div>
        <div>• Assigned Offices Scope: <strong>{(userProfile?.permissions?.allowedOffices || [userProfile?.subOffice]).join(', ')}</strong></div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => loginAsMasterAdmin()}
          className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <CheckCircle2 size={15} />
          <span>1-Click Master Admin Bypass (Grant Access)</span>
        </button>
        <Link
          to="/staff-master"
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        >
          <span>Open Permission Matrix</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const { user, userProfile } = useAuth();
  const [showPortalMode, setShowPortalMode] = useState(false);
  const [hasPostmanAuth, setHasPostmanAuth] = useState(() => {
    return typeof localStorage !== 'undefined' && localStorage.getItem('postman_auth') === 'true';
  });
  const navigate = useNavigate();
  const location = useLocation();

  const isPublicRoute = location.pathname === '/' || location.pathname === '/home';

  if (location.pathname === '/login' || (!user && !userProfile && !isPublicRoute)) {
    return <LoginPage />;
  }

  const triggerStaffAuthModal = () => {
    window.dispatchEvent(new CustomEvent('open-staff-auth-modal'));
  };

  if (showPortalMode) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {!hasPostmanAuth && (
          <LoginModal
            onLoginSuccess={() => {
              setHasPostmanAuth(true);
            }}
          />
        )}
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
      {!hasPostmanAuth && (
        <LoginModal
          onLoginSuccess={() => {
            setHasPostmanAuth(true);
          }}
        />
      )}
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
            element={<Dashboard onSwitchToCustomerPortal={() => navigate('/')} />}
          />
          <Route
            path="/crm"
            element={<Dashboard onSwitchToCustomerPortal={() => navigate('/')} />}
          />

        {/* Staff Directory, Auto-Managed Office Master & Colony-Beat Address Engine */}
        <Route path="/staff-master" element={<StaffMasterView />} />
        <Route path="/staff" element={<StaffView />} />
        <Route path="/office-master" element={<OfficeMasterView />} />
        <Route path="/address-resolution" element={<AddressResolutionView />} />
        <Route path="/beats" element={<BeatManagementView />} />
        <Route path="/beat-management" element={<BeatManagementView />} />
        <Route path="/beats-overview" element={<BeatsView />} />
        <Route path="/beats-map" element={<BeatMap />} />

        {/* Role-Based Workspaces & Administration */}
        <Route path="/staff-registrations" element={<StaffRegistrationsView />} />
        <Route path="/profile-approvals" element={<ProfileApprovalsView />} />
        <Route path="/verifications" element={<AdminVerificationsView />} />
        <Route path="/daily-verification" element={<DailyVerificationView />} />
        <Route path="/my-submissions" element={<MySubmissionsView />} />
        <Route path="/my-beat" element={<MyBeatDirectoryView />} />
        <Route path="/my-profile" element={<MyProfileView />} />

        {/* 1. CRM Section (Customer & Property Management) */}
        <Route
          path="/customers"
          element={
            <ServiceModuleGuard moduleKey="crmSection" moduleTitle="CRM Section (Customer & Property Management)">
              <CustomerList
                onAddLead={(customer) => navigate('/leads', { state: { initialCustomer: customer } })}
                onAddFollowUp={(customer) => navigate('/follow-ups', { state: { initialCustomer: customer } })}
              />
            </ServiceModuleGuard>
          }
        />
        <Route
          path="/households"
          element={
            <ServiceModuleGuard moduleKey="crmSection" moduleTitle="CRM Section (Customer & Property Management)">
              <HouseholdsView />
            </ServiceModuleGuard>
          }
        />
        <Route
          path="/properties"
          element={
            <ServiceModuleGuard moduleKey="crmSection" moduleTitle="CRM Section (Customer & Property Management)">
              <PropertiesView />
            </ServiceModuleGuard>
          }
        />
        <Route
          path="/sequence-properties"
          element={
            <ServiceModuleGuard moduleKey="crmSection" moduleTitle="CRM Section (Customer & Property Management)">
              <SequenceWisePropertyHub />
            </ServiceModuleGuard>
          }
        />
        <Route
          path="/property-sequence"
          element={
            <ServiceModuleGuard moduleKey="crmSection" moduleTitle="CRM Section (Customer & Property Management)">
              <SequenceWisePropertyHub />
            </ServiceModuleGuard>
          }
        />
        <Route
          path="/unified-properties"
          element={
            <ServiceModuleGuard moduleKey="crmSection" moduleTitle="CRM Section (Customer & Property Management)">
              <UnifiedPropertyFamilyHub />
            </ServiceModuleGuard>
          }
        />
        <Route
          path="/unified-family"
          element={
            <ServiceModuleGuard moduleKey="crmSection" moduleTitle="CRM Section (Customer & Property Management)">
              <UnifiedPropertyFamilyHub />
            </ServiceModuleGuard>
          }
        />
        <Route
          path="/family"
          element={
            <ServiceModuleGuard moduleKey="crmSection" moduleTitle="CRM Section (Customer & Property Management)">
              <FamilyView />
            </ServiceModuleGuard>
          }
        />
        <Route
          path="/businesses"
          element={
            <ServiceModuleGuard moduleKey="crmSection" moduleTitle="CRM Section (Customer & Property Management)">
              <BusinessesView />
            </ServiceModuleGuard>
          }
        />
        <Route
          path="/tasks"
          element={
            <ServiceModuleGuard moduleKey="crmSection" moduleTitle="CRM Section (Field Tasks & Operations)">
              <TasksView />
            </ServiceModuleGuard>
          }
        />

        {/* 2. Special Bills Section (Fuel Bill, Charge Report, Outsider Bill, BYOD) */}
        <Route
          path="/special-forms"
          element={
            <ServiceModuleGuard
              moduleKey="specialBillsSection"
              moduleTitle="Special Bills Section (Fuel Bill, Charge Report, Outsider Bill, BYOD)"
            >
              <SpecialFormsView />
            </ServiceModuleGuard>
          }
        />
        <Route
          path="/charge-report"
          element={
            <ServiceModuleGuard
              moduleKey="specialBillsSection"
              moduleTitle="Special Bills Section (ACG-61 Charge Report)"
            >
              <Acg61ChargeReportView />
            </ServiceModuleGuard>
          }
        />

        {/* 3. Departmental Learning Section (GDS to MTS / Postman / PA LMS) */}
        <Route
          path="/postal-lms"
          element={
            <ServiceModuleGuard
              moduleKey="departmentalLearningSection"
              moduleTitle="Departmental Learning Section (GDS to MTS / Postman / PA LMS)"
            >
              <PostalLMSView />
            </ServiceModuleGuard>
          }
        />

        {/* 4. Product & Scheme Lead Section (PLI, SSA, IPPB, Savings Schemes) */}
        <Route
          path="/leads"
          element={
            <ServiceModuleGuard
              moduleKey="productSchemeLeadSection"
              moduleTitle="Product & Scheme Lead Section (PLI, SSA, IPPB, Savings Schemes)"
            >
              <LeadsPipelineView />
            </ServiceModuleGuard>
          }
        />
        <Route
          path="/services"
          element={
            <ServiceModuleGuard
              moduleKey="productSchemeLeadSection"
              moduleTitle="Product & Scheme Lead Section (PLI, SSA, IPPB, Savings Schemes)"
            >
              <ServicesCatalogView />
            </ServiceModuleGuard>
          }
        />
        <Route
          path="/follow-ups"
          element={
            <ServiceModuleGuard
              moduleKey="productSchemeLeadSection"
              moduleTitle="Product & Scheme Lead Section (PLI, SSA, IPPB, Savings Schemes)"
            >
              <FollowUpsView />
            </ServiceModuleGuard>
          }
        />

        {/* 5. Content Sharing & Customer Request Dispatch Capabilities */}
        <Route
          path="/communication"
          element={
            <ServiceModuleGuard
              moduleKey="contentSharingDispatchSection"
              moduleTitle="Content Sharing & Customer Request Dispatch Capabilities"
            >
              <CommunicationView />
            </ServiceModuleGuard>
          }
        />

        {/* Governance & System */}
        <Route path="/reports" element={<ReportsView />} />
        <Route path="/data-quality" element={<DataQualityView />} />
        <Route path="/audit-log" element={<AuditLogView />} />
        <Route path="/master-data-upload" element={<MasterDataUploadView />} />
        <Route path="/master-upload" element={<MasterDataUploadView />} />
        <Route path="/postman-articles" element={<PostmanAllDayArticlesOverview />} />
        <Route path="/fuel-bills" element={<PostmanAllDayArticlesOverview />} />
        <Route path="/master-data-hub" element={<MasterDataHub />} />
        <Route path="/colony-master" element={<MasterDataHub />} />
        <Route path="/unified-master-hub" element={<MasterDataHub />} />
        <Route path="/master-source" element={<MasterSourceSync />} />
        <Route path="/ai-assistant" element={<AIAssistantView />} />
        <Route path="/settings" element={<SettingsView />} />

          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/portal" element={<CustomerPortal onBackToCRM={() => navigate('/')} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
    <OTAUpdateNotification />
  </>
);
}

export default function App() {
  return (
    <BrowserRouter>
      <FirebaseAuthProvider>
        <AuthenticatedApp />
      </FirebaseAuthProvider>
    </BrowserRouter>
  );
}
