import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  Users,
  Building,
  User,
  Target,
  Briefcase,
  Clock,
  CheckCircle2,
  MapPin,
  Building2,
  Map,
  MessageSquare,
  BarChart2,
  ShieldCheck,
  History,
  Database,
  Sparkles,
  Settings,
  Menu,
  X,
  ExternalLink,
  LogOut,
  FileText,
  GraduationCap,
  Lock,
  Shield,
  KeyRound,
  ArrowLeftRight,
  UserCheck,
  UserCog,
  FileCheck2,
  Navigation,
} from 'lucide-react';
import { staffRegistrationService } from '../services/staffRegistrationService';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './auth/FirebaseAuthProvider';
import { customerService } from '../services/customerService';
import { staffPermissionService } from '../services/staffPermissionService';
import { addressVerificationService } from '../services/addressVerificationService';
import { ServiceModulePermissions, StaffProfile } from '../types/models';
import FloatingAIChatBot from './FloatingAIChatBot';
import MobileFAB from './MobileFAB';
import LoginPage from '../pages/LoginPage';
import StaffProfileModal from './auth/StaffProfileModal';

interface LayoutProps {
  children: React.ReactNode;
  onOpenCustomerPortal?: () => void;
}

interface MenuItem {
  name: string;
  icon: any;
  path: string;
  badge?: string;
  badgeColor?: string;
  requiredModule?: keyof ServiceModulePermissions;
}

