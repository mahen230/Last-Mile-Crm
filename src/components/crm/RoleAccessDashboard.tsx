import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Users,
  Building,
  MapPin,
  Layers,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Filter,
  RefreshCw,
  Compass,
  Check,
  UserCheck,
  Briefcase,
  Sliders,
  Eye,
  PhoneCall,
  Calendar,
  FileText,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Store,
  RotateCcw,
} from 'lucide-react';
import { staffPermissionService } from '../../services/staffPermissionService';
import {
  featureVisibilityService,
  FEATURE_CATALOG,
  VENDOR_SYSTEM_DEFINITIONS,
} from '../../services/featureVisibilityService';
import {
  StaffProfile,
  DynamicOfficeRecord,
  FeatureVisibilityKey,
  VendorSystemId,
  DEFAULT_POSTMAN_GDS_VISIBLE_FEATURES,
} from '../../types/models';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { Link, useLocation } from 'react-router-dom';
import {
  GranularPermissionMatrixPanel,
  OrgHierarchyAndAuditPanel,
} from './MasterControlGranularTab';

interface FollowUpRecord {
  id: string;
  targetName: string;
  targetType: 'Lead' | 'Staff' | 'Vendor' | 'Member';
  assignedTo: string;
  district: string;
  block: string;
  officeName: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
  notes: string;
  createdAt: string;
}

