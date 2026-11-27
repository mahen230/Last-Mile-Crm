import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  BookOpen,
  Building,
  CheckCircle2,
  ClipboardCheck,
  Download,
  ExternalLink,
  FileText,
  GitBranch,
  MapPin,
  Plus,
  Route,
  Search,
  ShieldCheck,
  Store,
  Ticket,
  Users,
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { exportCsvWithBom, xpeedoOpsService } from '../../services/xpeedoOpsService';
import { staffPermissionService } from '../../services/staffPermissionService';
import { customerService } from '../../services/customerService';
import { kotaOsHierarchyService } from '../../services/kotaOsHierarchyService';
import { POSTAL_PRODUCTS } from '../../data/productsData';
import { CONSOLIDATED_BEAT_MATRIX } from '../../data/consolidatedBeatMatrix';
import {
  SrmTicketCategory,
  SrmTicketPriority,
  SrmTicketStatus,
} from '../../types/xpeedoOps';
import { OrgHierarchyLevel } from '../../types/models';
import IndiaPostStaffRolesPromotionsView from './IndiaPostStaffRolesPromotionsView';
import DashboardQuickActionsFab from '../common/DashboardQuickActionsFab';

const OfficeMasterView = lazy(() => import('../crm/OfficeMasterView'));
const BeatManagementView = lazy(() => import('../crm/BeatManagementView'));
const UnifiedPropertyFamilyHub = lazy(() => import('../crm/UnifiedPropertyFamilyHub'));
const LocationIntelligenceHub = lazy(() => import('../crm/LocationIntelligenceHub'));
const DataQualityView = lazy(() => import('../crm/DataQualityView'));
const AddressResolutionView = lazy(() => import('../crm/AddressResolutionView'));
const ServicesCatalogView = lazy(() => import('../crm/ServicesCatalogView'));
const OfficialStaffDocumentsHub = lazy(() => import('../crm/OfficialStaffDocumentsHub'));
const Acg61ChargeReportView = lazy(() => import('../crm/Acg61ChargeReportView'));
const PostalLMSView = lazy(() => import('../crm/PostalLMSView'));
const IndiaPostStorefrontView = lazy(() => import('../crm/IndiaPostStorefrontView'));
const DailyVerificationView = lazy(() => import('../postman/DailyVerificationView'));
const DoorstepSurveyWorkflowView = lazy(() => import('../postman/DoorstepSurveyWorkflowView'));
const PostmanAllDayArticlesOverview = lazy(() => import('../postman/PostmanAllDayArticlesOverview'));
const IndiaPostMasterSearchAndInspectionView = lazy(() => import('./IndiaPostMasterSearchAndInspectionView'));

export type IndiaPostTab =
  | 'OVERVIEW'
  | 'SEARCH_VIEW'
  | 'HIERARCHY'
  | 'OFFICES_MASTER'
  | 'BEATS_MATRIX'
  | 'STAFF_ROLES'
  | 'SRM'
  | 'GEO_PROPERTY'
  | 'CRM_PRODUCTS'
  | 'STATUTORY_DOCS'
  | 'DAILY_OPS'
  | 'LMS_STOREFRONT'
  | 'STAFF_ATTENDANCE'
  | 'REPORTS';

const VALID_TABS: Set<string> = new Set([
  'OVERVIEW',
  'SEARCH_VIEW',
  'HIERARCHY',
  'OFFICES_MASTER',
  'BEATS_MATRIX',
  'STAFF_ROLES',
  'SRM',
  'GEO_PROPERTY',
  'CRM_PRODUCTS',
  'STATUTORY_DOCS',
  'DAILY_OPS',
  'LMS_STOREFRONT',
  'STAFF_ATTENDANCE',
  'REPORTS',
]);

function ModuleFallback() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
      Loading India Post module...
    </div>
  );
}