export default function Layout({ children, onOpenCustomerPortal }: LayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, userProfile, loginAsMasterAdmin, switchStaffProfile, signOut } = useAuth();

  const [conflictCount, setConflictCount] = useState(0);
  const [leadCount, setLeadCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [overdueTaskCount, setOverdueTaskCount] = useState(0);
  const [pendingRegCount, setPendingRegCount] = useState(0);
  const [pendingProfileCount, setPendingProfileCount] = useState(0);
  const [addressExceptionsCount, setAddressExceptionsCount] = useState(0);
  const [allProfiles, setAllProfiles] = useState<StaffProfile[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const updateCounts = () => {
      try {
        const currentProfile = staffPermissionService.getActiveSession() || userProfile;
        setConflictCount(customerService.getConflicts().filter((c) => c.status === 'Pending Review').length);
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
        setAllProfiles(staffPermissionService.getAllStaffProfiles());

        const today = new Date().toISOString().split('T')[0];
        const tasks = customerService
          .getTasks()
          .filter((t) => staffPermissionService.matchesUserBeatScope(currentProfile, t));
        setOverdueTaskCount(tasks.filter((t) => t.status !== 'Completed' && t.dueDate < today).length);
        setPendingRegCount(staffRegistrationService.getPendingRegistrationCount());
        setPendingProfileCount(staffRegistrationService.getPendingProfileApprovalCount());
        setAddressExceptionsCount(addressVerificationService.getExceptionStats().pending);
      } catch (err) {
        console.warn('Error updating layout counts:', err);
      }
    };
    updateCounts();
    const unsubCust = customerService.subscribe(updateCounts);
    const unsubStaff = staffPermissionService.subscribe(updateCounts);
    const unsubReg = staffRegistrationService.subscribe(updateCounts);
    const unsubExceptions = addressVerificationService.subscribe(updateCounts);
    return () => {
      unsubCust();
      unsubStaff();
      unsubReg();
      unsubExceptions();
    };
  }, [userProfile]);

  // Close mobile drawer automatically on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Listen for Staff Login trigger from PublicHomePortal
  useEffect(() => {
    const handleOpenStaffLogin = () => setShowAuthModal(true);
    window.addEventListener('open-staff-auth-modal', handleOpenStaffLogin);
    return () => window.removeEventListener('open-staff-auth-modal', handleOpenStaffLogin);
  }, []);

  const isSuperAdmin = staffPermissionService.isSuperAdmin(userProfile);
  const isPublicHomeRoute = location.pathname === '/' || location.pathname === '/home';

  const isAdmin = isSuperAdmin || userProfile?.role === 'ADMIN' || userProfile?.role === 'SUPER_ADMIN';

  const menuSections: { group: string; items: MenuItem[] }[] = isAdmin
    ? [
        {
          group: 'PUBLIC CITIZEN PORTAL',
          items: [
            {
              name: 'Home (Postal Schemes)',
              icon: Home,
              path: '/',
              badge: 'Public',
              badgeColor: 'bg-emerald-400 text-slate-950',
            },
          ],
        },
        {
          group: 'ADMINISTRATIVE HUBS',
          items: [
            { name: '1. Dashboard', icon: LayoutDashboard, path: '/dashboard' },
            {
              name: '2. Employee Management',
              icon: Users,
              path: '/staff-master',
              badge: `${allProfiles.length}`,
              badgeColor: 'bg-amber-400 text-slate-950',
            },
            {
              name: '3. Staff Registration Requests',
              icon: UserCheck,
              path: '/staff-registrations',
              badge: pendingRegCount > 0 ? `${pendingRegCount} New` : undefined,
              badgeColor: 'bg-red-600 text-white font-bold',
            },
            { name: '4. Beat Management', icon: Map, path: '/beats' },
            {
              name: '5. Colony & Property Directory',
              icon: Building2,
              path: '/unified-properties',
              badge: 'Master',
              badgeColor: 'bg-indigo-600 text-white',
            },
            {
              name: '6. Member Directory',
              icon: Users,
              path: '/customers',
              badge: customerCount ? `${customerCount}` : undefined,
            },
            {
              name: '7. Verification Management',
              icon: ShieldCheck,
              path: '/verifications',
              badge: 'Daily 10',
              badgeColor: 'bg-emerald-600 text-white',
            },
            {
              name: '8. Profile Approval Requests',
              icon: UserCog,
              path: '/profile-approvals',
              badge: pendingProfileCount > 0 ? `${pendingProfileCount}` : undefined,
              badgeColor: 'bg-amber-500 text-slate-950 font-bold',
            },
            {
              name: '9. Delivery Operations',
              icon: ArrowLeftRight,
              path: '/charge-report',
              badge: 'ACG-61',
              badgeColor: 'bg-red-700 text-white',
            },
            { name: '10. Reports & Analytics', icon: BarChart2, path: '/reports' },
            {
              name: '11. Master Data & Fuel Upload',
              icon: Database,
              path: '/master-data-upload',
              badge: 'DSS Sync',
              badgeColor: 'bg-red-700 text-white font-bold',
            },
            { name: '12. Activity & Security Logs', icon: History, path: '/audit-log' },
            { name: '13. Settings', icon: Settings, path: '/settings' },
          ],
        },
        {
          group: 'ADDITIONAL CAPABILITIES',
          items: [
            { name: 'Auto Office Master', icon: Building, path: '/office-master' },
            {
              name: 'AI Address Exceptions & Verify',
              icon: MapPin,
              path: '/address-resolution',
              badge: addressExceptionsCount ? `${addressExceptionsCount}` : undefined,
              badgeColor: 'bg-amber-500 text-slate-950 font-bold',
            },
            { name: 'Scheme Leads (PLI/SSA)', icon: Target, path: '/leads', badge: leadCount ? `${leadCount}` : undefined },
            {
              name: 'Official Staff Documents Hub',
              icon: FileCheck2,
              path: '/official-documents',
              badge: 'Statutory',
              badgeColor: 'bg-emerald-600 text-white font-bold',
            },
            { name: 'Postal Exam LMS Hub', icon: GraduationCap, path: '/postal-lms' },
            { name: 'Special Forms & Bills', icon: FileText, path: '/special-forms' },
          ],
        },
      ]
    : [
        {
          group: 'PUBLIC CITIZEN PORTAL',
          items: [
            {
              name: 'Home (Postal Schemes)',
              icon: Home,
              path: '/',
              badge: 'Public',
              badgeColor: 'bg-emerald-400 text-slate-950',
            },
          ],
        },
        {
          group: 'POSTMAN FIELD WORKBENCH',
          items: [
            { name: '1. Dashboard', icon: LayoutDashboard, path: '/dashboard' },
            {
              name: '★ All-Day Articles & Fuel Hub',
              icon: FileText,
              path: '/postman-articles',
              badge: 'Oct 2026',
              badgeColor: 'bg-amber-400 text-slate-950 font-black',
            },
            {
              name: '★ Official Staff Documents Hub',
              icon: FileCheck2,
              path: '/official-documents',
              badge: 'Statutory',
              badgeColor: 'bg-emerald-600 text-white font-black',
            },
            {
              name: '2. My Beat / Area Directory',
              icon: Map,
              path: '/my-beat',
              badge: userProfile?.beat || 'Beat 2',
              badgeColor: 'bg-red-700 text-white',
            },
            { name: '3. Property Directory', icon: Building2, path: '/properties' },
            { name: '4. Linked Members', icon: Users, path: '/households' },
            { name: '5. Add Property / Member', icon: Home, path: '/unified-properties' },
            {
              name: '6. Daily Verification',
              icon: CheckCircle2,
              path: '/daily-verification',
              badge: '10 Target',
              badgeColor: 'bg-emerald-600 text-white font-bold',
            },
            { name: '7. Delivery Map / Route', icon: Navigation, path: '/beats-map' },
            { name: '8. My Submissions', icon: FileCheck2, path: '/my-submissions' },
            { name: '9. My Profile', icon: User, path: '/my-profile' },
          ],
        },
        {
          group: 'FIELD SUPPORT TOOLS',
          items: [
            {
              name: 'ACG-61 Charge Report',
              icon: ArrowLeftRight,
              path: '/charge-report',
              badge: 'ACG-61',
              badgeColor: 'bg-red-700 text-white',
            },
            {
              name: 'Monthly Fuel Bill & Master Upload',
              icon: Database,
              path: '/master-data-upload',
              badge: 'Fuel PDF',
              badgeColor: 'bg-amber-500 text-slate-950 font-bold',
            },
            {
              name: 'Postal Exam LMS Hub',
              icon: GraduationCap,
              path: '/postal-lms',
              badge: 'LDCE',
              badgeColor: 'bg-amber-500 text-slate-950',
            },
          ],
        },
      ];

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

      {/* Sidebar: Rendered ONLY for Internal Staff CRM Views */}
      {!isPublicHomeRoute && (
        <aside
          className={`fixed inset-y-0 left-0 w-72 bg-slate-900 text-slate-300 border-r border-slate-800 z-50 flex flex-col justify-between shadow-xl transition-transform duration-200 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
          id="sidebar"
        >
          <div className="flex flex-col h-full overflow-hidden">
            {/* Brand Header */}
            <div className="p-4 bg-gradient-to-r from-red-900 via-red-800 to-slate-950 border-b border-red-700/40 flex items-center justify-between">
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-md">
                  📮
                </div>
                <div>
                  <h1 className="text-sm font-black text-white tracking-tight leading-tight">
                    POSTMAN BOOK CRM
                  </h1>
                  <p className="text-[10px] text-amber-300 font-bold">
                    {userProfile?.subOffice || 'Dadabari SO'} • PIN {userProfile?.officePincode || '324009'}
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                id="close-sidebar-btn"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Menu Links */}
            <nav className="p-3 space-y-4 overflow-y-auto flex-1 text-xs" id="nav-menu">
              {menuSections.map((section, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-black tracking-wider text-amber-400/90 uppercase">
                    {section.group}
                  </div>
                  {section.items.map((item) => {
                    const isActive =
                      location.pathname === item.path ||
                      (item.path === '/beats' && location.pathname === '/beat-management');
                    const Icon = item.icon;
                    const isModuleAllowed = item.requiredModule
                      ? staffPermissionService.canAccessServiceModule(userProfile, item.requiredModule)
                      : true;

                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition font-medium ${
                          isActive
                            ? 'bg-red-700 text-white font-bold shadow-xs'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon size={16} className={isActive ? 'text-amber-300' : 'text-slate-400'} />
                          <span className="truncate">{item.name}</span>
                        </div>

                        {!isModuleAllowed ? (
                          <span
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 text-[10px] font-bold flex items-center gap-1"
                            title="Module Restricted by Super Admin"
                          >
                            <Lock size={11} />
                          </span>
                        ) : (
                          item.badge && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.badgeColor || (isActive ? 'bg-white text-red-700' : 'bg-slate-800 text-slate-300')
                              }`}
                            >
                              {item.badge}
                            </span>
                          )
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Sidebar Footer User Info */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2.5 truncate text-left hover:opacity-90 transition cursor-pointer"
                title="Open My Staff Profile & Beat Settings"
              >
                <div className="w-8 h-8 rounded-full bg-red-800 text-amber-300 border border-amber-400/40 flex items-center justify-center font-black text-xs shrink-0">
                  {userProfile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="truncate">
                  <div className="font-bold text-white text-[11px] truncate">
                    {userProfile?.name || user?.displayName || 'Master Admin'}
                  </div>
                  <div className="text-[10px] text-emerald-400 truncate">
                    {isSuperAdmin ? 'MASTER ADMIN' : userProfile?.designation || userProfile?.role} •{' '}
                    {isSuperAdmin ? 'All Beats' : userProfile?.beat || 'Beat 2'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => signOut()}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition shrink-0"
                id="sidebar-signout-btn"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area: Responsive w-full for Public Views, md:ml-72 for Staff CRM */}
      <div className={`flex-1 flex flex-col ${!isPublicHomeRoute ? 'md:ml-72' : 'w-full'} min-w-0`} id="main-content">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-2xs gap-2 sm:gap-4">
          {/* Public Citizen Header Layout */}
          {isPublicHomeRoute ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-800 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  📮
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                      POSTMAN BOOK CRM
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-bold">
                      PIN 324009
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 hidden sm:block">
                    Dadabari Sub Post Office • Kota Division, Rajasthan Circle
                  </p>
                </div>
              </div>

              {/* Public Citizen Navigation Links */}
              <div className="flex items-center gap-2 sm:gap-3">
                <a
                  href="#postal-schemes-section"
                  className="hidden md:inline-block text-xs font-semibold text-slate-700 hover:text-red-700 transition"
                >
                  Postal Schemes
                </a>
                <Link
                  to="/xpo-kart"
                  className="hidden sm:inline-block text-xs font-semibold text-slate-700 hover:text-red-700 transition"
                >
                  Xpo Kart Store
                </Link>
                <Link
                  to="/postal-lms"
                  className="hidden lg:inline-block text-xs font-semibold text-slate-700 hover:text-red-700 transition"
                >
                  Postal Exam LMS
                </Link>

                {/* Secure, Low-Profile Staff Gateway */}
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
                  id="citizen-header-staff-login-btn"
                  title="Authorized Departmental Personnel Login Gate"
                >
                  <Lock size={12} className="text-red-700" />
                  <span>Official Staff Gateway</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Staff CRM Header Layout */
            <>
              {/* Left: Hamburger, Brand Identity & Route Context */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0" id="top-staff-crm-access-section">
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="p-2 rounded-xl border border-slate-200 md:hidden hover:bg-slate-100 text-slate-700 shrink-0"
                  id="mobile-hamburger-btn"
                  title="Open Navigation Menu"
                >
                  <Menu size={19} />
                </button>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-800 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    📮
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900 tracking-tight truncate">
                        POSTMAN BOOK CRM
                      </span>
                      <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-bold">
                        PIN {userProfile?.officePincode || '324009'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate hidden xs:block">
                      {userProfile?.subOffice || 'Dadabari S.O.'} • {isSuperAdmin ? 'Master Admin' : userProfile?.beat || 'Beat 2'}
                    </p>
                  </div>
                </div>

                {/* Portal Switcher Tabs */}
                <div className="hidden sm:flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 ml-2 shrink-0">
                  <Link
                    to="/dashboard"
                    className="px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 whitespace-nowrap bg-red-800 text-white shadow-2xs"
                    title="Enter Internal Staff Operations"
                  >
                    <LayoutDashboard size={12} />
                    <span>Staff CRM</span>
                  </Link>
                  <Link
                    to="/"
                    className="px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 whitespace-nowrap text-slate-600 hover:text-slate-900"
                    title="View Public Pan-India Portal"
                  >
                    <Home size={12} />
                    <span>Public Portal</span>
                  </Link>
                </div>
              </div>

              {/* Right: Staff Controls & Role Switcher */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* 1-Click Master Admin Bypass */}
                {!isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => loginAsMasterAdmin()}
                    id="header-master-admin-bypass-btn"
                    className="hidden lg:flex px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition items-center gap-1 shadow-2xs cursor-pointer"
                    title="Switch to Master Admin profile"
                  >
                    <ShieldCheck size={13} />
                    <span>Admin Bypass</span>
                  </button>
                )}

                {/* Quick Staff Role & Profile Switcher */}
                <div className="hidden md:flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-xl text-xs">
                  <Shield size={12} className={isSuperAdmin ? 'text-red-700 shrink-0' : 'text-slate-500 shrink-0'} />
                  <select
                    value={userProfile?.email || 'mahen.comtech@gmail.com'}
                    onChange={(e) => switchStaffProfile(e.target.value)}
                    className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer max-w-[150px] lg:max-w-[180px] truncate"
                    id="top-profile-quick-switch"
                    title="Switch active user profile"
                  >
                    {allProfiles.slice(0, 25).map((sp) => (
                      <option key={sp.id} value={sp.email}>
                        {sp.name} ({sp.role === 'SUPER_ADMIN' ? 'Super Admin' : `${sp.designation || sp.role} • ${sp.beat}`})
                      </option>
                    ))}
                  </select>
                </div>

                {/* My Profile Button */}
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  id="top-my-profile-btn"
                  title="My Profile & Settings"
                >
                  <User size={14} className="text-red-700 shrink-0" />
                  <span className="hidden sm:inline">Profile</span>
                </button>

                {/* Sign Out */}
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  id="top-signout-btn"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </>
          )}
        </header>

        {/* Page Content View */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">{children}</main>
      </div>
      {showAuthModal && <LoginPage isModal={true} onClose={() => setShowAuthModal(false)} />}
      <StaffProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        forcePasswordChangeMode={false}
      />
      {/* Persistent Floating AI Operations Assistant Chatbot Widget across all views */}
      <FloatingAIChatBot />
      {!isPublicHomeRoute && <MobileFAB />}
    </div>
  );
}
