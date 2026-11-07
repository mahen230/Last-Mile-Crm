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
      } catch (err) {
        console.warn('Error updating layout counts:', err);
      }
    };
    updateCounts();
    const unsubCust = customerService.subscribe(updateCounts);
    const unsubStaff = staffPermissionService.subscribe(updateCounts);
    const unsubReg = staffRegistrationService.subscribe(updateCounts);
    return () => {
      unsubCust();
      unsubStaff();
      unsubReg();
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
            { name: 'Address Standardization', icon: MapPin, path: '/address-resolution' },
            { name: 'Scheme Leads (PLI/SSA)', icon: Target, path: '/leads', badge: leadCount ? `${leadCount}` : undefined },
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

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-slate-900 text-slate-300 border-r border-slate-800 z-50 flex flex-col justify-between shadow-xl transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        id="sidebar"
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className="p-4 bg-gradient-to-r from-red-900 via-red-800 to-slate-950 border-b border-red-700/40 flex items-center justify-between">
            <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-72 min-w-0" id="main-content">
        {/* Top Header Bar: Dedicated Staff CRM Portal & Login Section on Left/Top + Pan-India Public Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs gap-3">
          {/* LEFT / TOP: Dedicated Staff CRM Portal & Login Section + Route Branding */}
          <div className="flex items-center gap-2.5 min-w-0 flex-wrap" id="top-staff-crm-access-section">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="p-2 rounded-xl border border-slate-200 md:hidden hover:bg-slate-100 text-slate-700 shrink-0"
              id="mobile-hamburger-btn"
            >
              <Menu size={20} />
            </button>

            {/* Dedicated Staff CRM Portal & Login Pill Group on Left/Top */}
            <div className="flex items-center gap-1.5 bg-slate-900 text-white p-1 rounded-xl shadow-2xs shrink-0">
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap ${
                  !isPublicHomeRoute
                    ? 'bg-red-700 text-white shadow-2xs'
                    : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                }`}
                id="top-left-staff-crm-portal-link"
                title="Instant Access to Administrative Staff CRM Operations Dashboard"
              >
                <LayoutDashboard size={13} />
                <span>Staff CRM Portal</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                id="top-left-staff-login-btn"
                title="Staff Login, Profile Switch & Registration"
              >
                <KeyRound size={12} />
                <span>Staff Login</span>
              </button>

              {!isPublicHomeRoute && (
                <Link
                  to="/"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold transition flex items-center gap-1 whitespace-nowrap"
                  id="top-left-public-home-link"
                  title="Switch to 100% Public Pan-India Home Page"
                >
                  <Home size={12} />
                  <span className="hidden sm:inline">Public Home</span>
                </Link>
              )}
            </div>

            {/* Context Title: 100% Pan-India on Public Home Route, Operational Scope inside CRM */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 truncate pl-1">
              {isPublicHomeRoute ? (
                <>
                  <span className="font-extrabold text-slate-900 truncate">
                    Pan-India Postal & IPPB Financial Services Portal
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold truncate">
                    100% Govt. of India Sovereign Guarantee
                  </span>
                </>
              ) : (
                <>
                  <span className="font-bold text-slate-900 truncate">
                    {userProfile?.subOffice || 'Dadabari Sub-Post Office (SO)'}
                  </span>
                  <span>•</span>
                  <span className="font-mono font-semibold text-red-700 shrink-0">
                    PIN {userProfile?.officePincode || '324009'}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 truncate">
                    <CheckCircle2 size={13} className="shrink-0" />
                    <span className="truncate">
                      {isSuperAdmin
                        ? 'Master Admin Access (All Circles & Beats)'
                        : `Scoped: ${userProfile?.beat || 'Beat 2'}`}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* RIGHT: Clean Public Actions on Home Route, Full Administrative Controls inside CRM */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {isPublicHomeRoute ? (
              <>
                <Link
                  to="/dashboard"
                  className="hidden sm:flex px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded-xl text-xs font-bold transition items-center gap-1.5"
                >
                  <ShieldCheck size={14} className="text-red-700" />
                  <span>Enter Operations CRM</span>
                </Link>
                {onOpenCustomerPortal && (
                  <button
                    type="button"
                    onClick={onOpenCustomerPortal}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    id="top-customer-portal-switch"
                  >
                    <ExternalLink size={13} />
                    <span className="hidden sm:inline">Full-Screen Portal</span>
                  </button>
                )}
              </>
            ) : (
              <>
                {/* 1-Click Master Admin Bypass Override Button when testing non-admin profiles */}
                {!isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => loginAsMasterAdmin()}
                    id="header-master-admin-bypass-btn"
                    className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="Instantly switch to Master Admin profile with unrestricted access across all beats and offices"
                  >
                    <ShieldCheck size={13} />
                    <span>Master Admin Override</span>
                  </button>
                )}

                {/* Quick Staff Role & Profile Switcher */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs">
                  <Shield size={13} className={isSuperAdmin ? 'text-red-700 shrink-0' : 'text-slate-500 shrink-0'} />
                  <select
                    value={userProfile?.email || 'mahen.comtech@gmail.com'}
                    onChange={(e) => switchStaffProfile(e.target.value)}
                    className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer max-w-[190px] truncate"
                    id="top-profile-quick-switch"
                    title="Switch active user profile to test Super Admin vs General Staff visibility & permissions"
                  >
                    {allProfiles.slice(0, 25).map((sp) => (
                      <option key={sp.id} value={sp.email}>
                        {sp.name} ({sp.role === 'SUPER_ADMIN' ? 'Super Admin' : `${sp.designation || sp.role} • ${sp.beat}`})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dedicated My Profile Modal Button */}
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  id="top-my-profile-btn"
                  title="View and update your Staff Profile, Post Office, Beat & Password"
                >
                  <User size={13} className="text-red-700" />
                  <span className="hidden md:inline">My Profile</span>
                </button>

                {/* Top Header Logout Button to view full-screen Login Gate */}
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  id="top-signout-btn"
                  title="Sign Out to Full-Screen Staff Login Gate"
                >
                  <LogOut size={13} />
                  <span className="hidden lg:inline">Logout</span>
                </button>

                <Link
                  to="/special-forms"
                  className="hidden xl:flex px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition items-center gap-1.5"
                >
                  <FileText size={14} className="text-red-700" />
                  <span>Bills & Forms</span>
                </Link>

                <Link
                  to="/postal-lms"
                  className="hidden xl:flex px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold transition items-center gap-1.5"
                >
                  <GraduationCap size={14} />
                  <span>Exam LMS</span>
                </Link>
              </>
            )}
          </div>
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