export default function IndiaPostCommandWorkspace({
  indiaPostOwnerAccess = false,
}: {
  indiaPostOwnerAccess?: boolean;
} = {}) {
  const { userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tick, setTick] = useState(0);

  const initialTab = (() => {
    const t = (searchParams.get('tab') || '').toUpperCase();
    return (VALID_TABS.has(t) ? t : 'OVERVIEW') as IndiaPostTab;
  })();

  const [activeTab, setActiveTabState] = useState<IndiaPostTab>(initialTab);
  const [geoSubMode, setGeoSubMode] = useState<'SUMMARY' | 'FAMILY_HUB' | 'LOCATION_INTEL' | 'DUPLICATES'>('SUMMARY');
  const [docsSubMode, setDocsSubMode] = useState<'DOCS_HUB' | 'ACG61' | 'ARTICLES'>('DOCS_HUB');
  const [opsSubMode, setOpsSubMode] = useState<'VERIFICATION' | 'SURVEY' | 'ADDRESS'>('VERIFICATION');
  const [lmsSubMode, setLmsSubMode] = useState<'LMS' | 'STOREFRONT'>('LMS');
  const [notice, setNotice] = useState<string | null>(null);

  const setActiveTab = (next: IndiaPostTab) => {
    setActiveTabState(next);
    const params = new URLSearchParams(searchParams);
    params.set('tab', next);
    setSearchParams(params, { replace: true });
  };

  useEffect(() => {
    const t = (searchParams.get('tab') || '').toUpperCase();
    if (VALID_TABS.has(t) && t !== activeTab) {
      setActiveTabState(t as IndiaPostTab);
    }
  }, [searchParams, activeTab]);

  // Hierarchy Create Form
  const [nodeLevel, setNodeLevel] = useState<OrgHierarchyLevel>('SO');
  const [nodeCode, setNodeCode] = useState('');
  const [nodeName, setNodeName] = useState('');
  const [nodePincode, setNodePincode] = useState('');

  // SRM Create Form
  const [srmOfficeId, setSrmOfficeId] = useState('DADABARI_SO');
  const [srmBeatNo, setSrmBeatNo] = useState('Beat 2');
  const [srmCustomerName, setSrmCustomerName] = useState('');
  const [srmCustomerMobile, setSrmCustomerMobile] = useState('');
  const [srmCategory, setSrmCategory] = useState<SrmTicketCategory>('Delivery Delay');
  const [srmPriority, setSrmPriority] = useState<SrmTicketPriority>('High');
  const [srmSubject, setSrmSubject] = useState('');
  const [srmDesc, setSrmDesc] = useState('');
  const [srmAssignee, setSrmAssignee] = useState('');

  // Geo 10-level drill-down filters
  const [selectedPincode, setSelectedPincode] = useState('ALL');
  const [selectedColony, setSelectedColony] = useState('ALL');

  // Attendance Form
  const [attEmpId, setAttEmpId] = useState('');
  const [attDate, setAttDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attStatus, setAttStatus] = useState<'Present' | 'Field Duty' | 'Half Day' | 'On Leave' | 'Absent'>('Field Duty');
  const [attRemarks, setAttRemarks] = useState('');

  useEffect(() => {
    const u1 = xpeedoOpsService.subscribe(() => setTick((t) => t + 1));
    const u2 = kotaOsHierarchyService.subscribe(() => setTick((t) => t + 1));
    const u3 = customerService.subscribe(() => setTick((t) => t + 1));
    const u4 = staffPermissionService.subscribe(() => setTick((t) => t + 1));
    return () => {
      u1();
      u2();
      u3();
      u4();
    };
  }, []);

  const role = indiaPostOwnerAccess
    ? 'CLIENT_ADMIN'
    : xpeedoOpsService.resolvePlatformRole(userProfile);
  const canManageSrm =
    indiaPostOwnerAccess || xpeedoOpsService.canPerform(userProfile, 'manageSrm');

  // Strict India Post Data Isolation (Filter out any non-India-Post commercial records)
  const offices = useMemo(() => {
    const raw = staffPermissionService.getDynamicOffices();
    const seen = new Set<string>();
    return raw.filter((o) => {
      const key = (o.officeId || o.id || o.officeName).toUpperCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return !o.brandId || o.brandId === 'india-post';
    });
  }, [tick]);

  const postalStaff = useMemo(
    () =>
      staffPermissionService
        .getAllStaffProfiles()
        .filter((s) => !s.brandId || s.brandId === 'india-post'),
    [tick]
  );

  const postalCustomers = useMemo(
    () =>
      customerService
        .getCustomers()
        .filter((c) => !c.brandId || c.brandId === 'india-post'),
    [tick]
  );

  const postalLeads = useMemo(
    () =>
      customerService
        .getLeads()
        .filter((l) => !l.brandId || l.brandId === 'india-post'),
    [tick]
  );

  const properties = useMemo(() => customerService.getProperties(), [tick]);
  const hierarchyNodes = kotaOsHierarchyService.getOrgHierarchyNodes();
  const srmTickets = xpeedoOpsService.getSrmTickets();
  const attendanceLogs = xpeedoOpsService.getIndiaPostAttendance();

  const schemeBreakdown = useMemo(() => {
    const counts = { PLI: 0, RPLI: 0, SSA: 0, IPPB: 0 };
    postalLeads.forEach((l) => {
      const text = `${l.productCode || ''} ${l.productName || ''}`.toUpperCase();
      if (text.includes('RPLI')) counts.RPLI += 1;
      else if (text.includes('PLI')) counts.PLI += 1;
      if (text.includes('SSA') || text.includes('SUKANYA') || text.includes('SSY')) counts.SSA += 1;
      if (text.includes('IPPB')) counts.IPPB += 1;
    });
    return counts;
  }, [postalLeads]);

  // Duplicate Property / Address Conflict Check
  const duplicateProperties = useMemo(() => {
    const counts = new Map<string, number>();
    properties.forEach((p) => {
      const sig = `${(p.houseNo || '').trim().toLowerCase()}|${(p.colony || p.area || '').trim().toLowerCase()}|${(p.pincode || '').trim()}`;
      if (sig !== '||') {
        counts.set(sig, (counts.get(sig) || 0) + 1);
      }
    });
    return properties.filter((p) => {
      const sig = `${(p.houseNo || '').trim().toLowerCase()}|${(p.colony || p.area || '').trim().toLowerCase()}|${(p.pincode || '').trim()}`;
      return (counts.get(sig) || 0) > 1;
    });
  }, [properties]);

  const uniquePincodes = useMemo(
    () => Array.from(new Set(offices.map((o) => o.pincode).filter(Boolean))).sort(),
    [offices]
  );

  const uniqueColonies = useMemo(
    () =>
      Array.from(
        new Set(properties.map((p) => p.colony || p.area || '').filter(Boolean))
      ).sort(),
    [properties]
  );

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (selectedPincode !== 'ALL' && p.pincode !== selectedPincode) return false;
      if (selectedColony !== 'ALL' && (p.colony || p.area) !== selectedColony) return false;
      return true;
    });
  }, [properties, selectedPincode, selectedColony]);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 5000);
  };

  const handleCreateSrm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srmSubject.trim() || !srmCustomerName.trim()) return;
    const office = offices.find((o) => (o.officeId || o.id) === srmOfficeId) || offices[0];
    const created = xpeedoOpsService.createSrmTicket(
      {
        officeId: office?.officeId || office?.id || srmOfficeId,
        officeName: office?.officeName || 'Kota Division Office',
        pincode: office?.pincode || '324009',
        beatNo: srmBeatNo.trim() || 'Beat 1',
        customerName: srmCustomerName.trim(),
        customerMobile: srmCustomerMobile.trim(),
        category: srmCategory,
        subject: srmSubject.trim(),
        description: srmDesc.trim() || srmSubject.trim(),
        priority: srmPriority,
        assignedTo: srmAssignee.trim() || office?.assignedInchargeName || 'Division Desk',
      },
      userProfile?.name || 'India Post Admin',
      role
    );
    setSrmCustomerName('');
    setSrmCustomerMobile('');
    setSrmSubject('');
    setSrmDesc('');
    showNotice(`Created SRM Ticket ${created.ticketNo} (SLA ${created.slaHours}h).`);
  };

  const handleCreateHierarchyNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeName.trim() || !nodeCode.trim()) return;
    kotaOsHierarchyService.upsertOrgNode(
      {
        code: nodeCode.trim().toUpperCase(),
        name: nodeName.trim(),
        level: nodeLevel,
        pincode: nodePincode.trim() || undefined,
        vendorId: 'INDIA_POST',
        status: 'ACTIVE',
      },
      userProfile?.name || 'India Post Admin',
      role
    );
    setNodeCode('');
    setNodeName('');
    setNodePincode('');
    showNotice(`Added ${nodeLevel} node "${nodeName.trim()}" to India Post Hierarchy.`);
  };

  const handleLogAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = postalStaff.find((s) => s.id === attEmpId) || postalStaff[0];
    if (!emp) return;
    xpeedoOpsService.logIndiaPostAttendance(
      {
        employeeId: emp.employeeId || emp.id,
        employeeName: emp.name,
        officeName: emp.assignedOffice || 'Kota Division',
        beatNo: emp.beat || 'Beat 1',
        date: attDate,
        status: attStatus,
        remarks: attRemarks.trim(),
      },
      userProfile?.name || 'India Post Admin',
      role
    );
    setAttRemarks('');
    showNotice(`Logged ${attStatus} for ${emp.name} (${attDate}).`);
  };

  const TABS: Array<{ key: IndiaPostTab; label: string }> = [
    { key: 'OVERVIEW', label: 'Dynamic Dashboard' },
    { key: 'SEARCH_VIEW', label: 'Master Search & View' },
    { key: 'HIERARCHY', label: 'Org Hierarchy' },
    { key: 'OFFICES_MASTER', label: `Offices Master (${offices.length})` },
    { key: 'BEATS_MATRIX', label: `Beats & PIN (${CONSOLIDATED_BEAT_MATRIX.length})` },
    { key: 'STAFF_ROLES', label: `Staff Roles & Promotions (${postalStaff.length})` },
    { key: 'SRM', label: `SRM & Escalations (${srmTickets.length})` },
    { key: 'GEO_PROPERTY', label: `Property & Geo (${properties.length})` },
    { key: 'CRM_PRODUCTS', label: `Schemes & Leads (${postalLeads.length})` },
    { key: 'STATUTORY_DOCS', label: 'Statutory Docs & ACG-61' },
    { key: 'DAILY_OPS', label: 'Daily Verification & Surveys' },
    { key: 'LMS_STOREFRONT', label: 'Postal LMS & Storefront' },
    { key: 'STAFF_ATTENDANCE', label: `Attendance (${attendanceLogs.length})` },
    { key: 'REPORTS', label: 'Reporting & CSV' },
  ];

  return (
    <div className="space-y-6" id="india-post-command-workspace">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white rounded-2xl border border-red-900/60 p-6 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black uppercase tracking-wider text-[10px]">
                BRD-INPOST-01
              </span>
              <span className="font-mono text-amber-300 uppercase tracking-wide font-semibold">
                Department of Post · Kota Division, Rajasthan Pilot
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-1.5">
              Department of Post — Unified Operations &amp; Master Command Center
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Single operational source of truth: Circle → Region → Division → HPO → SO → BO hierarchy,
              Office Master, Kota Division &amp; Rajasthan Beat Tree, Staff Roles &amp; Promotions, 10-level property registry, CRM schemes, B2B accounts, SRM SLA ticketing, statutory bills, and LMS.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'SEARCH_VIEW' ? 'OVERVIEW' : 'SEARCH_VIEW')}
              className={`px-3.5 py-2 rounded-lg font-black flex items-center gap-1.5 cursor-pointer transition shadow-sm ${
                activeTab === 'SEARCH_VIEW'
                  ? 'bg-white text-red-950'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
            >
              <Search size={14} />
              <span>{activeTab === 'SEARCH_VIEW' ? 'Exit Search Mode' : 'Master Search & View Mode'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('OFFICES_MASTER')}
              className="px-3 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-red-900/50 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Building size={13} />
              <span>Office Master</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('GEO_PROPERTY');
                setGeoSubMode('LOCATION_INTEL');
              }}
              className="px-3 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-red-900/50 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <MapPin size={13} />
              <span>11-Level Geo Hub</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('BEATS_MATRIX')}
              className="px-3 py-2 rounded-lg bg-red-800 hover:bg-red-700 border border-red-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Route size={13} />
              <span>Beat Console</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-red-900/40">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === t.key
                  ? t.key === 'SEARCH_VIEW'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-red-700 text-white shadow-xs'
                  : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-red-950/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 size={15} className="shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* TAB: MASTER SEARCH & INSPECTION VIEW */}
      {activeTab === 'SEARCH_VIEW' && (
        <Suspense fallback={<ModuleFallback />}>
          <IndiaPostMasterSearchAndInspectionView />
        </Suspense>
      )}

      {/* TAB 1: DYNAMIC OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-red-50 via-amber-50/70 to-white border border-red-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-red-800 text-amber-300 shadow-xs shrink-0">
                <Search size={20} />
              </div>
              <div>
                <div className="text-[11px] font-mono font-bold text-red-800 uppercase">
                  Master Brand Owner Search &amp; View Mode
                </div>
                <h2 className="text-base font-black text-slate-900">
                  Deep Multi-Level Search Across Managed Beat Tree, {postalStaff.length} Staff, {properties.length} Properties &amp; B2B Network
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Drill down Office → Beat → Role → Staff, or PIN → Colony → Beat → Citizen/Property, plus Postal Schemes &amp; Revenue Agents.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('SEARCH_VIEW')}
              className="px-4 py-2.5 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shrink-0 shadow-xs"
            >
              <Search size={14} className="text-amber-300" />
              <span>Launch Search &amp; View Mode</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">Postal Offices</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">{offices.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">HO / SO / BO normalized</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">Postal Staff</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">{postalStaff.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{attendanceLogs.length} attendance logs</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">Delivery Beats</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {CONSOLIDATED_BEAT_MATRIX.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Active beat matrix</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">Properties</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">{properties.length}</div>
              <div className="text-[11px] text-amber-700 mt-0.5">
                {duplicateProperties.length} duplicate checks
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">Citizen CRM &amp; Leads</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {postalCustomers.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{postalLeads.length} scheme leads</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">SRM Tickets</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {srmTickets.filter((t) => t.status !== 'Closed' && t.status !== 'Resolved').length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {srmTickets.filter((t) => t.status === 'Escalated').length} escalated
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <h2 className="text-sm font-bold text-slate-900">Quick Consolidated Modules</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('GEO_PROPERTY');
                    setGeoSubMode('FAMILY_HUB');
                  }}
                  className="p-3 rounded-lg border border-slate-200 hover:border-blue-500 text-left cursor-pointer"
                >
                  <div className="font-bold text-slate-900">Property &amp; Household Hub</div>
                  <div className="text-slate-500 mt-0.5">Door-level address &amp; floor units</div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('STAFF_ROLES')}
                  className="p-3 rounded-lg border border-slate-200 hover:border-blue-500 text-left cursor-pointer"
                >
                  <div className="font-bold text-slate-900">Staff Roles &amp; Promotions</div>
                  <div className="text-slate-500 mt-0.5">Post-wise duties &amp; promotion orders</div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('CRM_PRODUCTS')}
                  className="p-3 rounded-lg border border-slate-200 hover:border-blue-500 text-left cursor-pointer"
                >
                  <div className="font-bold text-slate-900">Postal Schemes &amp; Leads Pool</div>
                  <div className="text-slate-500 mt-0.5">PLI / RPLI / SSA / IPPB triage</div>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('STATUTORY_DOCS')}
                  className="p-3 rounded-lg border border-slate-200 hover:border-blue-500 text-left cursor-pointer"
                >
                  <div className="font-bold text-slate-900">Statutory Docs &amp; ACG-61</div>
                  <div className="text-slate-500 mt-0.5">Charge reports, fuel &amp; BYOD bills</div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Normalized Kota Division Offices</h2>
                <span className="text-xs text-slate-500 tabular-nums">{offices.length} unique codes</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto custom-scrollbar text-xs">
                {offices.slice(0, 15).map((off) => (
                  <div key={off.officeId || off.id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900">{off.officeName}</span>
                      <span className="text-slate-400 font-mono ml-2">{off.officeType}</span>
                    </div>
                    <span className="font-mono text-slate-600 tabular-nums">PIN {off.pincode}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Postal Schemes Pipeline &amp; Territory Summary</h2>
                <p className="text-xs text-slate-500">Live division pipeline across PLI, RPLI, Sukanya Samriddhi (SSA), and IPPB leads</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('CRM_PRODUCTS')}
                className="text-xs font-semibold text-blue-700 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Open Schemes &amp; Leads Pool →
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-slate-500">PLI Leads</div>
                <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">{schemeBreakdown.PLI}</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-slate-500">RPLI Leads</div>
                <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">{schemeBreakdown.RPLI}</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-slate-500">SSA / Sukanya Leads</div>
                <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">{schemeBreakdown.SSA}</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-slate-500">IPPB Banking Leads</div>
                <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">{schemeBreakdown.IPPB}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORGANIZATIONAL HIERARCHY */}
      {activeTab === 'HIERARCHY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Configurable Postal Hierarchy Tree
                </h2>
                <p className="text-xs text-slate-500">
                  Central Admin → Circle → Region → Division → Head Post Office → Sub Post Office → Branch Post Office
                </p>
              </div>
              <GitBranch size={18} className="text-blue-600" />
            </div>
            <div className="divide-y divide-slate-100 text-xs max-h-[460px] overflow-y-auto custom-scrollbar">
              {hierarchyNodes.map((n) => (
                <div key={n.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-mono font-bold text-blue-700 mr-2">[{n.level}]</span>
                    <span className="font-semibold text-slate-900">{n.name}</span>
                    <span className="text-slate-400 font-mono ml-2">{n.code}</span>
                  </div>
                  <div className="font-mono text-slate-500 tabular-nums shrink-0">
                    {n.pincode ? `PIN ${n.pincode}` : n.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add / Configure Hierarchy Node</h3>
            <form onSubmit={handleCreateHierarchyNode} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hierarchy Level</label>
                <select
                  value={nodeLevel}
                  onChange={(e) => setNodeLevel(e.target.value as OrgHierarchyLevel)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="CIRCLE">Circle</option>
                  <option value="REGION">Region</option>
                  <option value="DIVISION">Division</option>
                  <option value="SUBDIVISION">Subdivision</option>
                  <option value="HPO">Head Post Office (HPO)</option>
                  <option value="SO">Sub Post Office (SO)</option>
                  <option value="BO">Branch Post Office (BO)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Node Code *</label>
                <input
                  required
                  value={nodeCode}
                  onChange={(e) => setNodeCode(e.target.value)}
                  placeholder="e.g., KOTA-NEW-SO"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Name *</label>
                <input
                  required
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  placeholder="e.g., Vigyan Nagar S.O."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">PIN Code (Optional)</label>
                <input
                  value={nodePincode}
                  onChange={(e) => setNodePincode(e.target.value)}
                  placeholder="6-digit PIN"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg cursor-pointer"
              >
                Save Hierarchy Node
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB: OFFICES MASTER */}
      {activeTab === 'OFFICES_MASTER' && (
        <Suspense fallback={<ModuleFallback />}>
          <OfficeMasterView indiaPostOwnerAccess={indiaPostOwnerAccess} />
        </Suspense>
      )}

      {/* TAB: BEATS MATRIX */}
      {activeTab === 'BEATS_MATRIX' && (
        <Suspense fallback={<ModuleFallback />}>
          <BeatManagementView indiaPostOwnerAccess={indiaPostOwnerAccess} />
        </Suspense>
      )}

      {/* TAB: STAFF ROLES & PROMOTIONS */}
      {activeTab === 'STAFF_ROLES' && (
        <IndiaPostStaffRolesPromotionsView actorOverride={userProfile?.name} />
      )}

      {/* TAB 3: SRM */}
      {activeTab === 'SRM' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Ticket size={17} className="text-blue-600" />
              <span>Log Service Request (SRM)</span>
            </div>
            <form onSubmit={handleCreateSrm} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Postal Office</label>
                <select
                  value={srmOfficeId}
                  onChange={(e) => setSrmOfficeId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {offices.map((o) => (
                    <option key={o.officeId || o.id} value={o.officeId || o.id}>
                      {o.officeName} ({o.pincode})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={srmCategory}
                    onChange={(e) => setSrmCategory(e.target.value as SrmTicketCategory)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Delivery Delay">Delivery Delay</option>
                    <option value="Address Correction">Address Correction</option>
                    <option value="PLI/RPLI Inquiry">PLI/RPLI Inquiry</option>
                    <option value="Savings/IPPB">Savings/IPPB</option>
                    <option value="Aadhaar/CELC">Aadhaar/CELC</option>
                    <option value="Beat Dispute">Beat Dispute</option>
                    <option value="Staff Grievance">Staff Grievance</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority &amp; SLA</label>
                  <select
                    value={srmPriority}
                    onChange={(e) => setSrmPriority(e.target.value as SrmTicketPriority)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Low">Low (48h SLA)</option>
                    <option value="Medium">Medium (24h SLA)</option>
                    <option value="High">High (12h SLA)</option>
                    <option value="Critical">Critical (4h SLA)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Citizen Name *</label>
                  <input
                    required
                    value={srmCustomerName}
                    onChange={(e) => setSrmCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile</label>
                  <input
                    value={srmCustomerMobile}
                    onChange={(e) => setSrmCustomerMobile(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Beat No</label>
                  <input
                    value={srmBeatNo}
                    onChange={(e) => setSrmBeatNo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign To</label>
                  <input
                    value={srmAssignee}
                    onChange={(e) => setSrmAssignee(e.target.value)}
                    placeholder="Postman / SPM"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                <input
                  required
                  value={srmSubject}
                  onChange={(e) => setSrmSubject(e.target.value)}
                  placeholder="Summary of request"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Details</label>
                <textarea
                  rows={2}
                  value={srmDesc}
                  onChange={(e) => setSrmDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={!canManageSrm}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg cursor-pointer disabled:opacity-50"
              >
                Create SRM Ticket
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  SRM Queue, SLA Tracking &amp; Escalations
                </h2>
                <p className="text-xs text-slate-500">
                  Track open requests, escalate SLA breaches, and record verified resolution notes.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  exportCsvWithBom(
                    'india_post_srm_tickets',
                    ['Ticket No', 'Office', 'PIN', 'Beat', 'Citizen', 'Category', 'Priority', 'Status', 'SLA Hours', 'SLA Due'],
                    srmTickets.map((t) => [
                      t.ticketNo,
                      t.officeName,
                      t.pincode,
                      t.beatNo,
                      t.customerName,
                      t.category,
                      t.priority,
                      t.status,
                      t.slaHours,
                      t.slaDueAt,
                    ])
                  )
                }
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>

            {srmTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No SRM tickets logged yet. Use the form on the left to log a postal service request.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {srmTickets.map((t) => (
                  <div key={t.id} className="py-3.5 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-blue-700 mr-2">{t.ticketNo}</span>
                        <span className="font-bold text-slate-900">{t.subject}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className={t.priority === 'Critical' ? 'text-rose-700 font-bold' : 'text-slate-600'}>
                          {t.priority} · {t.slaHours}h SLA
                        </span>
                        <span className="font-semibold text-slate-900">{t.status}</span>
                      </div>
                    </div>
                    <div className="text-slate-600">
                      {t.officeName} (PIN {t.pincode}) · {t.beatNo} · Citizen: {t.customerName}{' '}
                      {t.customerMobile ? `(${t.customerMobile})` : ''} · Assigned: {t.assignedTo}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <select
                        disabled={!canManageSrm}
                        value={t.status}
                        onChange={(e) =>
                          xpeedoOpsService.updateSrmTicketStatus(
                            t.id,
                            { status: e.target.value as SrmTicketStatus },
                            userProfile?.name || 'India Post Admin',
                            role
                          )
                        }
                        className="px-2.5 py-1 border border-slate-200 rounded bg-white font-semibold"
                      >
                        <option value="Open">Open</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Escalated">Escalated</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                      {t.status !== 'Escalated' && t.status !== 'Resolved' && t.status !== 'Closed' && (
                        <button
                          type="button"
                          onClick={() =>
                            xpeedoOpsService.updateSrmTicketStatus(
                              t.id,
                              {
                                status: 'Escalated',
                                escalatedTo: 'Divisional Head — Kota Division',
                                note: 'Escalated for priority SLA intervention',
                              },
                              userProfile?.name || 'India Post Admin',
                              role
                            )
                          }
                          className="px-2.5 py-1 rounded border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold cursor-pointer"
                        >
                          Escalate SLA
                        </button>
                      )}
                      {t.status !== 'Resolved' && t.status !== 'Closed' && (
                        <button
                          type="button"
                          onClick={() =>
                            xpeedoOpsService.updateSrmTicketStatus(
                              t.id,
                              {
                                status: 'Resolved',
                                resolutionNotes: 'Verified and closed via Kota Division SRM Desk',
                              },
                              userProfile?.name || 'India Post Admin',
                              role
                            )
                          }
                          className="px-2.5 py-1 rounded border border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PROPERTY & GEO CONSOLIDATED */}
      {activeTab === 'GEO_PROPERTY' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2 text-xs">
            {[
              { key: 'SUMMARY', label: '10-Level Geo Summary & Filters' },
              { key: 'FAMILY_HUB', label: 'Unified Property & Family Hub' },
              { key: 'LOCATION_INTEL', label: '11-Level Geo Hub & Privacy Map' },
              { key: 'DUPLICATES', label: `Duplicate & Data Quality (${duplicateProperties.length})` },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setGeoSubMode(item.key as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                  geoSubMode === item.key
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {geoSubMode === 'SUMMARY' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    10-Level Geographic Hierarchy: State → District → Division → Postal Office → PIN → Locality → Colony → Street → Property → Address
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Active Filters: Rajasthan → Kota → Kota Division · {filteredProperties.length} matching properties ·{' '}
                    {duplicateProperties.length} duplicate-address alerts
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <select
                    value={selectedPincode}
                    onChange={(e) => setSelectedPincode(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white font-mono"
                  >
                    <option value="ALL">All PIN Codes ({uniquePincodes.length})</option>
                    {uniquePincodes.map((pin) => (
                      <option key={pin} value={pin}>
                        PIN {pin}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedColony}
                    onChange={(e) => setSelectedColony(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="ALL">All Colonies ({uniqueColonies.length})</option>
                    {uniqueColonies.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {duplicateProperties.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-700 shrink-0" />
                    <span>
                      Detected <strong>{duplicateProperties.length}</strong> properties sharing identical
                      House No + Colony + PIN combinations.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeoSubMode('DUPLICATES')}
                    className="font-semibold underline shrink-0 cursor-pointer"
                  >
                    Inspect Conflicts
                  </button>
                </div>
              )}

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-3">House / Property</th>
                        <th className="py-2.5 px-3">Colony / Locality</th>
                        <th className="py-2.5 px-3">PIN Code</th>
                        <th className="py-2.5 px-3">Beat</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Geo Pin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProperties.slice(0, 40).map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {p.houseNo || p.propertyCode || p.id}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">
                            {p.colony || p.area || '—'} {p.sector ? `· ${p.sector}` : ''}
                          </td>
                          <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700">{p.pincode}</td>
                          <td className="py-2.5 px-3 text-slate-700">{p.beatNo || 'Unassigned'}</td>
                          <td className="py-2.5 px-3 text-slate-600">{p.status}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">
                            {p.latitude && p.longitude ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700">
                                <MapPin size={12} /> {p.latitude.toFixed(3)}, {p.longitude.toFixed(3)}
                              </span>
                            ) : (
                              'Pending GPS'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {geoSubMode === 'FAMILY_HUB' && (
            <Suspense fallback={<ModuleFallback />}>
              <UnifiedPropertyFamilyHub indiaPostOwnerAccess={indiaPostOwnerAccess} />
            </Suspense>
          )}

          {geoSubMode === 'LOCATION_INTEL' && (
            <Suspense fallback={<ModuleFallback />}>
              <LocationIntelligenceHub indiaPostOwnerAccess={indiaPostOwnerAccess} />
            </Suspense>
          )}

          {geoSubMode === 'DUPLICATES' && (
            <Suspense fallback={<ModuleFallback />}>
              <DataQualityView />
            </Suspense>
          )}
        </div>
      )}

      {/* TAB 5: CRM & PRODUCT MASTER */}
      {activeTab === 'CRM_PRODUCTS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  India Post Scheme &amp; Service Catalog ({POSTAL_PRODUCTS.length})
                </h2>
                <Link to="/services" className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
                  <span>Full Page</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto custom-scrollbar text-xs">
                {POSTAL_PRODUCTS.map((prod) => (
                  <div key={prod.id} className="py-2.5">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{prod.name}</span>
                      <span className="font-mono text-blue-700">{prod.code}</span>
                    </div>
                    <div className="text-slate-500">
                      {prod.category} · {prod.interestRateOrBonus}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  India Post Leads Pipeline ({postalLeads.length})
                </h2>
                <Link to="/leads" className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
                  <span>Manage Leads</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto custom-scrollbar text-xs">
                {postalLeads.slice(0, 25).map((l) => (
                  <div key={l.id} className="py-2.5 flex justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900">
                        {l.customerName} · {l.productName}
                      </div>
                      <div className="text-slate-500">
                        {l.beatNo || 'Unassigned Beat'} · {l.assignedStaffName || 'Pool'}
                      </div>
                    </div>
                    <span className="font-semibold text-blue-700 shrink-0">{l.stage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Suspense fallback={<ModuleFallback />}>
            <ServicesCatalogView />
          </Suspense>
        </div>
      )}

      {/* TAB: STATUTORY DOCS, ACG-61 & ARTICLES */}
      {activeTab === 'STATUTORY_DOCS' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDocsSubMode('DOCS_HUB')}
              className={`px-3 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                docsSubMode === 'DOCS_HUB'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText size={13} />
              <span>Fuel, BYOD &amp; Statutory Bills Hub</span>
            </button>
            <button
              type="button"
              onClick={() => setDocsSubMode('ACG61')}
              className={`px-3 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                docsSubMode === 'ACG61'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck size={13} />
              <span>ACG-61 Charge Report Generator</span>
            </button>
            <button
              type="button"
              onClick={() => setDocsSubMode('ARTICLES')}
              className={`px-3 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                docsSubMode === 'ARTICLES'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ClipboardCheck size={13} />
              <span>Postman Daily Articles Ledger</span>
            </button>
          </div>
          <Suspense fallback={<ModuleFallback />}>
            {docsSubMode === 'DOCS_HUB' && <OfficialStaffDocumentsHub />}
            {docsSubMode === 'ACG61' && (
              <Acg61ChargeReportView indiaPostOwnerAccess={indiaPostOwnerAccess} />
            )}
            {docsSubMode === 'ARTICLES' && <PostmanAllDayArticlesOverview embedded />}
          </Suspense>
        </div>
      )}

      {/* TAB: DAILY OPS & DOORSTEP VERIFICATION */}
      {activeTab === 'DAILY_OPS' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setOpsSubMode('VERIFICATION')}
              className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                opsSubMode === 'VERIFICATION'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Daily Field Verification
            </button>
            <button
              type="button"
              onClick={() => setOpsSubMode('SURVEY')}
              className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                opsSubMode === 'SURVEY'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Doorstep Survey Workflow
            </button>
            <button
              type="button"
              onClick={() => setOpsSubMode('ADDRESS')}
              className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                opsSubMode === 'ADDRESS'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Address Resolution
            </button>
          </div>
          <Suspense fallback={<ModuleFallback />}>
            {opsSubMode === 'VERIFICATION' && <DailyVerificationView />}
            {opsSubMode === 'SURVEY' && <DoorstepSurveyWorkflowView />}
            {opsSubMode === 'ADDRESS' && <AddressResolutionView />}
          </Suspense>
        </div>
      )}

      {/* TAB: POSTAL LMS & STOREFRONT */}
      {activeTab === 'LMS_STOREFRONT' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setLmsSubMode('LMS')}
              className={`px-3 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                lmsSubMode === 'LMS'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BookOpen size={13} />
              <span>Departmental LMS (GDS / MTS / Postman / PA)</span>
            </button>
            <button
              type="button"
              onClick={() => setLmsSubMode('STOREFRONT')}
              className={`px-3 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                lmsSubMode === 'STOREFRONT'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Store size={13} />
              <span>India Post Digital Storefront</span>
            </button>
          </div>
          <Suspense fallback={<ModuleFallback />}>
            {lmsSubMode === 'LMS' && <PostalLMSView />}
            {lmsSubMode === 'STOREFRONT' && <IndiaPostStorefrontView />}
          </Suspense>
        </div>
      )}

      {/* TAB: STAFF & ATTENDANCE */}
      {activeTab === 'STAFF_ATTENDANCE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users size={16} className="text-blue-600" />
              <span>Log Postal Attendance / Leave</span>
            </h2>
            <form onSubmit={handleLogAttendance} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Staff Member</label>
                <select
                  value={attEmpId || postalStaff[0]?.id || ''}
                  onChange={(e) => setAttEmpId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {postalStaff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.employeeId || s.id}) — {s.beat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={attDate}
                    onChange={(e) => setAttDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={attStatus}
                    onChange={(e) => setAttStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Field Duty">Field Duty</option>
                    <option value="Present">Present (Office)</option>
                    <option value="Half Day">Half Day</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks</label>
                <input
                  value={attRemarks}
                  onChange={(e) => setAttRemarks(e.target.value)}
                  placeholder="Optional leave / duty note"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg cursor-pointer"
              >
                Save Attendance Record
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              Recorded Attendance &amp; Leave Logs ({attendanceLogs.length})
            </h2>
            {attendanceLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No attendance entries logged yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {attendanceLogs.map((a) => (
                  <div key={a.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{a.employeeName}</span>{' '}
                      <span className="text-slate-500">
                        · {a.officeName} ({a.beatNo})
                      </span>
                      {a.remarks && <div className="text-slate-500">{a.remarks}</div>}
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-semibold text-blue-700">{a.status}</div>
                      <div className="text-[11px] text-slate-400 tabular-nums">{a.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: REPORTING & UTF-8 BOM EXPORTS */}
      {activeTab === 'REPORTS' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Department of Post Operational Exports (UTF-8 BOM)</h2>
            <p className="text-xs text-slate-500">
              Cleanly isolated postal datasets ready for Excel or departmental review.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <button
              type="button"
              onClick={() =>
                exportCsvWithBom(
                  'kota_division_offices_master',
                  ['Office ID', 'Office Name', 'Type', 'PIN Code', 'Division', 'Mapped Beats'],
                  offices.map((o) => [
                    o.officeId || o.id,
                    o.officeName,
                    o.officeType,
                    o.pincode,
                    o.division,
                    (o.mappedBeats || []).join(' | '),
                  ])
                )
              }
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 text-left space-y-1 cursor-pointer"
            >
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Download size={14} className="text-blue-600" />
                <span>Offices Master CSV</span>
              </div>
              <div className="text-slate-500 tabular-nums">{offices.length} deduplicated offices</div>
            </button>

            <button
              type="button"
              onClick={() =>
                exportCsvWithBom(
                  'kota_division_postal_staff',
                  ['Employee ID', 'Name', 'Designation', 'Office', 'Beat', 'Status'],
                  postalStaff.map((s) => [
                    s.employeeId || s.id,
                    s.name,
                    s.designationType || s.role,
                    s.assignedOffice,
                    s.beat,
                    s.status,
                  ])
                )
              }
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 text-left space-y-1 cursor-pointer"
            >
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Download size={14} className="text-blue-600" />
                <span>Postal Staff Roster CSV</span>
              </div>
              <div className="text-slate-500 tabular-nums">{postalStaff.length} staff profiles</div>
            </button>

            <button
              type="button"
              onClick={() =>
                exportCsvWithBom(
                  'kota_division_beats_matrix',
                  ['Beat', 'Office', 'PIN Code', 'Colonies', 'Assigned Staff', 'Contact'],
                  CONSOLIDATED_BEAT_MATRIX.map((b) => [
                    b.beatNumber,
                    b.officeName,
                    b.pincode,
                    b.coloniesFormatted,
                    b.assignedPostmanName,
                    b.assignedPostmanContact,
                  ])
                )
              }
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 text-left space-y-1 cursor-pointer"
            >
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Download size={14} className="text-blue-600" />
                <span>Delivery Beats CSV</span>
              </div>
              <div className="text-slate-500 tabular-nums">{CONSOLIDATED_BEAT_MATRIX.length} beats</div>
            </button>
          </div>
        </div>
      )}
      {!indiaPostOwnerAccess && (
        <DashboardQuickActionsFab onActionCompleted={() => setTick((t) => t + 1)} />
      )}
    </div>
  );
}