export default function RoleAccessDashboard() {
  const { userProfile } = useAuth();
  const location = useLocation();
  const isSuperAdmin = staffPermissionService.isSuperAdmin(userProfile);

  const initialTabFromNav = (location.state as { initialTab?: string } | null)?.initialTab;
  // Active view tab
  const [activeTab, setActiveTab] = useState<
    'MATRIX' | 'HIERARCHY' | 'FOLLOW_UPS' | 'SIMULATOR' | 'VISIBILITY' | 'GRANULAR_PERMS' | 'ORG_HIERARCHY'
  >(initialTabFromNav === 'VISIBILITY' && isSuperAdmin ? 'VISIBILITY' : 'MATRIX');

  // Dynamic Visibility & Vendor Isolation state
  const [, setVisibilityTick] = useState(0);
  const [selectedVisibilityRole, setSelectedVisibilityRole] = useState<string>('POSTMAN');
  const [selectedVendorSystemId, setSelectedVendorSystemId] = useState<VendorSystemId>('INDIA_POST');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [selectedTargetUserKey, setSelectedTargetUserKey] = useState<string>('');

  // Simulated Role for Preview Simulator
  const [simulatedRole, setSimulatedRole] = useState<string>('MASTER_ADMIN');

  // Territory Cascading Filters
  const [selectedCircle, setSelectedCircle] = useState<string>('Rajasthan Circle');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');
  const [selectedOfficeFilter, setSelectedOfficeFilter] = useState<string>('ALL');
  const [selectedPincode, setSelectedPincode] = useState<string>('');

  // Follow-Up state
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>([
    {
      id: 'FU-101',
      targetName: 'Mandi Agro Traders (Baran)',
      targetType: 'Vendor',
      assignedTo: 'Mahendra Kumar Meena (Owner)',
      district: 'Baran',
      block: 'Anta Block',
      officeName: 'Baran H.O. (325205)',
      status: 'Pending',
      dueDate: new Date().toISOString().split('T')[0],
      notes: 'Verify Speed Post COD fulfillment and EV hub onboarding.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'FU-102',
      targetName: 'Keshavpura Sector 7 GDS Beat',
      targetType: 'Staff',
      assignedTo: 'Ekta Meena (Master Admin)',
      district: 'Kota',
      block: 'Kota West Block',
      officeName: 'Dadabari S.O. (324009)',
      status: 'In Progress',
      dueDate: new Date().toISOString().split('T')[0],
      notes: 'Audit daily article dispatch and ACG-61 fuel bill logs.',
      createdAt: new Date().toISOString(),
    },
  ]);

  const [showAddFollowUpModal, setShowAddFollowUpModal] = useState(false);
  const [fuTargetName, setFuTargetName] = useState('');
  const [fuTargetType, setFuTargetType] = useState<'Lead' | 'Staff' | 'Vendor' | 'Member'>('Lead');
  const [fuDistrict, setFuDistrict] = useState('Kota');
  const [fuBlock, setFuBlock] = useState('Kota West Block');
  const [fuOffice, setFuOffice] = useState('Dadabari S.O.');
  const [fuDueDate, setFuDueDate] = useState('');
  const [fuNotes, setFuNotes] = useState('');
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const [offices, setOffices] = useState<DynamicOfficeRecord[]>([]);
  const [staffProfiles, setStaffProfiles] = useState<StaffProfile[]>([]);

  const refreshData = () => {
    setOffices([...staffPermissionService.getDynamicOffices()]);
    setStaffProfiles([...staffPermissionService.getAllStaffProfiles()]);
  };

  useEffect(() => {
    refreshData();
    const unsub = staffPermissionService.subscribe(refreshData);
    const unsubVis = featureVisibilityService.subscribe(() => {
      setVisibilityTick((t) => t + 1);
    });
    return () => {
      unsub();
      unsubVis();
    };
  }, []);

  useEffect(() => {
    const requestedTab = (location.state as { initialTab?: string } | null)?.initialTab;
    if (requestedTab === 'VISIBILITY' && isSuperAdmin) {
      setActiveTab('VISIBILITY');
    }
  }, [location.state, isSuperAdmin]);

  useEffect(() => {
    if (!selectedTargetUserKey && staffProfiles.length > 0) {
      const firstNonSuper =
        staffProfiles.find((s) => !featureVisibilityService.isPlatformSuperUser(s)) || staffProfiles[0];
      setSelectedTargetUserKey(firstNonSuper.email);
    }
  }, [staffProfiles, selectedTargetUserKey]);

  // Effective Role definition for permission checking
  const effectiveRole = useMemo(() => {
    if (isSuperAdmin) return simulatedRole;
    return userProfile?.role || 'SALES_FIELD_STAFF';
  }, [isSuperAdmin, simulatedRole, userProfile]);

  // Role Definitions & Matrix Data
  const roleMatrix = [
    {
      roleKey: 'OWNER / MASTER_ADMIN',
      title: 'Owner & Master Admin (Mahendra Kumar Meena & Ekta Meena)',
      scope: 'Global / Pan-India / Rajasthan Circle',
      viewScope: 'All Circles, Divisions, Districts, Blocks, Offices, Pincodes, Staff, Leads & Vendors',
      permissions: 'Full Global CRUD, Instant Verification, User Approvals, Role Assignment, Archive & Audit',
      badgeColor: 'bg-amber-400 text-slate-950 font-black',
    },
    {
      roleKey: 'CIRCLE_INCHARGE',
      title: 'Circle Incharge',
      scope: 'Postal Circle Wide',
      viewScope: 'All Divisions, Districts & Offices across Rajasthan Circle',
      permissions: 'View, Division Oversight, Circle Reports, Verification & Team Escalations',
      badgeColor: 'bg-red-700 text-white font-bold',
    },
    {
      roleKey: 'DIVISION_INCHARGE',
      title: 'Division Incharge (Divisional Superintendent / Inspector)',
      scope: 'Divisional Headquarters & Sub-Offices',
      viewScope: 'All Districts, Sub-Offices, and Postmen within assigned Division',
      permissions: 'Division Roster Management, Audit, Fuel Bill Approvals & Beat Performance',
      badgeColor: 'bg-indigo-700 text-white font-bold',
    },
    {
      roleKey: 'DISTRICT_INCHARGE',
      title: 'District Incharge',
      scope: 'District Boundary',
      viewScope: 'Assigned District, Sub-Offices, Blocks, Team Members, Leads & Vendors',
      permissions: 'District Team Management, Follow-Up Assignment, Regional Sales & Onboarding',
      badgeColor: 'bg-blue-700 text-white font-bold',
    },
    {
      roleKey: 'DISTRICT_MANAGER',
      title: 'District Manager (DM)',
      scope: 'District Operations & Logistics',
      viewScope: 'District Offices, EV Hubs, Logistics Franchises, Riders & Vendors',
      permissions: 'Operational Oversight, Pincode-wise Office Management, Rider Audits & Compliance',
      badgeColor: 'bg-emerald-700 text-white font-bold',
    },
    {
      roleKey: 'CATEGORY_MANAGER',
      title: 'Category Manager (Multi-Business Vertical Head)',
      scope: 'Business Service Categories & Partner Lines',
      viewScope: 'Assigned Categories (EV Mobility, Software/AI SaaS, Logistics, Solar, Retail), Linked Hubs & Catalogs',
      permissions: 'Manage House & Partner Product Catalogs, Stock/Listing Status & Category Office Sections',
      badgeColor: 'bg-indigo-700 text-white font-bold',
    },
    {
      roleKey: 'DISTRICT_OFFICE_STAFF',
      title: 'District Office Staff',
      scope: 'District Back-Office',
      viewScope: 'District Records, Member Profiles, Article Dispatch & Verification Queues',
      permissions: 'Administrative Reporting, Data Entry, Verification & Customer Support',
      badgeColor: 'bg-slate-700 text-white font-bold',
    },
    {
      roleKey: 'BLOCK_INCHARGE',
      title: 'Block Incharge / Manager',
      scope: 'Block Territory',
      viewScope: 'Assigned Block, Pincodes, Local Offices, Team Members & Field Leads',
      permissions: 'Block Follow-Up Tracking, Local Team Task Assignment & Vendor Support',
      badgeColor: 'bg-purple-700 text-white font-bold',
    },
    {
      roleKey: 'OFFICE_INCHARGE',
      title: 'Office Incharge / Pincode Incharge (SPM / BPM)',
      scope: 'Specific Post Office / Pincode',
      viewScope: 'Assigned SO/BO/HO, Postmen, GDS, Local Citizens & Beat Deliveries',
      permissions: 'Daily Article Logs, DSS Reconciliation, Local Follow-Ups & ACG-61 Fuel Vouchers',
      badgeColor: 'bg-rose-700 text-white font-bold',
    },
    {
      roleKey: 'SALES_FIELD_STAFF',
      title: 'Sales & Field Staff (Postman, GDS, MTS, Riders, Executives)',
      scope: 'Territory Beat / Office / Pincode',
      viewScope: 'Assigned Beat Colonies, Assigned Customers, Doorstep Visits & Personal Leads',
      permissions: 'Lead Creation, Doorstep Form Submissions, Personal Follow-Ups & Storefront Orders',
      badgeColor: 'bg-slate-950 text-amber-300 font-bold',
    },
    {
      roleKey: 'CATEGORY_AGENT / B2B_PARTNER',
      title: 'Non-Territory B2B Partner / Business Category Agent',
      scope: 'Business Corresponding Categories ONLY (No Beat / Territory Lock)',
      viewScope: 'STRICTLY own created or assigned entries within assigned Business Categories',
      permissions: 'Create & Manage Own Category Leads, Customers, Properties & Verification Inquiries',
      badgeColor: 'bg-teal-700 text-white font-bold',
    },
  ];

  // Filtered offices based on cascading territory selectors
  const scopedOffices = useMemo(() => {
    return offices.filter((o) => {
      if (selectedDivision !== 'ALL' && o.division !== selectedDivision) return false;
      if (selectedDistrict !== 'ALL' && (o.district || '').toLowerCase() !== selectedDistrict.toLowerCase()) return false;
      if (selectedOfficeFilter !== 'ALL' && o.id !== selectedOfficeFilter && o.officeName !== selectedOfficeFilter) return false;
      if (selectedPincode.trim() && !o.pincode.includes(selectedPincode.trim())) return false;
      return true;
    });
  }, [offices, selectedDivision, selectedDistrict, selectedOfficeFilter, selectedPincode]);

  // Filtered staff based on effective role scope
  const scopedStaff = useMemo(() => {
    return staffProfiles.filter((s) => {
      if (isSuperAdmin && effectiveRole === 'MASTER_ADMIN') return true;
      if (effectiveRole === 'CIRCLE_INCHARGE') return true;
      if (effectiveRole === 'DIVISION_INCHARGE') {
        return (s.division || '').toLowerCase().includes('kota') || s.division === userProfile?.division;
      }
      if (effectiveRole === 'CATEGORY_MANAGER') {
        return (
          (s.role || '').toUpperCase() === 'CATEGORY_MANAGER' ||
          Boolean(s.assignedCategories && s.assignedCategories.length > 0) ||
          s.id === userProfile?.id
        );
      }
      if (effectiveRole === 'DISTRICT_INCHARGE' || effectiveRole === 'DISTRICT_MANAGER' || effectiveRole === 'DISTRICT_OFFICE_STAFF') {
        return (s.officePincode || '').startsWith('324') || s.subOffice === userProfile?.subOffice;
      }
      if (effectiveRole === 'BLOCK_INCHARGE' || effectiveRole === 'OFFICE_INCHARGE') {
        return s.subOffice === userProfile?.subOffice || s.officePincode === userProfile?.officePincode;
      }
      // Sales / Field Staff scoped to own record or beat
      return s.id === userProfile?.id || s.beat === userProfile?.beat;
    });
  }, [staffProfiles, isSuperAdmin, effectiveRole, userProfile]);

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuTargetName.trim()) return;

    const newFu: FollowUpRecord = {
      id: `FU-${Date.now().toString().slice(-5)}`,
      targetName: fuTargetName.trim(),
      targetType: fuTargetType,
      assignedTo: userProfile?.name || 'Authorized Staff',
      district: fuDistrict,
      block: fuBlock,
      officeName: fuOffice,
      status: 'Pending',
      dueDate: fuDueDate || new Date().toISOString().split('T')[0],
      notes: fuNotes.trim() || 'New scheduled follow-up entry.',
      createdAt: new Date().toISOString(),
    };

    setFollowUps([newFu, ...followUps]);
    setBannerMessage(`Successfully scheduled follow-up for "${newFu.targetName}" under ${newFu.district} District!`);
    setShowAddFollowUpModal(false);
    setFuTargetName('');
    setFuNotes('');
    setTimeout(() => setBannerMessage(null), 5000);
  };

  return (
    <div className="space-y-6" id="role-access-dashboard-root">
      {/* Header Banner */}
      <div className="bg-[#0A1628] text-white p-6 rounded-xl shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-orange-400 mb-1">
              KOTA DIVISION OS · MASTER ADMIN CONTROL CENTER
            </div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
              <Shield size={24} className="text-[#1D4ED8]" />
              <span>Role Access, Granular RBAC &amp; Hierarchy Console</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Manage Circle &rarr; Region &rarr; Division &rarr; Subdivision &rarr; HPO &rarr; SO &rarr; BO org hierarchy, Official Posts, 13-action granular permission matrix, visibility toggles, and immutable audit trails.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAddFollowUpModal(true)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md cursor-pointer"
            >
              <Plus size={15} />
              <span>+ Schedule Follow-Up</span>
            </button>
            <Link
              to="/office-master"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Building size={15} className="text-amber-400" />
              <span>Office Master</span>
            </Link>
          </div>
        </div>

        {bannerMessage && (
          <div className="mt-4 p-3 bg-emerald-900/80 border border-emerald-500/50 text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{bannerMessage}</span>
          </div>
        )}

        {/* Master Admin Simulation Bar (Only visible to Super Admins / Owner) */}
        {isSuperAdmin && (
          <div className="mt-5 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-amber-300">Master Admin Preview Simulator:</span>
                <p className="text-[11px] text-slate-300">Test data scoping and follow-up permissions across different tiers.</p>
              </div>
            </div>
            <select
              value={simulatedRole}
              onChange={(e) => setSimulatedRole(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-amber-400/50 rounded-xl font-bold text-amber-300 text-xs focus:outline-none"
            >
              <option value="MASTER_ADMIN">👑 Master Admin / Owner (Global Access)</option>
              <option value="CIRCLE_INCHARGE">📮 Circle Incharge (Rajasthan Circle)</option>
              <option value="DIVISION_INCHARGE">🏛️ Division Incharge (Kota Division)</option>
              <option value="DISTRICT_INCHARGE">📍 District Incharge (Kota District)</option>
              <option value="DISTRICT_MANAGER">🚚 District Manager (Operations & Riders)</option>
              <option value="CATEGORY_MANAGER">🏷️ Category Manager (Business Verticals & Catalogs)</option>
              <option value="DISTRICT_OFFICE_STAFF">📋 District Office Staff</option>
              <option value="BLOCK_INCHARGE">🏘️ Block Incharge (West Block)</option>
              <option value="OFFICE_INCHARGE">📮 Office Incharge (Dadabari SO)</option>
              <option value="SALES_FIELD_STAFF">🛵 Territory Field Staff (Postman / GDS)</option>
              <option value="CATEGORY_AGENT">🤝 Non-Territory B2B Agent (Category Scoped)</option>
            </select>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-white/10">
          {[
            { id: 'MATRIX', label: '1. Live Role Matrix & Inspector', icon: Shield },
            { id: 'HIERARCHY', label: '2. Territory & Team Hierarchy', icon: Layers },
            { id: 'FOLLOW_UPS', label: '3. Hierarchical Follow-Up Console', icon: Calendar },
            { id: 'SIMULATOR', label: '4. Active Role Scoping Inspector', icon: Eye },
            ...(isSuperAdmin
              ? [
                  { id: 'VISIBILITY', label: '5. Visibility & Vendor Isolation', icon: Sliders },
                  { id: 'GRANULAR_PERMS', label: '6. Official Posts & 13-Action Matrix', icon: Shield },
                  { id: 'ORG_HIERARCHY', label: '7. Org Hierarchy, Clusters & Audit', icon: Layers },
                ]
              : []),
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#1D4ED8] text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: LIVE ROLE MATRIX & PERMISSION INSPECTOR           */}
      {/* ======================================================== */}
      {activeTab === 'MATRIX' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Pan-India Multi-Tier Role Matrix & Permission Inspector</h3>
              <p className="text-xs text-slate-500">Structured role definitions across geographical and administrative hierarchies.</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-xl border border-slate-200 font-mono">
              Total Defined Roles: {roleMatrix.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-black uppercase tracking-wider border-b border-slate-200 text-[11px]">
                  <th className="py-3 px-4">Role Designation</th>
                  <th className="py-3 px-4">Territory Scope</th>
                  <th className="py-3 px-4">Information Visibility Scope</th>
                  <th className="py-3 px-4">Operational Permissions & CRUD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roleMatrix.map((r) => (
                  <tr key={r.roleKey} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${r.badgeColor}`}>
                          {r.roleKey}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-600 mt-1">{r.title}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{r.scope}</td>
                    <td className="py-3.5 px-4 text-slate-600">{r.viewScope}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{r.permissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: TERRITORY & TEAM HIERARCHY                        */}
      {/* ======================================================== */}
      {activeTab === 'HIERARCHY' && (
        <div className="space-y-6">
          {/* Territory Filtering Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Compass size={18} className="text-red-700" />
              <span>Cascading Territory Filters (Circle → Division → District → Block → Office)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">1. Circle</label>
                <select
                  value={selectedCircle}
                  onChange={(e) => setSelectedCircle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="Rajasthan Circle">Rajasthan Postal Circle</option>
                  <option value="Pan-India All Circles">Pan-India (All Circles)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">2. Division</label>
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="ALL">All Divisions ({offices.length} Offices)</option>
                  <option value="Kota Division">Kota Division</option>
                  <option value="Baran Division">Baran Division</option>
                  <option value="Bundi Division">Bundi Division</option>
                  <option value="Jhalawar Division">Jhalawar Division</option>
                  <option value="Tonk Division">Tonk Division</option>
                  <option value="Jaipur Division">Jaipur Division</option>
                  <option value="Jodhpur Division">Jodhpur Division</option>
                  <option value="Udaipur Division">Udaipur Division</option>
                  <option value="Ajmer Division">Ajmer Division</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">3. District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="ALL">All Districts</option>
                  <option value="Kota">Kota</option>
                  <option value="Baran">Baran</option>
                  <option value="Bundi">Bundi</option>
                  <option value="Jhalawar">Jhalawar</option>
                  <option value="Tonk">Tonk</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Jodhpur">Jodhpur</option>
                  <option value="Udaipur">Udaipur</option>
                  <option value="Ajmer">Ajmer</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">4. Block / Sub-Division</label>
                <select
                  value={selectedBlock}
                  onChange={(e) => setSelectedBlock(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="ALL">All Blocks / Sub-Divisions</option>
                  <option value="Kota West Block">Kota West Block</option>
                  <option value="Kota City Block">Kota City Block</option>
                  <option value="Anta Block">Anta Block</option>
                  <option value="Nainwa Block">Nainwa Block</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">5. Pincode / Office</label>
                <input
                  type="text"
                  placeholder="e.g. 324009 or 325205"
                  value={selectedPincode}
                  onChange={(e) => setSelectedPincode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Scoped Offices & Team Roster */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scoped Offices */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Building size={15} className="text-red-700" />
                  <span>Scoped Offices & Business Hubs ({scopedOffices.length})</span>
                </h4>
                <Link to="/office-master" className="text-xs font-bold text-red-700 hover:underline">
                  Manage Office Master →
                </Link>
              </div>
              <div className="divide-y divide-slate-100 overflow-y-auto max-h-96">
                {scopedOffices.map((o) => (
                  <div key={o.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{o.officeName}</span>
                        <span className="px-2 py-0.2 bg-amber-100 text-amber-900 rounded font-mono text-[10px] font-black">
                          PIN {o.pincode}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {o.division} • {o.district || 'Rajasthan'} • Type: {o.officeType}
                      </div>
                    </div>
                    <span className="font-mono text-xs text-blue-700 font-bold">{o.staffCount} Staff</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scoped Staff & Team Tree */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Users size={15} className="text-blue-700" />
                  <span>Scoped Team Tree & Staff Roster ({scopedStaff.length})</span>
                </h4>
                <Link to="/staff-master" className="text-xs font-bold text-blue-700 hover:underline">
                  Manage Staff Master →
                </Link>
              </div>
              <div className="divide-y divide-slate-100 overflow-y-auto max-h-96">
                {scopedStaff.map((s) => (
                  <div key={s.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{s.name}</span>
                        <span className="px-2 py-0.2 bg-blue-100 text-blue-900 rounded font-bold text-[10px]">
                          {s.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {s.designationType} • ID: {s.employeeId} • Beat: {s.beat}
                      </div>
                    </div>
                    <span className="font-mono text-xs text-slate-700 font-semibold">{s.contact}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: HIERARCHICAL FOLLOW-UP CONSOLE                    */}
      {/* ======================================================== */}
      {activeTab === 'FOLLOW_UPS' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Hierarchical Follow-Up & Ownership Engine</h3>
              <p className="text-xs text-slate-500">Track and assign follow-ups across District, Block, Office, and Field levels.</p>
            </div>
            <button
              onClick={() => setShowAddFollowUpModal(true)}
              className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Plus size={15} />
              <span>+ Schedule New Follow-Up</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {followUps.map((fu) => (
              <div key={fu.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900">
                      {fu.targetType}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        fu.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : fu.status === 'In Progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {fu.status}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-sm">{fu.targetName}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{fu.notes}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                  <div>📍 <strong>Territory:</strong> {fu.district} District • {fu.block}</div>
                  <div>🏛️ <strong>Office:</strong> {fu.officeName}</div>
                  <div>👤 <strong>Assigned Owner:</strong> {fu.assignedTo}</div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-mono text-slate-700">Due: {fu.dueDate}</span>
                    <button
                      onClick={() => {
                        setFollowUps(
                          followUps.map((item) =>
                            item.id === fu.id
                              ? { ...item, status: item.status === 'Completed' ? 'Pending' : 'Completed' }
                              : item
                          )
                        );
                      }}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      {fu.status === 'Completed' ? 'Reopen' : 'Mark Complete ✓'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: ACTIVE ROLE SCOPING SIMULATOR                     */}
      {/* ======================================================== */}
      {activeTab === 'SIMULATOR' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-black text-slate-900">Active Role Scoping &amp; Permission Inspector</h3>
              <p className="text-xs text-slate-500">Testing data visibility and security boundaries for role: <strong className="text-red-700">{effectiveRole}</strong></p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-black">
              Simulator Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Territory / Category Mode</span>
              <div className="font-black text-slate-900 text-sm">
                {effectiveRole === 'CATEGORY_AGENT'
                  ? 'Non-Territory Business Category Scope (No Beat Lock)'
                  : effectiveRole === 'CIRCLE_INCHARGE'
                  ? 'Rajasthan Circle Wide'
                  : effectiveRole === 'CATEGORY_MANAGER'
                  ? 'Business Category & Product Line Scope'
                  : effectiveRole.includes('DISTRICT')
                  ? 'District & Regional Scope'
                  : effectiveRole.includes('BLOCK')
                  ? 'Block Territory Scope'
                  : 'Beat & Office Pincode Scope'}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Data Read Visibility</span>
              <div className="font-black text-emerald-700 text-sm">
                {effectiveRole === 'CATEGORY_AGENT'
                  ? 'Strictly Own Created / Assigned Category Entries Only'
                  : isSuperAdmin || effectiveRole === 'MASTER_ADMIN'
                  ? 'All Pan-India Records'
                  : 'Scoped to Tier Boundary'}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Hierarchy Blueprint &amp; Isolation</span>
              <div className="font-black text-blue-700 text-sm">
                India Post + Xpeedo Logistics Share Blueprint · 0% Cross-Brand Leak
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="font-black text-slate-900">
              Brand Embedded RBAC &amp; Non-Territory Agent Protocol
            </div>
            <p>
              Every white-label Brand Portal embeds this role matrix inside its Team &amp; Role Access tab so brand owners can configure role permissions and enable Non-Territory B2B Agents per category without cross-brand exposure.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: DYNAMIC VISIBILITY TOGGLES & VENDOR ISOLATION     */}
      {/* ======================================================== */}
      {activeTab === 'VISIBILITY' && isSuperAdmin && (() => {
        const performer = userProfile?.name || userProfile?.email || 'MASTER_ADMIN';
        const visState = featureVisibilityService.getState();
        const roleOptions = [
          { id: 'POSTMAN', label: 'Postman (Default: Property & Members Only)' },
          { id: 'GDS', label: 'GDS (Default: Property & Members Only)' },
          { id: 'POSTMASTER', label: 'Postmaster / SPM / BPM' },
          { id: 'OFFICE_INCHARGE', label: 'Office Incharge' },
          { id: 'BLOCK_INCHARGE', label: 'Block Incharge' },
          { id: 'DISTRICT_MANAGER', label: 'District Manager' },
          { id: 'DISTRICT_INCHARGE', label: 'District Incharge' },
          { id: 'CATEGORY_MANAGER', label: 'Category Manager' },
        ];
        const filteredUsersForScope = staffProfiles.filter((s) => {
          if (featureVisibilityService.isPlatformSuperUser(s)) return false;
          const q = userSearchQuery.trim().toLowerCase();
          if (!q) return true;
          return (
            s.name.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q) ||
            (s.employeeId || '').toLowerCase().includes(q) ||
            (s.role || '').toLowerCase().includes(q)
          );
        });
        const activeTargetStaff =
          staffProfiles.find((s) => s.email === selectedTargetUserKey) ||
          filteredUsersForScope[0] ||
          null;
        const activeTargetScope = activeTargetStaff
          ? featureVisibilityService.getUserVendorScope(activeTargetStaff)
          : {};
        const activeUserOverrides = activeTargetStaff
          ? featureVisibilityService.getUserOverrideMap(activeTargetStaff.email)
          : {};
        const selectedVendorDef = VENDOR_SYSTEM_DEFINITIONS[selectedVendorSystemId];

        return (
          <div className="space-y-6" id="dynamic-visibility-vendor-panel">
            {/* 1. Role Visibility Matrix */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Sliders size={18} className="text-red-700" />
                    <span>Dynamic Feature Visibility Toggles (What Is Visible Is What Shows)</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Postman &amp; GDS default strictly to <strong>Property</strong> and <strong>Members</strong> only. Toggle modules ON/OFF anytime—nothing is ever deleted.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={selectedVisibilityRole}
                    onChange={(e) => setSelectedVisibilityRole(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  >
                    {roleOptions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      featureVisibilityService.resetPostmanAndGdsToDefault(performer);
                      setBannerMessage(
                        'Reset POSTMAN & GDS visibility defaults strictly to Property & Members Only.'
                      );
                    }}
                    className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Postman &amp; GDS (Property + Members Only)</span>
                  </button>
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {FEATURE_CATALOG.map((feat) => {
                  const isEnabled = featureVisibilityService.isRoleFeatureEnabled(
                    selectedVisibilityRole,
                    feat.key
                  );
                  const isDefaultPostmanCore = DEFAULT_POSTMAN_GDS_VISIBLE_FEATURES.includes(feat.key);
                  return (
                    <div
                      key={feat.key}
                      className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 ${
                        isEnabled
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-slate-50 border-slate-200 opacity-85'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-xs text-slate-900">{feat.label}</span>
                          {isDefaultPostmanCore && (
                            <span className="text-[10px] font-mono font-bold text-emerald-700">
                              · Default Core
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 leading-snug">{feat.description}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {feat.category} · Group: {feat.vendorGroup}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          featureVisibilityService.setRoleFeatureVisibility(
                            selectedVisibilityRole,
                            feat.key as FeatureVisibilityKey,
                            !isEnabled,
                            performer
                          );
                          setBannerMessage(
                            `${feat.label} is now ${!isEnabled ? 'VISIBLE' : 'HIDDEN'} for ${selectedVisibilityRole}.`
                          );
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 cursor-pointer shrink-0 transition ${
                          isEnabled
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        }`}
                      >
                        {isEnabled ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                        <span>{isEnabled ? 'SHOW' : 'HIDE'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Vendor System Feature Matrix & Scoped Vendor Access */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Vendor System Module Control */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 bg-slate-900 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Store size={14} />
                      <span>Vendor System Consolidation</span>
                    </span>
                    {selectedVendorDef?.defaultWhiteLabel && (
                      <span className="text-[10px] font-mono font-bold text-emerald-300">
                        White-Label Enforced
                      </span>
                    )}
                  </div>
                  <select
                    value={selectedVendorSystemId}
                    onChange={(e) => setSelectedVendorSystemId(e.target.value as VendorSystemId)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white"
                  >
                    {Object.values(VENDOR_SYSTEM_DEFINITIONS).map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.id})
                      </option>
                    ))}
                  </select>
                  {selectedVendorDef && (
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {selectedVendorDef.description}
                    </p>
                  )}
                </div>

                <div className="p-4 divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
                  {FEATURE_CATALOG.map((feat) => {
                    const isExcludedByPolicy = Boolean(
                      selectedVendorDef?.excludedFeatures.includes(feat.key)
                    );
                    const isEnabled = featureVisibilityService.isVendorFeatureEnabled(
                      selectedVendorSystemId,
                      feat.key
                    );
                    return (
                      <div key={feat.key} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{feat.label}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {isExcludedByPolicy
                              ? 'Blocked under strict white-label vendor isolation'
                              : feat.category}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={isExcludedByPolicy}
                          onClick={() =>
                            featureVisibilityService.setVendorFeatureVisibility(
                              selectedVendorSystemId,
                              feat.key,
                              !isEnabled,
                              performer
                            )
                          }
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0 ${
                            isExcludedByPolicy
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : isEnabled
                              ? 'bg-emerald-600 text-white cursor-pointer'
                              : 'bg-slate-200 text-slate-700 cursor-pointer'
                          }`}
                        >
                          {isExcludedByPolicy ? 'LOCKED OFF' : isEnabled ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Scoped Vendor Access & Per-User Overrides */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        Scoped Vendor Access &amp; White-Label Assignment
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Grant strictly scoped vendor access (e.g., India Post Vendor System only) without exposing other vendors or admin controls.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        placeholder="Filter staff by name, email, role..."
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                    <select
                      value={activeTargetStaff?.email || ''}
                      onChange={(e) => setSelectedTargetUserKey(e.target.value)}
                      className="sm:w-64 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    >
                      {filteredUsersForScope.map((s) => (
                        <option key={s.id} value={s.email}>
                          {s.name} ({s.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {activeTargetStaff ? (
                  <div className="p-5 space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-black">{activeTargetStaff.name}</div>
                        <div className="text-[11px] text-slate-300 font-mono">
                          {activeTargetStaff.email} · Role: {activeTargetStaff.role} · {activeTargetStaff.subOffice || 'Kota Circle'}
                        </div>
                        <div className="text-[11px] text-amber-300 font-mono mt-1">
                          Active Scope: {activeTargetScope.assignedVendorId || 'UNRESTRICTED'} · White-Label:{' '}
                          {featureVisibilityService.isWhiteLabelPostalMode(activeTargetStaff) ? 'ON' : 'OFF'} · Strict Isolation:{' '}
                          {activeTargetScope.strictVendorIsolation ? 'ON' : 'OFF'}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            staffPermissionService.assignVendorAccess(
                              activeTargetStaff.email,
                              {
                                assignedVendorId: 'INDIA_POST',
                                allowedVendors: ['INDIA_POST'],
                                whiteLabelMode: true,
                                strictVendorIsolation: true,
                                customWhiteLabelName: 'India Post Vendor System',
                              },
                              performer
                            );
                            setBannerMessage(
                              `Granted strictly scoped white-label access to India Post Vendor System for ${activeTargetStaff.name}.`
                            );
                          }}
                          className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-[11px] font-black cursor-pointer"
                        >
                          Scope Strictly to India Post
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const nextState = !activeTargetStaff.isNonTerritoryAgent;
                            staffPermissionService.updateStaffPermission(
                              activeTargetStaff.email,
                              { canViewAllRecords: false },
                              {
                                isNonTerritoryAgent: nextState,
                                assignedCategories:
                                  activeTargetStaff.assignedCategories?.length
                                    ? activeTargetStaff.assignedCategories
                                    : ['PLI / RPLI', 'Business Corresponding'],
                              }
                            );
                            setBannerMessage(
                              `${activeTargetStaff.name} ${
                                nextState
                                  ? 'switched to Non-Territory B2B Category Agent (Beat lock bypassed; strictly own category records).'
                                  : 'restored to Territory Beat/Office scope.'
                              }`
                            );
                          }}
                          className={`px-3 py-2 rounded-xl text-[11px] font-black cursor-pointer ${
                            activeTargetStaff.isNonTerritoryAgent
                              ? 'bg-teal-500 text-slate-950'
                              : 'bg-teal-900/70 hover:bg-teal-800 text-teal-200 border border-teal-500/40'
                          }`}
                        >
                          {activeTargetStaff.isNonTerritoryAgent
                            ? 'Non-Territory Agent: ON'
                            : 'Enable Non-Territory B2B Mode'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            staffPermissionService.assignVendorAccess(
                              activeTargetStaff.email,
                              {
                                assignedVendorId: undefined,
                                allowedVendors: Object.keys(VENDOR_SYSTEM_DEFINITIONS),
                                whiteLabelMode: false,
                                strictVendorIsolation: false,
                                customWhiteLabelName: undefined,
                              },
                              performer
                            );
                            setBannerMessage(
                              `Restored multi-vendor platform access for ${activeTargetStaff.name}.`
                            );
                          }}
                          className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-[11px] font-bold cursor-pointer"
                        >
                          Clear Isolation
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-black text-slate-800 mb-2">
                        Per-User Granular Feature Overrides (Overrides Role Default)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                        {FEATURE_CATALOG.map((feat) => {
                          const overrideVal = activeUserOverrides[feat.key];
                          const effectiveVal = featureVisibilityService.isFeatureVisible(
                            activeTargetStaff,
                            feat.key
                          );
                          return (
                            <div
                              key={feat.key}
                              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2 text-[11px]"
                            >
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate">{feat.label}</div>
                                <div className="text-[10px] font-mono text-slate-500">
                                  Effective: {effectiveVal ? 'VISIBLE' : 'HIDDEN'}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {([
                                  { label: 'Role', val: null },
                                  { label: 'Show', val: true },
                                  { label: 'Hide', val: false },
                                ] as Array<{ label: string; val: boolean | null }>).map((opt) => {
                                  const isSelected =
                                    opt.val === null ? overrideVal === undefined : overrideVal === opt.val;
                                  return (
                                    <button
                                      key={opt.label}
                                      type="button"
                                      onClick={() =>
                                        featureVisibilityService.setUserFeatureOverride(
                                          activeTargetStaff.email,
                                          feat.key,
                                          opt.val,
                                          performer
                                        )
                                      }
                                      className={`px-2 py-1 rounded-md font-bold cursor-pointer ${
                                        isSelected
                                          ? opt.val === true
                                            ? 'bg-emerald-600 text-white'
                                            : opt.val === false
                                            ? 'bg-rose-600 text-white'
                                            : 'bg-slate-900 text-white'
                                          : 'bg-white border border-slate-200 text-slate-600'
                                      }`}
                                    >
                                      {opt.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-xs text-slate-500">
                    No matching staff member found to configure vendor isolation.
                  </div>
                )}
              </div>
            </div>

            {/* 3. Visibility & Scope Audit Trail */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Recent Visibility &amp; Vendor Scope Audit Log ({visState.auditTrail.length})
                </h4>
                <span className="text-[11px] font-mono text-slate-500">
                  Last Updated: {new Date(visState.updatedAt).toLocaleTimeString()}
                </span>
              </div>
              <div className="overflow-x-auto max-h-56 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 text-[10px] font-black uppercase text-slate-600 border-b border-slate-200">
                      <th className="py-2 px-4">Time</th>
                      <th className="py-2 px-4">Performed By</th>
                      <th className="py-2 px-4">Target</th>
                      <th className="py-2 px-4">Change Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visState.auditTrail.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 px-4 text-center text-slate-500">
                          No visibility toggle changes recorded yet in this browser session.
                        </td>
                      </tr>
                    ) : (
                      visState.auditTrail.slice(0, 12).map((aud) => (
                        <tr key={aud.id} className="hover:bg-slate-50">
                          <td className="py-2 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {new Date(aud.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="py-2 px-4 font-bold text-slate-800">{aud.performedBy}</td>
                          <td className="py-2 px-4 font-mono text-[11px] text-indigo-700">
                            {aud.targetType}: {aud.targetKey}
                          </td>
                          <td className="py-2 px-4 text-slate-700">{aud.details}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {activeTab === 'GRANULAR_PERMS' && isSuperAdmin && <GranularPermissionMatrixPanel />}

      {activeTab === 'ORG_HIERARCHY' && isSuperAdmin && <OrgHierarchyAndAuditPanel />}

      {/* ======================================================== */}
      {/* SCHEDULE FOLLOW-UP MODAL                                 */}
      {/* ======================================================== */}
      {showAddFollowUpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-red-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-black">Schedule Hierarchical Follow-Up</h3>
                <p className="text-xs text-slate-300">Assign task ownership across District, Block & Office teams</p>
              </div>
              <button onClick={() => setShowAddFollowUpModal(false)} className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFollowUp} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target / Entity Name *</label>
                <input
                  required
                  placeholder="e.g. Mandi Agro Traders or Staff Member Name"
                  value={fuTargetName}
                  onChange={(e) => setFuTargetName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Category *</label>
                  <select
                    value={fuTargetType}
                    onChange={(e) => setFuTargetType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Lead">Sales Lead</option>
                    <option value="Staff">Staff Member</option>
                    <option value="Vendor">B2B Vendor</option>
                    <option value="Member">Registered Member</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">District *</label>
                  <select
                    value={fuDistrict}
                    onChange={(e) => setFuDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Kota">Kota</option>
                    <option value="Baran">Baran</option>
                    <option value="Bundi">Bundi</option>
                    <option value="Jhalawar">Jhalawar</option>
                    <option value="Tonk">Tonk</option>
                    <option value="Jaipur">Jaipur</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Block / Sub-Division *</label>
                  <input
                    value={fuBlock}
                    onChange={(e) => setFuBlock(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={fuDueDate}
                    onChange={(e) => setFuDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Follow-Up Instructions / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Detail the required field task, verification, or commercial onboarding steps..."
                  value={fuNotes}
                  onChange={(e) => setFuNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddFollowUpModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-black cursor-pointer shadow-md"
                >
                  Schedule Follow-Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
