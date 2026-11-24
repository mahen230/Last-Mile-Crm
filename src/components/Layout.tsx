import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './auth/FirebaseAuthProvider';
import { customerService } from '../services/customerService';
import { staffPermissionService } from '../services/staffPermissionService';
import { featureVisibilityService } from '../services/featureVisibilityService';
import { addressVerificationService } from '../services/addressVerificationService';
import { partnerBrandService } from '../services/partnerBrandService';
import { xpeedoOpsService, PLATFORM_RBAC_ROLE_META } from '../services/xpeedoOpsService';
import { PartnerAccount } from '../types/models';
import { buildMainShellNav } from '../data/navigationHierarchy';
import ThreeLevelSidebar from './navigation/ThreeLevelSidebar';
import FloatingAIChatBot from './FloatingAIChatBot';
import MobileFAB from './MobileFAB';
import LoginPage from '../pages/LoginPage';
import StaffProfileModal from './auth/StaffProfileModal';
import { NotificationBellDropdown } from './common/AdminNotificationHub';

interface LayoutProps {
  children: React.ReactNode;
  onOpenCustomerPortal?: () => void;
}

export default function Layout({ children }: LayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, userProfile, signOut } = useAuth();

  const [leadCount, setLeadCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [addressExceptionsCount, setAddressExceptionsCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [brandPartners, setBrandPartners] = useState<PartnerAccount[]>(() =>
    partnerBrandService.getAllPartnerAccounts().filter((a) => a.partnerType === 'BRAND')
  );
  const [globalQuery, setGlobalQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [, setVisibilityTick] = useState(0);

  useEffect(() => {
    const unsubVis = featureVisibilityService.subscribe(() => setVisibilityTick((v) => v + 1));
    const unsubOps = xpeedoOpsService.subscribe(() => setVisibilityTick((v) => v + 1));
    const unsubBrands = partnerBrandService.subscribe(() => {
      setBrandPartners(
        partnerBrandService.getAllPartnerAccounts().filter((a) => a.partnerType === 'BRAND')
      );
    });
    return () => {
      unsubVis();
      unsubOps();
      unsubBrands();
    };
  }, []);

  useEffect(() => {
    const updateCounts = () => {
      try {
        const currentProfile = staffPermissionService.getActiveSession() || userProfile;
        if (!currentProfile) {
          setLeadCount(0);
          setCustomerCount(0);
          setAddressExceptionsCount(0);
          return;
        }
        setLeadCount(
          customerService
            .getLeads()
            .filter((l) => staffPermissionService.matchesUserBeatScope(currentProfile, l)).length
        );
        setCustomerCount(
          customerService
            .getCustomers()
            .filter((c) => staffPermissionService.matchesUserBeatScope(currentProfile, c)).length
        );
        setAddressExceptionsCount(addressVerificationService.getExceptionStats().pending);
      } catch (err) {
        console.warn('Error updating layout counts:', err);
      }
    };
    updateCounts();
    const unsubCust = customerService.subscribe(updateCounts);
    const unsubStaff = staffPermissionService.subscribe(updateCounts);
    const unsubExceptions = addressVerificationService.subscribe(updateCounts);
    return () => {
      unsubCust();
      unsubStaff();
      unsubExceptions();
    };
  }, [userProfile]);

  // Close mobile drawer and staff auth modal automatically on route change or auth success
  useEffect(() => {
    setIsOpen(false);
    setShowAuthModal(false);
  }, [location.pathname]);

  useEffect(() => {
    if (showAuthModal && userProfile) {
      setShowAuthModal(false);
    }
  }, [showAuthModal, userProfile]);

  // Listen for Staff Login trigger from PublicHomePortal
  useEffect(() => {
    const handleOpenStaffLogin = () => setShowAuthModal(true);
    window.addEventListener('open-staff-auth-modal', handleOpenStaffLogin);
    return () => window.removeEventListener('open-staff-auth-modal', handleOpenStaffLogin);
  }, []);

  const isSuperAdmin = staffPermissionService.isSuperAdmin(userProfile);
  const isPublicHomeRoute =
    location.pathname === '/' ||
    location.pathname === '/home' ||
    location.pathname.startsWith('/product/');

  const isAdmin =
    isSuperAdmin ||
    userProfile?.role === 'OWNER' ||
    userProfile?.role === 'DEVELOPER' ||
    userProfile?.role === 'MASTER_ADMIN' ||
    userProfile?.role === 'ADMIN' ||
    userProfile?.role === 'SUPER_ADMIN';

  const isRegionalOrCategoryManager =
    !isAdmin &&
    [
      'CIRCLE_INCHARGE',
      'DIVISION_INCHARGE',
      'DISTRICT_INCHARGE',
      'DISTRICT_MANAGER',
      'CATEGORY_MANAGER',
      'BLOCK_INCHARGE',
      'OFFICE_INCHARGE',
    ].includes(String(userProfile?.role || '').toUpperCase());

  const brandIdentity = featureVisibilityService.getBrandIdentity(userProfile);
  const isWhiteLabel = brandIdentity.isWhiteLabel;
  const strictVendorId = featureVisibilityService.isStrictlyScopedToVendor(userProfile);

  const canAccessSpecialBills =
    featureVisibilityService.isFeatureVisible(userProfile, 'officialDocuments') ||
    featureVisibilityService.isFeatureVisible(userProfile, 'dailyOperations');
  const isViewerOnly = userProfile?.role === 'VIEWER' && !isAdmin;

  const canShowCommercialNetwork =
    !isWhiteLabel &&
    strictVendorId !== 'INDIA_POST' &&
    featureVisibilityService.canAccessVendorSystem(userProfile, 'COMMERCIAL_PARTNERS') &&
    (isAdmin ||
      featureVisibilityService.isFeatureVisible(userProfile, 'vendorSection') ||
      featureVisibilityService.isFeatureVisible(userProfile, 'commercialDirectory') ||
      featureVisibilityService.isFeatureVisible(userProfile, 'storefront'));

  const showProperty = featureVisibilityService.isFeatureVisible(userProfile, 'property');
  const showMembers = featureVisibilityService.isFeatureVisible(userProfile, 'members');
  const showLeads = featureVisibilityService.isFeatureVisible(userProfile, 'leadsAndSchemes');
  const showDocs = featureVisibilityService.isFeatureVisible(userProfile, 'officialDocuments');
  const showDailyOps = featureVisibilityService.isFeatureVisible(userProfile, 'dailyOperations');
  const showAiAssistant = !isWhiteLabel && featureVisibilityService.isFeatureVisible(userProfile, 'aiAssistant');

  const platformRole = xpeedoOpsService.resolvePlatformRole(userProfile);
  const simulatedRole = xpeedoOpsService.getSimulatedRole();
  const activeWorkspace = xpeedoOpsService.getActiveWorkspaceFilter();
  const scopedWorkspaces = xpeedoOpsService.getScopedWorkspaceKeys(userProfile);
  const availableClients = xpeedoOpsService.getClients(userProfile);
  const unreadOpsNotifications = xpeedoOpsService
    .getNotifications(activeWorkspace)
    .filter((n) => !n.read).length;

  const isCommandShell =
    !isWhiteLabel &&
    strictVendorId !== 'INDIA_POST' &&
    (isAdmin ||
      ['BUSINESS_ADMIN', 'PROJECT_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER', 'VIEWER'].includes(
        platformRole
      ));

  const roleBadgeLabel = simulatedRole
    ? `PREVIEW: ${PLATFORM_RBAC_ROLE_META[simulatedRole].label}`
    : userProfile?.role === 'OWNER'
    ? 'OWNER / SUPER ADMIN'
    : userProfile?.role === 'DEVELOPER'
    ? 'DEVELOPER'
    : isSuperAdmin
    ? 'MASTER ADMIN'
    : userProfile?.role === 'CATEGORY_MANAGER'
    ? 'CATEGORY MANAGER'
    : userProfile?.role === 'DISTRICT_MANAGER' || userProfile?.role === 'DISTRICT_INCHARGE'
    ? 'DISTRICT MANAGER'
    : userProfile?.designationType || userProfile?.role || 'STAFF';

  const retailServicesActive = featureVisibilityService.isRetailServicesActive();

  const navGroups = buildMainShellNav({
    userProfile,
    isAdmin,
    isCommandShell,
    isWhiteLabel,
    isRegionalOrCategoryManager,
    strictVendorId,
    retailServicesActive,
    brandPartners,
    unreadOpsNotifications,
    customerCount,
    leadCount,
    addressExceptionsCount,
    canAccessSpecialBills,
    showDocs,
    showDailyOps,
    showProperty,
    showMembers,
    showLeads,
    canShowCommercialNetwork,
    isViewerOnly,
  });

  const sidebarHeaderSlot = (
    <div
      className={`p-4 flex items-center justify-between ${
        isWhiteLabel ? 'bg-slate-950' : 'bg-[#0F172A]'
      }`}
    >
      <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
            isWhiteLabel
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'bg-blue-600 text-white'
          }`}
        >
          {isWhiteLabel ? <Building2 size={18} /> : 'XP'}
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
            {isWhiteLabel ? brandIdentity.title : 'Xpeedo Services'}
          </h1>
          <p className="text-[11px] text-slate-300 font-medium truncate">
            {isWhiteLabel ? brandIdentity.subtitle : 'Operations & Brand CRM'}
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-1.5">
        <NotificationBellDropdown />
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          id="close-sidebar-btn"
          aria-label="Close navigation menu"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );

  const sidebarFooterSlot = (
    <div className="p-3 bg-slate-950 flex items-center justify-between text-xs">
      <button
        type="button"
        onClick={() => setShowProfileModal(true)}
        className="flex items-center gap-2.5 truncate text-left hover:opacity-90 transition cursor-pointer"
        title="Open My Staff Profile & Beat Settings"
      >
        <div className="w-8 h-8 rounded-lg bg-slate-800 text-white border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
          {userProfile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div className="truncate">
          <div className="font-bold text-white text-[11px] truncate">
            {userProfile?.name || user?.displayName || 'Master Admin'}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {roleBadgeLabel} · {isSuperAdmin ? 'All Beats' : userProfile?.beat || 'Assigned'}
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => signOut()}
        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer shrink-0"
        title="Sign Out"
      >
        <LogOut size={16} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900" id="app-container">
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Persistent 3-Level Left Sidebar */}
      {!isPublicHomeRoute && (
        <aside
          className={`fixed inset-y-0 left-0 w-72 bg-slate-900 text-slate-300 border-r border-slate-800 z-50 flex flex-col justify-between shadow-xl transition-transform duration-200 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
          id="sidebar"
        >
          <ThreeLevelSidebar
            groups={navGroups}
            activePath={`${location.pathname}${location.search}`}
            accentColor="#2563EB"
            headerSlot={sidebarHeaderSlot}
            footerSlot={sidebarFooterSlot}
            onCloseMobile={() => setIsOpen(false)}
          />
        </aside>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${!isPublicHomeRoute ? 'md:pl-72' : ''}`}>
        {/* Top Header Bar: Workspace Switcher, Global Search, Role & Notifications */}
        {!isPublicHomeRoute && (
          <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                <Menu size={20} />
              </button>

              {isCommandShell ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase text-slate-500 hidden sm:inline">
                    Workspace:
                  </span>
                  <select
                    value={activeWorkspace}
                    onChange={(e) => xpeedoOpsService.setActiveWorkspaceFilter(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 bg-white"
                  >
                    {scopedWorkspaces === 'ALL' && (
                      <option value="ALL">All Workspaces</option>
                    )}
                    {availableClients.map((c) => (
                      <option key={c.id} value={c.workspaceKey}>
                        {c.name} ({c.workspaceKey})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="text-xs font-bold text-slate-800 truncate">
                  {userProfile?.subOffice || 'Dadabari S.O.'} · PIN {userProfile?.officePincode || '324009'}
                </div>
              )}

              {/* Global Search */}
              {isCommandShell && (
                <div className="relative hidden sm:block">
                  <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
                  <input
                    type="text"
                    value={globalQuery}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                    onChange={(e) => setGlobalQuery(e.target.value)}
                    placeholder="Search clients, projects, tasks, SRM..."
                    className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-64 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                  {searchFocused && globalQuery.trim().length > 0 && (() => {
                    const q = globalQuery.trim().toLowerCase();
                    const clientHits = availableClients
                      .filter((c) => `${c.name} ${c.code} ${c.industry}`.toLowerCase().includes(q))
                      .slice(0, 3)
                      .map((c) => ({ label: `Client: ${c.name}`, sub: c.code, path: `/clients/${c.id}` }));
                    const projHits = xpeedoOpsService
                      .getProjects(activeWorkspace)
                      .filter((p) => `${p.title} ${p.code}`.toLowerCase().includes(q))
                      .slice(0, 3)
                      .map((p) => ({ label: `Project: ${p.title}`, sub: p.workspaceId, path: '/projects' }));
                    const taskHits = xpeedoOpsService
                      .getTasks(activeWorkspace)
                      .filter((t) => `${t.title} ${t.code}`.toLowerCase().includes(q))
                      .slice(0, 3)
                      .map((t) => ({ label: `Task: ${t.title}`, sub: `${t.code} · ${t.status}`, path: '/task-management' }));
                    const srmHits = (scopedWorkspaces === 'ALL' || scopedWorkspaces.includes('INDIA_POST'))
                      ? xpeedoOpsService
                          .getSrmTickets()
                          .filter((s) => `${s.ticketNo} ${s.subject} ${s.customerName}`.toLowerCase().includes(q))
                          .slice(0, 3)
                          .map((s) => ({ label: `SRM: ${s.subject}`, sub: `${s.ticketNo} · ${s.status}`, path: '/india-post' }))
                      : [];
                    const hits = [...clientHits, ...projHits, ...taskHits, ...srmHits].slice(0, 8);
                    return (
                      <div className="absolute left-0 mt-1 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 divide-y divide-slate-100">
                        {hits.length === 0 ? (
                          <div className="p-3 text-xs text-slate-500">No matches for "{globalQuery}"</div>
                        ) : (
                          hits.map((h, i) => (
                            <Link
                              key={`${h.path}-${i}`}
                              to={h.path}
                              onClick={() => setGlobalQuery('')}
                              className="block p-2.5 hover:bg-slate-50 text-xs"
                            >
                              <div className="font-semibold text-slate-900 truncate">{h.label}</div>
                              <div className="text-[11px] font-mono text-slate-500 truncate">{h.sub}</div>
                            </Link>
                          ))
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {simulatedRole && (
                <button
                  type="button"
                  onClick={() =>
                    xpeedoOpsService.setSimulatedRolePreview(null, null, userProfile?.name || 'Owner')
                  }
                  className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-semibold cursor-pointer"
                >
                  Preview: {PLATFORM_RBAC_ROLE_META[simulatedRole].label} (Reset)
                </button>
              )}
              <Link
                to="/notifications"
                className="relative p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
                title="Notification Center"
              >
                <Bell size={16} />
                {unreadOpsNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 px-1 min-w-[16px] h-4 rounded bg-blue-600 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                    {unreadOpsNotifications}
                  </span>
                )}
              </Link>
              <NotificationBellDropdown />
            </div>
          </header>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Staff Profile Settings Modal */}
      {showProfileModal && (
        <StaffProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      )}

      {/* Global Staff Login Modal if triggered */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <LoginPage
            isModal={true}
            onClose={() => setShowAuthModal(false)}
            initialTier="STAFF"
            isStaffDirect={true}
          />
        </div>
      )}

      {/* Floating AI Assistant (Only if enabled & non-white-label) & Feature-Gated Mobile FAB */}
      {showAiAssistant && <FloatingAIChatBot />}
      {(showProperty || showMembers || showLeads) && <MobileFAB />}
    </div>
  );
}
