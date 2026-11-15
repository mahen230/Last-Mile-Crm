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
  Store,
  ChevronDown,
  ChevronUp,
  Smartphone,
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
import { NotificationBellDropdown } from './common/AdminNotificationHub';

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
  const { user, userProfile, switchStaffProfile, signOut } = useAuth();

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
  const [formsDocsOpen, setFormsDocsOpen] = useState(true);

  useEffect(() => {
    const updateCounts = () => {
      try {
        const currentProfile = staffPermissionService.getActiveSession() || userProfile;
        if (!currentProfile) {
          setConflictCount(0);
          setLeadCount(0);
          setCustomerCount(0);
          setOverdueTaskCount(0);
          setPendingRegCount(0);
          setPendingProfileCount(0);
          setAddressExceptionsCount(0);
          setAllProfiles([]);
          return;
        }
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
        setAllProfiles(
          staffPermissionService.isSuperAdmin(currentProfile)
            ? staffPermissionService.getAllStaffProfiles()
            : []
        );

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

  const isAdmin =
    isSuperAdmin ||
    userProfile?.role === 'MASTER_ADMIN' ||
    userProfile?.role === 'ADMIN' ||
    userProfile?.role === 'SUPER_ADMIN';

  const menuSections: { group: string; items: MenuItem[] }[] = isAdmin
    ? [
        {
          group: 'MAIN WORKFLOW',
          items: [
            { name: '1. Dashboard', icon: LayoutDashboard, path: '/dashboard' },
            {
              name: '2. Member Management',
              icon: Users,
              path: '/customers',
              badge: customerCount ? `${customerCount}` : undefined,
            },
            {
              name: '3. Colony Directory',
              icon: Building2,
              path: '/colony-master',
              badge: 'Master',
              badgeColor: 'bg-indigo-600 text-white',
            },
            { name: '4. Beat Management', icon: Map, path: '/beats' },
            {
              name: '5. Documents & Records',
              icon: FileCheck2,
              path: '/official-documents',
              badge: 'Statutory',
              badgeColor: 'bg-emerald-600 text-white font-bold',
            },
            {
              name: '6. Department (Staff-wise assignment)',
              icon: Briefcase,
              path: '/staff-master',
              badge: `${allProfiles.length}`,
              badgeColor: 'bg-amber-400 text-slate-950',
            },
            {
              name: '7. Products',
              icon: Sparkles,
              path: '/services',
              requiredModule: 'productSchemeLeadSection',
            },
            {
              name: '8. Leads & Pipeline',
              icon: Target,
              path: '/leads',
              badge: leadCount ? `${leadCount}` : undefined,
              requiredModule: 'productSchemeLeadSection',
            },
          ],
        },
        {
          group: 'ADMINISTRATION & FIELD OPERATIONS',
          items: [
            {
              name: 'Staff Registration Requests',
              icon: UserCheck,
              path: '/staff-registrations',
              badge: pendingRegCount > 0 ? `${pendingRegCount} New` : undefined,
              badgeColor: 'bg-red-600 text-white font-bold',
            },
            {
              name: 'Verification Management',
              icon: ShieldCheck,
              path: '/verifications',
              badge: 'Daily 10',
              badgeColor: 'bg-emerald-600 text-white',
            },
            {
              name: 'Profile Approval Requests',
              icon: UserCog,
              path: '/profile-approvals',
              badge: pendingProfileCount > 0 ? `${pendingProfileCount}` : undefined,
              badgeColor: 'bg-amber-500 text-slate-950 font-bold',
            },
            {
              name: 'Property & Family Hub',
              icon: Home,
              path: '/unified-properties',
            },
            {
              name: 'Commercial Store Directory',
              icon: Store,
              path: '/commercial-directory',
              badge: 'GIS Maps',
              badgeColor: 'bg-red-600 text-white font-bold',
            },
            {
              name: 'AI Commercial & 4-Factor Engine',
              icon: Sparkles,
              path: '/commercial-intelligence',
              badge: '4-Factor',
              badgeColor: 'bg-red-700 text-white font-bold',
            },
            {
              name: 'Partner Storefront Studio',
              icon: Store,
              path: '/staff-storefront',
              badge: 'E-Store',
              badgeColor: 'bg-amber-400 text-slate-950 font-black',
            },
            { name: 'Reports & Analytics', icon: BarChart2, path: '/reports' },
            { name: 'Auto Office Master', icon: Building, path: '/office-master' },
            {
              name: 'AI Address Exceptions & Verify',
              icon: MapPin,
              path: '/address-resolution',
              badge: addressExceptionsCount ? `${addressExceptionsCount}` : undefined,
              badgeColor: 'bg-amber-500 text-slate-950 font-bold',
            },
            { name: 'Postal Exam LMS Hub', icon: GraduationCap, path: '/postal-lms' },
            {
              name: 'Staff Contact Directory',
              icon: Users,
              path: '/staff-directory',
              badge: 'Colleagues',
              badgeColor: 'bg-sky-600 text-white',
            },
            { name: 'Activity & Security Logs', icon: History, path: '/audit-log' },
            { name: 'Settings', icon: Settings, path: '/settings' },
          ],
        },
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
      ]
    : [
        {
          group: 'BEAT DELIVERY WORKFLOW',
          items: [
            { name: '1. Dashboard', icon: LayoutDashboard, path: '/dashboard' },
            {
              name: '2. Member Management',
              icon: Users,
              path: '/customers',
              badge: customerCount ? `${customerCount}` : undefined,
            },
            {
              name: '3. Documents & Records',
              icon: FileCheck2,
              path: '/official-documents',
              badge: 'Statutory',
              badgeColor: 'bg-emerald-600 text-white font-black',
            },
            {
              name: '4. Products',
              icon: Sparkles,
              path: '/services',
              requiredModule: 'productSchemeLeadSection',
            },
            {
              name: '5. Leads & Pipeline',
              icon: Target,
              path: '/leads',
              badge: leadCount ? `${leadCount}` : undefined,
              requiredModule: 'productSchemeLeadSection',
            },
          ],
        },
        {
          group: 'POSTMAN FIELD WORKBENCH',
          items: [
            { name: 'My Beat / Area Directory', icon: MapPin, path: '/my-beat' },
            { name: 'Property Directory', icon: Building, path: '/properties' },
            {
              name: 'Commercial Store Directory',
              icon: Store,
              path: '/commercial-directory',
              badge: 'GIS',
              badgeColor: 'bg-red-600 text-white font-bold',
            },
            {
              name: 'Commercial Freshness & Matching',
              icon: Sparkles,
              path: '/commercial-intelligence',
              badge: 'AI Fresh',
              badgeColor: 'bg-emerald-600 text-white font-bold',
            },
            { name: 'Linked Members', icon: Users, path: '/households' },
            { name: 'Add Property / Member', icon: Home, path: '/unified-properties' },
            {
              name: 'Daily Verification',
              icon: CheckCircle2,
              path: '/daily-verification',
              badge: '10 Target',
              badgeColor: 'bg-emerald-600 text-white font-bold',
            },
            { name: 'Delivery Map / Route', icon: Navigation, path: '/beats-map' },
            {
              name: 'Postal Exam LMS Hub',
              icon: GraduationCap,
              path: '/postal-lms',
              badge: 'LDCE',
              badgeColor: 'bg-amber-500 text-slate-950',
            },
            {
              name: 'Staff Contact Directory',
              icon: Users,
              path: '/staff-directory',
              badge: 'Directory',
              badgeColor: 'bg-sky-600 text-white',
            },
            { name: 'My Storefront Products', icon: Store, path: '/staff-storefront', badge: 'E-Store', badgeColor: 'bg-amber-400 text-slate-950 font-bold' },
            { name: 'My Submissions', icon: FileCheck2, path: '/my-submissions' },
            { name: 'My Profile', icon: User, path: '/my-profile' },
          ],
        },
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
      ];

  const formsDocsSubItems = [
    { name: 'a. ACG-61 Charge Report', path: '/charge-report', icon: ArrowLeftRight, badge: 'ACG-61' },
    { name: 'b. Official Applications', path: '/official-applications', icon: FileText, badge: 'PDF' },
    { name: 'c. Monthly Fuel & Articles', path: '/postman-articles', icon: FileText, badge: '31-Day' },
    { name: 'd. BYOD & Allowance Bills', path: '/special-forms', icon: Smartphone, badge: 'Bills' },
    { name: 'e. NPR & Office Expenses', path: '/special-forms', icon: Database, badge: 'Ledger' },
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
                    Xpeedo Last Mile
                  </h1>
                  <p className="text-[10px] text-amber-300 font-bold">
                    {userProfile?.subOffice || 'Dadabari S.O.'} • PIN {userProfile?.officePincode || '324009'}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-1.5">
                <NotificationBellDropdown />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                  id="close-sidebar-btn"
                >
                  <X size={20} />
                </button>
              </div>
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
                      (item.path === '/beats' && location.pathname === '/beat-management') ||
                      (item.path === '/colony-master' &&
                        (location.pathname === '/master-data-hub' ||
                          location.pathname === '/unified-master-hub')) ||
                      (item.path === '/official-documents' && location.pathname === '/statutory-reports');
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

              {/* CONSOLIDATED "FORMS & DOCUMENTS" COLLAPSIBLE PARENT MENU */}
              <div className="space-y-1 pt-1 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormsDocsOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/90 text-amber-300 hover:bg-slate-800 transition font-black text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText size={16} className="text-amber-400" />
                    <span>Forms &amp; Documents Hub</span>
                  </div>
                  {formsDocsOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>

                {formsDocsOpen && (
                  <div className="pl-4 space-y-1 pt-1 border-l-2 border-red-700 ml-2">
                    {formsDocsSubItems.map((sub) => {
                      const isSubActive = location.pathname === sub.path;
                      const SubIcon = sub.icon;
                      return (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition text-[11px] font-medium ${
                            isSubActive
                              ? 'bg-red-700 text-white font-bold'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <SubIcon size={14} className={isSubActive ? 'text-amber-300' : 'text-slate-500'} />
                            <span className="truncate">{sub.name}</span>
                          </div>
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[9px] font-bold">
                            {sub.badge}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
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

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${!isPublicHomeRoute ? 'md:pl-72' : ''}`}>
        {/* Top Header Bar for Mobile Menu & Notifications */}
        {!isPublicHomeRoute && (
          <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
              >
                <Menu size={20} />
              </button>
              <div className="text-xs font-black text-slate-800">
                {userProfile?.subOffice || 'Dadabari S.O.'} · PIN {userProfile?.officePincode || '324009'}
              </div>
            </div>

            <div className="flex items-center gap-2">
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-500 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
            <LoginPage initialTier="STAFF" isStaffDirect={true} />
          </div>
        </div>
      )}

      {/* Floating AI Assistant & Mobile FAB */}
      <FloatingAIChatBot />
      <MobileFAB />
    </div>
  );
}
