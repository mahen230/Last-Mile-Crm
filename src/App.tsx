import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { Lock, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CustomerList from './components/customers/CustomerList';
import HouseholdsView from './components/crm/HouseholdsView';
import PropertiesView from './components/crm/PropertiesView';
import FamilyView from './components/crm/FamilyView';
import LeadsPipelineView from './components/crm/LeadsPipelineView';
import ServicesCatalogView from './components/crm/ServicesCatalogView';
import FollowUpsView from './components/crm/FollowUpsView';
import TasksView from './components/crm/TasksView';
import AddressResolutionView from './components/crm/AddressResolutionView';
import BusinessesView from './components/crm/BusinessesView';
import BeatsView from './components/crm/BeatsView';
import BeatManagementView from './components/crm/BeatManagementView';
import BeatMap from './components/crm/BeatMap';
import StaffView from './components/crm/StaffView';
import OfficeMasterView from './components/crm/OfficeMasterView';
import StaffMasterView from './components/crm/StaffMasterView';
import SpecialFormsView from './components/crm/SpecialFormsView';
import PostalLMSView from './components/crm/PostalLMSView';
import CommunicationView from './components/crm/CommunicationView';
import ReportsView from './components/crm/ReportsView';
import DataQualityView from './components/crm/DataQualityView';
import AuditLogView from './components/crm/AuditLogView';
import MasterSourceSync from './components/MasterSourceSync';
import MasterDataHub from './components/crm/MasterDataHub';
import AIAssistantView from './components/crm/AIAssistantView';
import SettingsView from './components/crm/SettingsView';
import CustomerPortal from './components/customer-facing/CustomerPortal';
import { FirebaseAuthProvider, useAuth } from './components/auth/FirebaseAuthProvider';
import { staffPermissionService } from './services/staffPermissionService';
import { ServiceModulePermissions } from './types/models';
import LoginPage from './pages/LoginPage';

function ServiceModuleGuard({
  moduleKey,
  moduleTitle,
  children,
}: {
  moduleKey: keyof ServiceModulePermissions;
  moduleTitle: string;
  children: React.ReactNode;
}) {
  const { userProfile, switchStaffProfile } = useAuth();
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
          onClick={() => switchStaffProfile('mahen.comtech@gmail.com')}
          className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md"
        >
          <CheckCircle2 size={15} />
          <span>Switch to Super Admin to Grant Access</span>
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
  const { user } = useAuth();
  const [showPortalMode, setShowPortalMode] = useState(false);
  const navigate = useNavigate();

  if (!user) return <LoginPage />;

  if (showPortalMode) {
    return <CustomerPortal onBackToCRM={() => setShowPortalMode(false)} />;
  }

  return (
    <Layout onOpenCustomerPortal={() => setShowPortalMode(true)}>
      <Routes>
        <Route path="/" element={<Dashboard onSwitchToCustomerPortal={() => setShowPortalMode(true)} />} />

        {/* Staff Directory, Auto-Managed Office Master & Colony-Beat Address Engine */}
        <Route path="/staff-master" element={<StaffMasterView />} />
        <Route path="/staff" element={<StaffView />} />
        <Route path="/office-master" element={<OfficeMasterView />} />
        <Route path="/address-resolution" element={<AddressResolutionView />} />
        <Route path="/beats" element={<BeatManagementView />} />
        <Route path="/beat-management" element={<BeatManagementView />} />
        <Route path="/beats-map" element={<BeatMap />} />

        {/* 1. CRM Section (Customer & Property Management) */}
        <Route
          path="/customers"
          element={
            <ServiceModuleGuard moduleKey="crmSection" moduleTitle="CRM Section (Customer & Property Management)">
              <CustomerList />
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
        <Route path="/master-data-hub" element={<MasterDataHub />} />
        <Route path="/master-source" element={<MasterSourceSync />} />
        <Route path="/ai-assistant" element={<AIAssistantView />} />
        <Route path="/settings" element={<SettingsView />} />

        <Route path="/portal" element={<CustomerPortal onBackToCRM={() => navigate('/')} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
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
