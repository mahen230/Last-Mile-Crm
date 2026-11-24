import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Download,
  Lock,
  LogOut,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Ticket,
  User,
  X,
} from 'lucide-react';
import { brandOwnerService } from '../services/brandOwnerService';
import { customerService } from '../services/customerService';
import { featureVisibilityService } from '../services/featureVisibilityService';
import { buildBrandPortalNav } from '../data/navigationHierarchy';
import ThreeLevelSidebar from '../components/navigation/ThreeLevelSidebar';
import { exportCsvWithBom, xpeedoOpsService } from '../services/xpeedoOpsService';
import { CONSOLIDATED_BEAT_MATRIX } from '../data/consolidatedBeatMatrix';
import {
  ALL_BRAND_CUSTOMER_SECTIONS,
  ALL_BRAND_STAFF_SECTIONS,
  BrandCustomerSectionKey,
  BrandStaffSectionKey,
} from '../types/brandOwner';
import {
  ALL_OPS_TASK_STATUSES,
  OpsTaskStatus,
  SrmTicketCategory,
  SrmTicketPriority,
  SrmTicketStatus,
} from '../types/xpeedoOps';

type ActivePortalSectionKey = BrandStaffSectionKey | BrandCustomerSectionKey;

export default function BrandScopedPortalPage() {
  const { brandSlug = '' } = useParams<{ brandSlug: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [, setTick] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [leadSearch, setLeadSearch] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Staff: Quick Add Customer Form
  const [showAddCust, setShowAddCust] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustColony, setNewCustColony] = useState('');
  const [newCustPin, setNewCustPin] = useState('324009');

  // Staff: Quick Add Lead Form
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLeadCustName, setNewLeadCustName] = useState('');
  const [newLeadCustMobile, setNewLeadCustMobile] = useState('');
  const [newLeadProduct, setNewLeadProduct] = useState('');
  const [newLeadRequirement, setNewLeadRequirement] = useState('');

  // Customer Self-Service: Submit Request / Inquiry Form
  const [reqCategory, setReqCategory] = useState<SrmTicketCategory>('Delivery Delay');
  const [reqSubject, setReqSubject] = useState('');
  const [reqDetails, setReqDetails] = useState('');
  const [reqPriority, setReqPriority] = useState<SrmTicketPriority>('Medium');

  const [retailActive, setRetailActive] = useState(() =>
    featureVisibilityService.isRetailServicesActive()
  );

  useEffect(() => {
    const u1 = brandOwnerService.subscribe(() => setTick((t) => t + 1));
    const u2 = customerService.subscribe(() => setTick((t) => t + 1));
    const u3 = xpeedoOpsService.subscribe(() => setTick((t) => t + 1));
    const u4 = featureVisibilityService.subscribe(() =>
      setRetailActive(featureVisibilityService.isRetailServicesActive())
    );
    return () => {
      u1();
      u2();
      u3();
      u4();
    };
  }, []);

  const sessionState = brandOwnerService.getActiveBrandScopedAccessSessionState(
    brandSlug || undefined
  );
  const session = sessionState.session;

  const allowedNavItems = useMemo(() => {
    if (!session) return [];
    if (session.hierarchyTier === 'BRAND_CUSTOMER') {
      return ALL_BRAND_CUSTOMER_SECTIONS;
    }
    const allowedSet = new Set<BrandStaffSectionKey>(
      session.permissions?.allowedSections && session.permissions.allowedSections.length > 0
        ? session.permissions.allowedSections
        : ['OVERVIEW', 'CUSTOMERS', 'LEADS', 'OPERATIONS', 'PROPERTIES', 'BEATS', 'MY_PROFILE']
    );
    return ALL_BRAND_STAFF_SECTIONS.filter((item) => {
      if (item.key === 'REPORTS' && !session.permissions?.canExportReports && !allowedSet.has('REPORTS')) {
        return false;
      }
      return allowedSet.has(item.key);
    });
  }, [session]);

  const defaultSection: ActivePortalSectionKey =
    (allowedNavItems[0]?.key as ActivePortalSectionKey) ||
    (session?.hierarchyTier === 'BRAND_CUSTOMER' ? 'ACCOUNT_OVERVIEW' : 'OVERVIEW');

  const urlSectionParam = (searchParams.get('section') || '').toUpperCase();
  const activeSection: ActivePortalSectionKey = allowedNavItems.some(
    (item) => item.key === urlSectionParam
  )
    ? (urlSectionParam as ActivePortalSectionKey)
    : defaultSection;

  const setActiveSection = (next: ActivePortalSectionKey) => {
    const params = new URLSearchParams(searchParams);
    params.set('section', next);
    setSearchParams(params, { replace: true });
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-7 text-center space-y-4">
          <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center mx-auto">
            <Lock size={22} />
          </div>
          <h1 className="text-lg font-bold text-slate-900">
            Brand-Scoped Authentication Required
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            {sessionState.invalidatedReason ||
              'Sign in through the Brand Staff & Customer Login portal to access this isolated brand workspace.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Link
              to={brandSlug ? `/brand-access/${brandSlug}` : '/brand-access'}
              className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
            >
              Open Brand Staff &amp; Customer Login
            </Link>
            <Link
              to="/"
              className="px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-semibold"
            >
              Citizen Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!retailActive && session.hierarchyTier === 'BRAND_CUSTOMER') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-7 text-center space-y-4">
          <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center mx-auto">
            <Lock size={22} />
          </div>
          <h1 className="text-lg font-bold text-slate-900">
            Customer Self-Service Portals Paused
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Public retail and customer workflows are currently inactive on Xpeedo Services. Sign out to return to the operational login portal.
          </p>
          <button
            type="button"
            onClick={() => {
              brandOwnerService.signOutBrandScopedAccess();
              navigate('/', { replace: true });
            }}
            className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
          >
            Sign Out &amp; Return Home
          </button>
        </div>
      </div>
    );
  }

  const scopedData = brandOwnerService.getScopedDashboardDataForAccessSession(session);
  const canCreate = Boolean(session.permissions?.canCreateCustomerOrLead);
  const canManageOps = Boolean(session.permissions?.canManageSrmOrTasks);
  const canExport = Boolean(session.permissions?.canExportReports);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleSignOut = () => {
    const slug = session.partnerSlug;
    brandOwnerService.signOutBrandScopedAccess();
    navigate(`/brand-access/${slug}`, { replace: true });
  };

  const handleStaffAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate || !newCustName.trim()) return;
    const res = customerService.addOrUpdateCustomer(
      {
        name: newCustName.trim(),
        mobile: newCustMobile.replace(/\D/g, '').slice(-10) || undefined,
        colony: newCustColony.trim() || 'Keshavpura',
        area: newCustColony.trim() || 'Keshavpura',
        pincode: newCustPin.trim() || session.pincode || '324009',
        beatNo: session.beat && session.beat !== 'All Beats' ? session.beat : 'Beat 2',
        brandId: session.partnerSlug,
        brandName: session.brandName,
        enteredBy: session.actorEmail || session.actorId,
        enteredByName: session.actorName,
      },
      `${session.brandName} Staff Portal`
    );
    if (res.customer) {
      setNewCustName('');
      setNewCustMobile('');
      setNewCustColony('');
      setShowAddCust(false);
      showToast(`Saved customer "${res.customer.name}" inside ${session.brandName}.`);
    }
  };

  const handleStaffAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate || !newLeadCustName.trim() || !newLeadProduct.trim()) return;
    const lead = customerService.createLead({
      customerId: `CUST-${Date.now().toString(36).toUpperCase()}`,
      customerName: newLeadCustName.trim(),
      customerMobile: newLeadCustMobile.replace(/\D/g, '').slice(-10) || '0000000000',
      productCode: newLeadProduct.trim().toUpperCase().replace(/\s+/g, '_').slice(0, 20),
      productName: newLeadProduct.trim(),
      requirement: newLeadRequirement.trim() || newLeadProduct.trim(),
      source: `${session.brandName} Staff Desk`,
      stage: 'New',
      priority: 'Medium',
      leadScore: 75,
      pincode: session.pincode || '324009',
      beatNo: session.beat && session.beat !== 'All Beats' ? session.beat : 'Beat 1',
      assignedStaffName: session.actorName,
      brandId: session.partnerSlug,
      brandName: session.brandName,
    });
    setNewLeadCustName('');
    setNewLeadCustMobile('');
    setNewLeadProduct('');
    setNewLeadRequirement('');
    setShowAddLead(false);
    showToast(`Logged lead ${lead.id} for "${lead.customerName}" inside ${session.brandName}.`);
  };

  const handleCustomerSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqSubject.trim()) return;

    if (session.workspaceKey === 'INDIA_POST') {
      const tk = xpeedoOpsService.createSrmTicket(
        {
          officeId: 'DADABARI_SO',
          officeName: session.assignedOffice || 'Dadabari S.O.',
          pincode: session.pincode || '324009',
          beatNo: session.beat || 'Beat 2',
          customerId: session.actorId,
          customerName: session.actorName,
          customerMobile: session.actorContact,
          category: reqCategory,
          subject: reqSubject.trim(),
          description: reqDetails.trim() || reqSubject.trim(),
          priority: reqPriority,
          assignedTo: 'Division SRM Desk',
        } as any,
        session.actorName,
        'BRAND_CUSTOMER'
      );
      showToast(`Submitted India Post SRM Ticket ${tk.ticketNo} (SLA ${tk.slaHours}h).`);
    } else {
      const lead = customerService.createLead({
        customerId: session.actorId,
        customerName: session.actorName,
        customerMobile: session.actorContact || '0000000000',
        productCode: 'CUSTOMER_INQUIRY',
        productName: reqSubject.trim(),
        requirement: reqDetails.trim() || reqSubject.trim(),
        source: 'Customer Web Inquiry',
        stage: 'New',
        priority: reqPriority === 'Critical' ? 'High' : reqPriority,
        leadScore: 80,
        pincode: session.pincode || '324009',
        beatNo: session.beat || 'Beat 1',
        brandId: session.partnerSlug,
        brandName: session.brandName,
      });
      showToast(`Submitted request ${lead.id} to ${session.brandName}.`);
    }

    setReqSubject('');
    setReqDetails('');
  };

  const q = searchQuery.trim().toLowerCase();
  const visibleCustomers = q
    ? scopedData.customers.filter((c) =>
        `${c.name} ${c.mobile || ''} ${c.colony || ''} ${c.pincode || ''} ${c.beatNo || ''}`
          .toLowerCase()
          .includes(q)
      )
    : scopedData.customers;

  const lq = leadSearch.trim().toLowerCase();
  const visibleLeads = lq
    ? scopedData.leads.filter((l) =>
        `${l.customerName} ${l.productName} ${l.beatNo || ''} ${l.customerMobile || ''} ${l.stage}`
          .toLowerCase()
          .includes(lq)
      )
    : scopedData.leads;

  const scopedBeats = useMemo(() => {
    if (session.workspaceKey !== 'INDIA_POST') return [];
    if (session.permissions?.canViewAllBrandCustomers || !session.beat || session.beat === 'All Beats') {
      return CONSOLIDATED_BEAT_MATRIX;
    }
    const cleanBeat = session.beat.toLowerCase();
    return CONSOLIDATED_BEAT_MATRIX.filter(
      (b) =>
        b.beatNumber.toLowerCase() === cleanBeat ||
        `beat ${b.beatNumber}`.toLowerCase() === cleanBeat ||
        b.beatNumber.toLowerCase().includes(cleanBeat.replace('beat ', ''))
    );
  }, [session]);

  const activeNavMeta = allowedNavItems.find((i) => i.key === activeSection);

  const staffSidebarGroups =
    session.hierarchyTier === 'BRAND_STAFF'
      ? buildBrandPortalNav({
          mode: 'STAFF',
          brandName: session.brandName,
          isIndiaPost: session.workspaceKey === 'INDIA_POST',
          retailServicesActive: retailActive,
          staffAllowedSections: allowedNavItems.map((i) => i.key as BrandStaffSectionKey),
          counts: {
            customers: scopedData.customers.length,
            leads: scopedData.leads.length,
          },
        })
      : [];

  const sidebarHeaderSlot = (
    <div className="p-5 space-y-2">
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
          style={{ backgroundColor: session.accentColor || '#1D4ED8' }}
        >
          <Building2 size={17} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-white truncate">{session.brandName}</div>
          <div className="text-[11px] font-mono text-sky-400 truncate">
            {session.hierarchyTier} · {session.uniqueCode}
          </div>
        </div>
      </div>
      <div className="pt-1 text-[11px] text-slate-300 truncate">
        {session.actorName} ·{' '}
        <span className="text-slate-400 font-mono">
          {session.hierarchyTier === 'BRAND_STAFF'
            ? session.designation || session.staffRole
            : session.customerMasterId || session.actorId}
        </span>
      </div>
    </div>
  );

  const sidebarFooterSlot = (
    <div className="p-4 text-xs">
      <button
        type="button"
        onClick={handleSignOut}
        className="w-full py-2 px-3 rounded-lg bg-red-950/60 hover:bg-red-900/70 border border-red-900 text-red-200 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <LogOut size={14} />
        <span>Sign Out</span>
      </button>
    </div>
  );

  const sidebarContent =
    session.hierarchyTier === 'BRAND_STAFF' ? (
      <ThreeLevelSidebar
        groups={staffSidebarGroups}
        activeTabKey={activeSection}
        accentColor={session.accentColor || '#1D4ED8'}
        headerSlot={sidebarHeaderSlot}
        footerSlot={sidebarFooterSlot}
        onSelectItem={(item) => {
          if (item.tabKey) {
            setActiveSection(item.tabKey as ActivePortalSectionKey);
          }
        }}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />
    ) : (
      <div className="flex flex-col h-full bg-slate-900 text-white">
        <div className="border-b border-slate-800">{sidebarHeaderSlot}</div>
        <nav className="p-3 flex-1 overflow-y-auto space-y-1">
          <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Customer Account
          </div>
          {allowedNavItems.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setActiveSection(item.key as ActivePortalSectionKey);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2.5 transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="border-t border-slate-800">{sidebarFooterSlot}</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Desktop Sidenav */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-64 h-full">{sidebarContent}</div>
          <div
            className="flex-1 bg-slate-950/60"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open brand navigation menu"
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-slate-500">
                {session.brandName} / {activeNavMeta?.label || activeSection}
              </div>
              <h1 className="text-base font-bold text-slate-900 truncate">
                {activeNavMeta?.label || session.brandName}
              </h1>
            </div>
          </div>

          <div className="text-right text-xs hidden sm:block">
            <div className="font-semibold text-slate-900">{session.actorName}</div>
            <div className="text-[11px] font-mono text-slate-500">
              {session.hierarchyTier === 'BRAND_STAFF'
                ? `${session.assignedOffice || session.brandName} · ${session.beat || 'Assigned Scope'}`
                : `ID ${session.customerMasterId || session.actorId} · PIN ${session.pincode || '—'}`}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 space-y-6 flex-1">
          {feedback && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>{feedback}</span>
              </span>
              <button type="button" onClick={() => setFeedback(null)} className="cursor-pointer">
                <X size={14} />
              </button>
            </div>
          )}

          {/* ================= TIER 4: BRAND CUSTOMER STRICT MENU VIEWS ================= */}
          {session.hierarchyTier === 'BRAND_CUSTOMER' && (
            <>
              {activeSection === 'ACCOUNT_OVERVIEW' && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-[11px] font-mono uppercase text-slate-500 flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-emerald-700" />
                        <span>Tier 4 Self-Service Scope · Strictly Your {session.brandName} Records</span>
                      </div>
                      <h2 className="text-base font-bold text-slate-900">{session.actorName}</h2>
                      <div className="text-xs text-slate-600 font-mono tabular-nums">
                        Mobile: {session.actorContact || '—'} · Master ID:{' '}
                        {session.customerMasterId || session.actorId} · Office:{' '}
                        {session.assignedOffice || session.brandName}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-5 text-xs">
                      <div>
                        <div className="text-slate-500">My Properties</div>
                        <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                          {scopedData.properties.length}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500">My Inquiries</div>
                        <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                          {scopedData.leads.length}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500">SRM Tickets</div>
                        <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                          {scopedData.srmTickets.length}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveSection('SUBMIT_REQUEST')}
                      className="p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-500 text-left space-y-1 cursor-pointer"
                    >
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <Ticket size={15} className="text-blue-600" />
                        <span>Raise a Service Request or Inquiry</span>
                      </div>
                      <div className="text-slate-500">
                        Submit delivery, address, or scheme inquiries directly to {session.brandName}.
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection('MY_REQUESTS')}
                      className="p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-500 text-left space-y-1 cursor-pointer"
                    >
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <Briefcase size={15} className="text-slate-700" />
                        <span>Track My Open Requests ({scopedData.srmTickets.length + scopedData.leads.length})</span>
                      </div>
                      <div className="text-slate-500">
                        Review SLA deadlines and status updates on your submitted tickets.
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'MY_PROFILE' && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 text-xs">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <User size={15} className="text-slate-600" />
                    <span>My Registered Profile &amp; Active Products</span>
                  </h2>
                  {scopedData.customers.length === 0 ? (
                    <p className="text-slate-500">No profile record loaded.</p>
                  ) : (
                    scopedData.customers.map((c) => (
                      <div key={c.id} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-4">
                          <div>
                            <div className="text-slate-500">Registered Name</div>
                            <div className="font-semibold text-slate-900 mt-0.5">{c.name}</div>
                          </div>
                          <div>
                            <div className="text-slate-500">Mobile &amp; Beat</div>
                            <div className="font-mono text-slate-900 mt-0.5">
                              {c.mobile || '—'} · {c.beatNo || '—'} ({c.verificationStatus || 'Verified'})
                            </div>
                          </div>
                          <div className="sm:col-span-2">
                            <div className="text-slate-500">Registered Address</div>
                            <div className="text-slate-800 mt-0.5">
                              {c.address?.fullAddress ||
                                `${c.houseNo || ''} ${c.colony || ''} ${c.pincode || ''}`}
                            </div>
                          </div>
                        </div>
                        {c.products && c.products.length > 0 && (
                          <div className="pt-2 space-y-1.5">
                            <div className="font-semibold text-slate-800">
                              Enrolled Schemes / Products:
                            </div>
                            {c.products.map((p) => (
                              <div key={p.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                                {p.productName} ({p.productCode}) · <span className="font-mono">{p.status}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeSection === 'SUBMIT_REQUEST' && (
                <div className="max-w-xl bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Ticket size={15} className="text-slate-700" />
                    <span>Submit Request / Inquiry to {session.brandName}</span>
                  </h2>
                  <form onSubmit={handleCustomerSubmitRequest} className="space-y-3 text-xs">
                    {session.workspaceKey === 'INDIA_POST' && (
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Category</label>
                          <select
                            value={reqCategory}
                            onChange={(e) => setReqCategory(e.target.value as SrmTicketCategory)}
                            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                          >
                            <option value="Delivery Delay">Delivery Delay</option>
                            <option value="Address Correction">Address Correction</option>
                            <option value="PLI/RPLI Inquiry">PLI/RPLI Inquiry</option>
                            <option value="Savings/IPPB">Savings/IPPB</option>
                            <option value="Aadhaar/CELC">Aadhaar/CELC</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                          <select
                            value={reqPriority}
                            onChange={(e) => setReqPriority(e.target.value as SrmTicketPriority)}
                            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                      <input
                        type="text"
                        required
                        value={reqSubject}
                        onChange={(e) => setReqSubject(e.target.value)}
                        placeholder="Brief title of your request or scheme interest"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Details</label>
                      <textarea
                        rows={3}
                        value={reqDetails}
                        onChange={(e) => setReqDetails(e.target.value)}
                        placeholder="Add address, policy number, or timing notes"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                    >
                      Submit Request
                    </button>
                  </form>
                </div>
              )}

              {activeSection === 'MY_REQUESTS' && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-xs">
                  <h2 className="text-sm font-bold text-slate-900">
                    My Service Requests &amp; Leads ({scopedData.srmTickets.length + scopedData.leads.length})
                  </h2>
                  {scopedData.srmTickets.length === 0 && scopedData.leads.length === 0 ? (
                    <div className="text-slate-500 py-4">
                      No active service requests or scheme inquiries yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {scopedData.srmTickets.map((tk) => (
                        <div key={tk.id} className="py-3 flex items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-slate-900">
                              {tk.ticketNo} · {tk.subject}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {tk.officeName} · {tk.category}
                            </div>
                          </div>
                          <span className="font-mono font-semibold text-slate-800">{tk.status}</span>
                        </div>
                      ))}
                      {scopedData.leads.map((l) => (
                        <div key={l.id} className="py-3 flex items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-slate-900">{l.productName}</div>
                            <div className="text-[11px] text-slate-500">{l.requirement}</div>
                          </div>
                          <span className="font-mono font-semibold text-slate-800">{l.stage}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'MY_PROPERTIES' && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-200 text-sm font-bold text-slate-900">
                    My Linked Properties ({scopedData.properties.length})
                  </div>
                  {scopedData.properties.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No properties directly linked to your profile yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                            <th className="py-2.5 px-4">House / Code</th>
                            <th className="py-2.5 px-4">Colony</th>
                            <th className="py-2.5 px-4">PIN</th>
                            <th className="py-2.5 px-4">Beat</th>
                            <th className="py-2.5 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {scopedData.properties.map((p) => (
                            <tr key={p.id}>
                              <td className="py-2.5 px-4 font-semibold text-slate-900">
                                {p.houseNo || p.propertyCode || p.id}
                              </td>
                              <td className="py-2.5 px-4 text-slate-600">{p.colony || p.area || '—'}</td>
                              <td className="py-2.5 px-4 font-mono">{p.pincode}</td>
                              <td className="py-2.5 px-4 font-mono">{p.beatNo || '—'}</td>
                              <td className="py-2.5 px-4">{p.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ================= TIER 3: BRAND STAFF STRICT MENU VIEWS ================= */}
          {session.hierarchyTier === 'BRAND_STAFF' && (
            <>
              {activeSection === 'OVERVIEW' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-slate-200 text-xs">
                    <div className="p-5">
                      <div className="text-slate-500">Scoped Customers</div>
                      <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                        {scopedData.customers.length}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-slate-500">Brand Leads</div>
                      <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                        {scopedData.leads.length}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-slate-500">Operations / SRM</div>
                      <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                        {scopedData.tasks.length + scopedData.srmTickets.length}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-slate-500">Scoped Properties</div>
                      <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                        {scopedData.properties.length}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-2">
                      <div className="font-mono uppercase text-slate-500">Active Role &amp; Scope</div>
                      <div className="text-base font-bold text-slate-900">
                        {session.designation || session.staffRole}
                      </div>
                      <div className="text-slate-600">
                        Brand: <strong>{session.brandName}</strong> ({session.uniqueCode})
                      </div>
                      <div className="text-slate-600">
                        Office: {session.assignedOffice || '—'} · Beat: {session.beat || 'Assigned Scope'}
                      </div>
                    </div>
                    <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                      <div className="font-mono uppercase text-slate-500">Permitted Sidenav Modules</div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {allowedNavItems.map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setActiveSection(item.key as ActivePortalSectionKey)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'CUSTOMERS' && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Scoped Customers ({visibleCustomers.length})
                      </h2>
                      <p className="text-xs text-slate-500">
                        {session.permissions?.canViewAllBrandCustomers
                          ? `Full ${session.brandName} customer access`
                          : `Beat/Office scoped (${session.beat || session.assignedOffice || 'Assigned'})`}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search scoped customers..."
                          className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      {canCreate && (
                        <button
                          type="button"
                          onClick={() => setShowAddCust((s) => !s)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>Add Customer</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {showAddCust && canCreate && (
                    <form
                      onSubmit={handleStaffAddCustomer}
                      className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"
                    >
                      <input
                        type="text"
                        required
                        value={newCustName}
                        onChange={(e) => setNewCustName(e.target.value)}
                        placeholder="Customer Name *"
                        className="px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      />
                      <input
                        type="tel"
                        maxLength={10}
                        value={newCustMobile}
                        onChange={(e) => setNewCustMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-Digit Mobile"
                        className="px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono tabular-nums"
                      />
                      <input
                        type="text"
                        value={newCustColony}
                        onChange={(e) => setNewCustColony(e.target.value)}
                        placeholder="Colony / Locality"
                        className="px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={newCustPin}
                          onChange={(e) => setNewCustPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="PIN"
                          className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono tabular-nums"
                        />
                        <button
                          type="submit"
                          className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-lg font-semibold cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                          <th className="py-2.5 px-4">Customer Name</th>
                          <th className="py-2.5 px-4">Mobile</th>
                          <th className="py-2.5 px-4">Colony / Area</th>
                          <th className="py-2.5 px-4">PIN</th>
                          <th className="py-2.5 px-4">Beat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {visibleCustomers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-500">
                              No customers assigned inside your {session.brandName} scope.
                            </td>
                          </tr>
                        ) : (
                          visibleCustomers.slice(0, 100).map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-4 font-semibold text-slate-900">{c.name}</td>
                              <td className="py-2.5 px-4 font-mono tabular-nums text-slate-700">
                                {c.mobile || '—'}
                              </td>
                              <td className="py-2.5 px-4 text-slate-600">{c.colony || c.area || '—'}</td>
                              <td className="py-2.5 px-4 font-mono tabular-nums text-slate-700">
                                {c.pincode || '—'}
                              </td>
                              <td className="py-2.5 px-4 font-mono text-slate-600">{c.beatNo || '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSection === 'LEADS' && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-sm font-bold text-slate-900">
                      {session.brandName} Leads ({visibleLeads.length})
                    </h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={leadSearch}
                          onChange={(e) => setLeadSearch(e.target.value)}
                          placeholder="Search leads..."
                          className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg"
                        />
                      </div>
                      {canCreate && (
                        <button
                          type="button"
                          onClick={() => setShowAddLead((s) => !s)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>New Lead</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {showAddLead && canCreate && (
                    <form
                      onSubmit={handleStaffAddLead}
                      className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3"
                    >
                      <input
                        required
                        value={newLeadCustName}
                        onChange={(e) => setNewLeadCustName(e.target.value)}
                        placeholder="Customer Name *"
                        className="px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      />
                      <input
                        maxLength={10}
                        value={newLeadCustMobile}
                        onChange={(e) => setNewLeadCustMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-Digit Mobile"
                        className="px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                      <input
                        required
                        value={newLeadProduct}
                        onChange={(e) => setNewLeadProduct(e.target.value)}
                        placeholder="Product / Scheme *"
                        className="px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      />
                      <div className="flex gap-2">
                        <input
                          value={newLeadRequirement}
                          onChange={(e) => setNewLeadRequirement(e.target.value)}
                          placeholder="Notes"
                          className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg"
                        />
                        <button
                          type="submit"
                          className="px-3 py-2 bg-slate-900 text-white rounded-lg font-semibold cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  )}

                  {visibleLeads.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      No leads inside {session.brandName}.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {visibleLeads.slice(0, 60).map((l) => (
                        <div key={l.id} className="p-4 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-slate-900">
                              {l.customerName} · {l.productName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {l.beatNo || 'No Beat'} · {l.customerMobile || 'No Mobile'}
                            </div>
                          </div>
                          <span className="font-mono font-semibold text-slate-800">{l.stage}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'OPERATIONS' && (
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-xs">
                    <h2 className="text-sm font-bold text-slate-900">
                      Workspace Tasks ({scopedData.tasks.length})
                    </h2>
                    {scopedData.tasks.length === 0 ? (
                      <div className="text-slate-500">No operational tasks assigned.</div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {scopedData.tasks.map((t) => (
                          <div key={t.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <div className="font-semibold text-slate-900">
                                {t.code} · {t.title}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Assignee: {t.assigneeName} · Due: {t.dueDate}
                              </div>
                            </div>
                            <select
                              disabled={!canManageOps}
                              value={t.status}
                              onChange={(e) =>
                                xpeedoOpsService.updateTaskStatus(
                                  t.id,
                                  e.target.value as OpsTaskStatus,
                                  session.actorName,
                                  session.staffRole || 'BRAND_STAFF'
                                )
                              }
                              className="px-2 py-1 border border-slate-300 rounded bg-white disabled:bg-slate-100"
                            >
                              {ALL_OPS_TASK_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {session.workspaceKey === 'INDIA_POST' && (
                    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-xs">
                      <h2 className="text-sm font-bold text-slate-900">
                        India Post SRM Tickets ({scopedData.srmTickets.length})
                      </h2>
                      {scopedData.srmTickets.length === 0 ? (
                        <div className="text-slate-500">No SRM tickets in queue.</div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {scopedData.srmTickets.map((tk) => (
                            <div key={tk.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <div className="font-semibold text-slate-900">
                                  {tk.ticketNo} · {tk.subject}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {tk.officeName} ({tk.pincode}) · {tk.customerName} ·{' '}
                                  {tk.postCategory ||
                                    xpeedoOpsService.derivePostCategoryFromSrmCategory(tk.category)}
                                </div>
                              </div>
                              <select
                                disabled={!canManageOps}
                                value={tk.status}
                                onChange={(e) =>
                                  xpeedoOpsService.updateSrmTicketStatus(
                                    tk.id,
                                    { status: e.target.value as SrmTicketStatus },
                                    session.actorName,
                                    session.staffRole || 'BRAND_STAFF'
                                  )
                                }
                                className="px-2 py-1 border border-slate-300 rounded bg-white disabled:bg-slate-100"
                              >
                                <option value="Open">Open</option>
                                <option value="Assigned">Assigned</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Escalated">Escalated</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'PROPERTIES' && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
                  <div className="p-4 border-b border-slate-200 text-sm font-bold text-slate-900">
                    Scoped Properties ({scopedData.properties.length})
                  </div>
                  {scopedData.properties.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No properties assigned inside your current {session.brandName} beat/office scope.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                          <th className="py-2.5 px-4">Property / House</th>
                          <th className="py-2.5 px-4">Colony</th>
                          <th className="py-2.5 px-4">PIN</th>
                          <th className="py-2.5 px-4">Beat</th>
                          <th className="py-2.5 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {scopedData.properties.slice(0, 80).map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4 font-semibold text-slate-900">
                              {p.houseNo || p.propertyCode || p.id}
                            </td>
                            <td className="py-2.5 px-4 text-slate-600">{p.colony || p.area || '—'}</td>
                            <td className="py-2.5 px-4 font-mono tabular-nums text-slate-700">{p.pincode}</td>
                            <td className="py-2.5 px-4 font-mono text-slate-600">{p.beatNo || '—'}</td>
                            <td className="py-2.5 px-4 text-slate-700">{p.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeSection === 'BEATS' && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-200">
                    <h2 className="text-sm font-bold text-slate-900">
                      Beats &amp; Territory Assignment
                    </h2>
                    <p className="text-xs text-slate-500">
                      Active scope: {session.assignedOffice || session.brandName} · {session.beat || 'All Assigned Beats'}
                    </p>
                  </div>
                  {session.workspaceKey === 'INDIA_POST' ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                            <th className="py-2.5 px-4">Beat</th>
                            <th className="py-2.5 px-4">Office &amp; PIN</th>
                            <th className="py-2.5 px-4">Covered Colonies</th>
                            <th className="py-2.5 px-4">Assigned Postman</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {scopedBeats.slice(0, 50).map((b) => (
                            <tr key={`${b.officeName}-${b.beatNumber}`} className="hover:bg-slate-50">
                              <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">
                                {b.beatNumber}
                              </td>
                              <td className="py-2.5 px-4 text-slate-700">
                                {b.officeName} ({b.pincode})
                              </td>
                              <td className="py-2.5 px-4 text-slate-600">{b.coloniesFormatted}</td>
                              <td className="py-2.5 px-4 text-slate-700">{b.assignedPostmanName}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-xs text-slate-600">
                      Your territory is scoped to <strong>{session.assignedOffice || session.brandName}</strong> ({session.beat || 'Standard Zone'}, PIN {session.pincode || '324009'}).
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'REPORTS' && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 text-xs">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Scoped CSV Exports ({session.brandName})
                    </h2>
                    <p className="text-slate-500 mt-0.5">
                      {canExport
                        ? 'Download UTF-8 BOM CSV files limited strictly to your authorized records.'
                        : 'CSV export permission is currently disabled by your Brand Owner.'}
                    </p>
                  </div>
                  {canExport && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          exportCsvWithBom(
                            `${session.partnerSlug}_staff_customers`,
                            ['ID', 'Name', 'Mobile', 'Colony', 'PIN', 'Beat'],
                            scopedData.customers.map((c) => [
                              c.masterId || c.id,
                              c.name,
                              c.mobile || '',
                              c.colony || c.area || '',
                              c.pincode || '',
                              c.beatNo || '',
                            ])
                          );
                          showToast(`Exported ${scopedData.customers.length} scoped customers.`);
                        }}
                        className="p-4 border border-slate-200 rounded-xl hover:border-blue-500 text-left space-y-1 cursor-pointer"
                      >
                        <div className="font-bold text-slate-900 flex items-center justify-between">
                          <span>Scoped Customers CSV</span>
                          <Download size={14} className="text-blue-600" />
                        </div>
                        <div className="text-slate-500 font-mono">{scopedData.customers.length} rows</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          exportCsvWithBom(
                            `${session.partnerSlug}_staff_leads`,
                            ['Lead ID', 'Customer', 'Mobile', 'Product', 'Stage', 'Beat'],
                            scopedData.leads.map((l) => [
                              l.id,
                              l.customerName,
                              l.customerMobile || '',
                              l.productName,
                              l.stage,
                              l.beatNo || '',
                            ])
                          );
                          showToast(`Exported ${scopedData.leads.length} brand leads.`);
                        }}
                        className="p-4 border border-slate-200 rounded-xl hover:border-blue-500 text-left space-y-1 cursor-pointer"
                      >
                        <div className="font-bold text-slate-900 flex items-center justify-between">
                          <span>Brand Leads CSV</span>
                          <Download size={14} className="text-blue-600" />
                        </div>
                        <div className="text-slate-500 font-mono">{scopedData.leads.length} rows</div>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'MY_PROFILE' && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 text-xs">
                  <h2 className="text-sm font-bold text-slate-900">
                    My Staff Credentials &amp; Brand RBAC Permissions
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div>
                      <div className="text-slate-500">Staff Name</div>
                      <div className="font-semibold text-slate-900 mt-0.5">{session.actorName}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Role / Designation</div>
                      <div className="font-semibold text-slate-900 mt-0.5">
                        {session.designation || session.staffRole} ({session.staffRole})
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Office &amp; Beat</div>
                      <div className="font-mono text-slate-900 mt-0.5">
                        {session.assignedOffice || '—'} · {session.beat || '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Contact</div>
                      <div className="font-mono text-slate-900 mt-0.5">
                        {session.actorContact || session.actorEmail || '—'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-semibold text-slate-800">Active Permission Grants</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { label: 'View All Brand Customers', val: session.permissions?.canViewAllBrandCustomers },
                        { label: 'Create Customers & Leads', val: session.permissions?.canCreateCustomerOrLead },
                        { label: 'Edit Existing Customers', val: session.permissions?.canEditCustomer },
                        { label: 'Update Tasks & SRM Queue', val: session.permissions?.canManageSrmOrTasks },
                        { label: 'Export Scoped CSV Reports', val: session.permissions?.canExportReports },
                      ].map((row) => (
                        <div
                          key={row.label}
                          className="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between"
                        >
                          <span className="text-slate-700">{row.label}</span>
                          <span
                            className={`font-mono font-semibold ${
                              row.val ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                          >
                            {row.val ? 'ALLOWED' : 'DENIED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
