import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './auth/FirebaseAuthProvider';
import { customerService } from '../services/customerService';
import { staffPermissionService } from '../services/staffPermissionService';
import { ServiceModulePermissions, StaffProfile } from '../types/models';
import FloatingAIChatBot from './FloatingAIChatBot';
import MobileFAB from './MobileFAB';

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

export default function Layout({ children }: LayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, userProfile, switchStaffProfile, signOut } = useAuth();

  const [conflictCount, setConflictCount] = useState(0);
  const [leadCount, setLeadCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [overdueTaskCount, setOverdueTaskCount] = useState(0);
  const [allProfiles, setAllProfiles] = useState<StaffProfile[]>([]);

  useEffect(() => {
    const updateCounts = () => {
      setConflictCount(customerService.getConflicts().filter((c) => c.status === 'Pending Review').length);
      setLeadCount(customerService.getLeads().length);
      setCustomerCount(customerService.getCustomers().length);
      setAllProfiles(staffPermissionService.getAllStaffProfiles());

      const today = new Date().toISOString().split('T')[0];
      const tasks = customerService.getTasks();
      setOverdueTaskCount(tasks.filter((t) => t.status !== 'Completed' && t.dueDate < today).length);
    };
    updateCounts();
    const unsubCust = customerService.subscribe(updateCounts);
    const unsubStaff = staffPermissionService.subscribe(updateCounts);
    return () => {
      unsubCust();
      unsubStaff();
    };
  }, []);

  const isSuperAdmin = staffPermissionService.isSuperAdmin(userProfile);

  const menuSections: { group: string; items: MenuItem[] }[] = [
    {
      group: 'OPERATIONS & STAFF HUB',
      items: [
        { name: 'Dashboard Overview', icon: LayoutDashboard, path: '/' },
        {
          name: 'Staff Directory & Access',
          icon: Users,
          path: '/staff-master',
          badge: `${allProfiles.length}`,
          badgeColor: 'bg-amber-400 text-slate-950',
        },
        { name: 'Auto Office Master', icon: Building, path: '/office-master' },
        { name: 'Colony-Beat & Address', icon: MapPin, path: '/address-resolution' },
        { name: 'Delivery Beats & Routes', icon: Map, path: '/beats' },
      ],
    },
    {
      group: 'BILLS, FORMS & LMS HUB',
      items: [
        {
          name: 'Special Forms & Bills',
          icon: FileText,
          path: '/special-forms',
          badge: '4 Forms',
          badgeColor: 'bg-emerald-500 text-white',
          requiredModule: 'specialBillsSection',
        },
        {
          name: 'Postal Exam LMS Hub',
          icon: GraduationCap,
          path: '/postal-lms',
          badge: 'LDCE',
          badgeColor: 'bg-amber-500 text-slate-950',
          requiredModule: 'departmentalLearningSection',
        },
      ],
    },
    {
      group: 'CRM & SCHEME PIPELINE',
      items: [
        {
          name: 'Customer Master Data',
          icon: Users,
          path: '/customers',
          badge: customerCount ? `${customerCount}` : undefined,
          requiredModule: 'crmSection',
        },
        {
          name: 'Property Master Data',
          icon: Building2,
          path: '/properties',
          requiredModule: 'crmSection',
        },
        {
          name: 'Scheme Leads (PLI/SSA)',
          icon: Target,
          path: '/leads',
          badge: leadCount ? `${leadCount}` : undefined,
          requiredModule: 'productSchemeLeadSection',
        },
        {
          name: 'Postal Products Catalog',
          icon: Briefcase,
          path: '/services',
          requiredModule: 'productSchemeLeadSection',
        },
        {
          name: 'Follow-ups & Visits',
          icon: Clock,
          path: '/follow-ups',
          requiredModule: 'productSchemeLeadSection',
        },
        {
          name: 'Field Tasks',
          icon: CheckCircle2,
          path: '/tasks',
          badge: overdueTaskCount > 0 ? `${overdueTaskCount}` : undefined,
          badgeColor: 'bg-red-600 text-white',
          requiredModule: 'crmSection',
        },
        {
          name: 'Content & Dispatch',
          icon: MessageSquare,
          path: '/communication',
          requiredModule: 'contentSharingDispatchSection',
        },
      ],
    },
    {
      group: 'GOVERNANCE & BACKUP',
      items: [
        { name: 'Reports & Analytics', icon: BarChart2, path: '/reports' },
        {
          name: 'Data Quality & Merge',
          icon: ShieldCheck,
          path: '/data-quality',
          badge: conflictCount > 0 ? `${conflictCount}` : undefined,
          badgeColor: 'bg-amber-500 text-white',
        },
        { name: 'Master Data Hub', icon: Database, path: '/master-data-hub' },
        { name: 'Audit Trail', icon: History, path: '/audit-log' },
        { name: 'System Settings', icon: Settings, path: '/settings' },
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
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : typeof window !== 'undefined' && window.innerWidth < 768 ? -280 : 0 }}
        className="fixed inset-y-0 left-0 w-70 bg-slate-900 text-slate-300 border-r border-slate-800 z-50 flex flex-col justify-between shadow-xl"
        id="sidebar"
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className="p-4 bg-gradient-to-r from-red-900 via-red-800 to-slate-950 border-b border-red-700/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-md">
                📮
              </div>
              <div>
                <h1 className="text-sm font-black text-white tracking-tight leading-tight">
                  INDIA POST CRM OS
                </h1>
                <p className="text-[10px] text-amber-300 font-bold">
                  {userProfile?.subOffice || 'Dadabari SO'} • PIN {userProfile?.officePincode || '324009'}
                </p>
              </div>
            </div>

            <button
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
                  const isActive = location.pathname === item.path;
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
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-red-800 text-amber-300 border border-amber-400/40 flex items-center justify-center font-black text-xs shrink-0">
                {userProfile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="truncate">
                <div className="font-bold text-white text-[11px] truncate">
                  {userProfile?.name || user?.displayName || 'Admin Operator'}
                </div>
                <div className="text-[10px] text-emerald-400 truncate">
                  {isSuperAdmin ? 'SUPER ADMIN' : userProfile?.designation || userProfile?.role} •{' '}
                  {userProfile?.beat || 'Beat 2'}
                </div>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition shrink-0"
              id="sidebar-signout-btn"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-70 min-w-0" id="main-content">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 rounded-xl border border-slate-200 md:hidden hover:bg-slate-100 text-slate-700"
              id="mobile-hamburger-btn"
            >
              <Menu size={20} />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span className="font-bold text-slate-900">
                {userProfile?.subOffice || 'Dadabari Sub-Post Office (SO)'}
              </span>
              <span>•</span>
              <span className="font-mono font-semibold text-red-700">
                PIN {userProfile?.officePincode || '324009'}
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} />
                {isSuperAdmin ? 'Master Admin Access (All Circles & Beats)' : `Scoped: ${userProfile?.beat || 'Beat 2'}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Staff Role & Profile Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs">
              <Shield size={13} className={isSuperAdmin ? 'text-red-700 shrink-0' : 'text-slate-500 shrink-0'} />
              <select
                value={userProfile?.email || 'mahen.comtech@gmail.com'}
                onChange={(e) => switchStaffProfile(e.target.value)}
                className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer max-w-[210px] truncate"
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

            <Link
              to="/special-forms"
              className="hidden lg:flex px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition items-center gap-1.5"
            >
              <FileText size={14} className="text-red-700" />
              <span>Bills & Forms</span>
            </Link>

            <Link
              to="/postal-lms"
              className="hidden lg:flex px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold transition items-center gap-1.5"
            >
              <GraduationCap size={14} />
              <span>Exam LMS</span>
            </Link>

            <Link
              to="/portal"
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
              id="top-customer-portal-switch"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Citizen Portal</span>
            </Link>
          </div>
        </header>

        {/* Page Content View */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">{children}</main>
      </div>
      <FloatingAIChatBot />
      <MobileFAB />
    </div>
  );
}
