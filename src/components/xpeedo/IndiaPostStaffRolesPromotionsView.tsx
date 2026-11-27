import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Award,
  CheckCircle2,
  Download,
  Edit3,
  History,
  KeyRound,
  Plus,
  Search,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import {
  DEFAULT_STAFF_FALLBACK_PASSWORD,
  staffPermissionService,
} from '../../services/staffPermissionService';
import { exportCsvWithBom, xpeedoOpsService } from '../../services/xpeedoOpsService';
import {
  DesignationType,
  IndiaPostDutyCategory,
  ServiceModulePermissions,
  StaffProfile,
  UserRole,
} from '../../types/models';

const DUTY_CATEGORIES: IndiaPostDutyCategory[] = [
  'Delivery',
  'Counter & Booking',
  'Banking & IPPB',
  'Field Survey & Leads',
  'Supervisory & Division',
];

const POSTAL_POST_OPTIONS: Array<{
  label: string;
  role: UserRole;
  category: IndiaPostDutyCategory;
}> = [
  { label: 'Postman', role: 'POSTMAN', category: 'Delivery' },
  { label: 'GDS (BPM / ABPM / Dak Sevak)', role: 'GDS', category: 'Delivery' },
  { label: 'BPM (Branch Postmaster)', role: 'BPM', category: 'Delivery' },
  { label: 'ABPM (Assistant Branch Postmaster)', role: 'ABPM', category: 'Delivery' },
  { label: 'Last-Mile Rider', role: 'POSTMAN', category: 'Delivery' },
  { label: 'PA (Postal Assistant)', role: 'STAFF', category: 'Counter & Booking' },
  { label: 'Sorting Assistant (SA)', role: 'STAFF', category: 'Counter & Booking' },
  { label: 'Mail Guard', role: 'MAIL_GUARD', category: 'Counter & Booking' },
  { label: 'MTS (Multi Tasking Staff)', role: 'MTS', category: 'Counter & Booking' },
  { label: 'IPPB / Savings Desk Executive', role: 'STAFF', category: 'Banking & IPPB' },
  { label: 'PLI / RPLI Development Officer', role: 'MARKETING_TEAM', category: 'Banking & IPPB' },
  { label: 'Sales & Field Executive', role: 'SALES_FIELD_STAFF', category: 'Field Survey & Leads' },
  { label: 'Marketing & Survey Executive', role: 'MARKETING_TEAM', category: 'Field Survey & Leads' },
  { label: 'Sub Postmaster (SPM)', role: 'SUB_POSTMASTER', category: 'Supervisory & Division' },
  { label: 'Postmaster / HPO Head', role: 'POSTMASTER', category: 'Supervisory & Division' },
  { label: 'Office Incharge', role: 'OFFICE_INCHARGE', category: 'Supervisory & Division' },
  { label: 'Last-Mile Supervisor', role: 'LAST_MILE_SUPERVISOR', category: 'Supervisory & Division' },
  { label: 'Inspector (IP / ASP)', role: 'SUBDIVISION_INCHARGE', category: 'Supervisory & Division' },
  { label: 'Division Incharge', role: 'DIVISION_INCHARGE', category: 'Supervisory & Division' },
];

const DEFAULT_MODULES: ServiceModulePermissions = {
  crmSection: true,
  specialBillsSection: false,
  learningSection: true,
  schemeLeadsSection: true,
  contentSharingSection: true,
};

export default function IndiaPostStaffRolesPromotionsView({
  actorOverride,
}: {
  actorOverride?: string;
} = {}) {
  const { userProfile } = useAuth();
  const actorName = actorOverride || userProfile?.name || 'India Post Division Admin';

  const [tick, setTick] = useState(0);
  const [subView, setSubView] = useState<'ROSTER' | 'PROMOTIONS'>('ROSTER');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | IndiaPostDutyCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Promote / Reassign Modal state
  const [promotingStaff, setPromotingStaff] = useState<StaffProfile | null>(null);
  const [newPostLabel, setNewPostLabel] = useState('Postman');
  const [newRole, setNewRole] = useState<UserRole>('POSTMAN');
  const [newCategory, setNewCategory] = useState<IndiaPostDutyCategory>('Delivery');
  const [newSubOffice, setNewSubOffice] = useState('');
  const [newPincode, setNewPincode] = useState('324009');
  const [newBeat, setNewBeat] = useState('');
  const [preserveExistingBeat, setPreserveExistingBeat] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [orderRef, setOrderRef] = useState('');
  const [promoNotes, setPromoNotes] = useState('');

  // Edit Profile & Modules Modal state
  const [editingStaff, setEditingStaff] = useState<StaffProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive' | 'Pending'>('Active');
  const [editSubOffice, setEditSubOffice] = useState('');
  const [editPincode, setEditPincode] = useState('324009');
  const [editBeat, setEditBeat] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editCanViewAll, setEditCanViewAll] = useState(false);
  const [editModules, setEditModules] = useState<ServiceModulePermissions>(DEFAULT_MODULES);

  // Onboard New India Post Staff Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createContact, setCreateContact] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createEmployeeId, setCreateEmployeeId] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createPostLabel, setCreatePostLabel] = useState('Postman');
  const [createRole, setCreateRole] = useState<UserRole>('POSTMAN');
  const [createCategory, setCreateCategory] = useState<IndiaPostDutyCategory>('Delivery');
  const [createSubOffice, setCreateSubOffice] = useState('Dadabari S.O.');
  const [createPincode, setCreatePincode] = useState('324009');
  const [createBeat, setCreateBeat] = useState('Beat 1');

  useEffect(() => {
    const u1 = staffPermissionService.subscribe(() => setTick((t) => t + 1));
    return () => u1();
  }, []);

  const showToast = (type: 'ok' | 'err', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 5000);
  };

  const indiaPostStaff = useMemo(() => {
    return staffPermissionService.getIndiaPostOperationalProfiles().filter((s) => {
      const roleUpper = String(s.role || '').toUpperCase();
      if (['OWNER', 'MASTER_ADMIN', 'DEVELOPER', 'SUPER_ADMIN'].includes(roleUpper)) {
        return false;
      }
      if (s.staffScopeType === 'XPOKART_PLATFORM') return false;
      const bId = (s.brandId || '').trim().toLowerCase();
      return !bId || bId === 'india-post' || bId === 'india_post';
    });
  }, [tick]);

  const totalPostalStaffCount = indiaPostStaff.length;

  const offices = useMemo(() => {
    return staffPermissionService
      .getDynamicOffices()
      .filter((o) => !o.brandId || o.brandId === 'india-post');
  }, []);

  const promotionHistory = staffPermissionService.getStaffPromotionHistory();

  const categoryCounts = useMemo(() => {
    const map: Record<IndiaPostDutyCategory, number> = {
      Delivery: 0,
      'Counter & Booking': 0,
      'Banking & IPPB': 0,
      'Field Survey & Leads': 0,
      'Supervisory & Division': 0,
    };
    indiaPostStaff.forEach((s) => {
      const cat =
        s.postCategory ||
        staffPermissionService.deriveIndiaPostDutyCategory(
          s.designationType || s.designation || s.role
        );
      map[cat] = (map[cat] || 0) + 1;
    });
    return map;
  }, [indiaPostStaff]);

  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return indiaPostStaff.filter((s) => {
      const cat =
        s.postCategory ||
        staffPermissionService.deriveIndiaPostDutyCategory(
          s.designationType || s.designation || s.role
        );
      if (selectedCategory !== 'ALL' && cat !== selectedCategory) return false;
      if (!q) return true;
      return `${s.name} ${s.employeeId || ''} ${s.contact || ''} ${s.designationType || s.designation || s.role} ${s.subOffice || s.assignedOffice || ''} ${s.beat || ''} ${s.officePincode || ''}`
        .toLowerCase()
        .includes(q);
    });
  }, [indiaPostStaff, selectedCategory, searchQuery]);

  const openPromoteModal = (staff: StaffProfile) => {
    setPromotingStaff(staff);
    const currentPost = staff.designationType || staff.designation || 'Postman';
    setNewPostLabel(currentPost);
    setNewRole((staff.role as UserRole) || 'POSTMAN');
    setNewCategory(
      staff.postCategory ||
        staffPermissionService.deriveIndiaPostDutyCategory(currentPost)
    );
    setNewSubOffice(staff.subOffice || 'Dadabari S.O.');
    setNewPincode(staff.officePincode || '324009');
    setNewBeat(staff.beat || 'Beat 1');
    setPreserveExistingBeat(false);
    setEffectiveDate(new Date().toISOString().split('T')[0]);
    setOrderRef('');
    setPromoNotes('');
  };

  const openEditModal = (staff: StaffProfile) => {
    setEditingStaff(staff);
    setEditName(staff.name);
    setEditContact(staff.contact || '');
    setEditEmail(staff.email || '');
    setEditStatus((staff.status as 'Active' | 'Inactive' | 'Pending') || 'Active');
    setEditSubOffice(staff.subOffice || 'Dadabari S.O.');
    setEditPincode(staff.officePincode || '324009');
    setEditBeat(staff.beat || 'Beat 1');
    setEditNewPassword('');
    setEditCanViewAll(Boolean(staff.permissions?.canViewAllRecords));
    setEditModules({
      ...DEFAULT_MODULES,
      ...(staff.permissions?.serviceModules || {}),
    });
  };

  const handlePromoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promotingStaff) return;

    const res = staffPermissionService.promoteOrChangeStaffRole(
      promotingStaff.id,
      {
        newDesignationType: newPostLabel.trim(),
        newRole,
        newPostCategory: newCategory,
        newSubOffice: newSubOffice.trim(),
        newPincode: newPincode.trim(),
        newBeat: newBeat.trim(),
        preserveExistingBeat,
        effectiveDate,
        orderRef: orderRef.trim() || undefined,
        notes: promoNotes.trim() || undefined,
      },
      actorName
    );

    if (!res.success || !res.profile) {
      showToast('err', res.error || 'Could not update staff post or promotion.');
      return;
    }

    const syncResult = xpeedoOpsService.syncTaskAndSrmOnStaffRoleChange({
      staffName: res.profile.name,
      previousBeat: res.previousBeat,
      nextBeat: res.profile.beat,
      nextOffice: res.profile.subOffice,
      nextPost: newPostLabel.trim(),
      nextPostCategory: newCategory,
      actorName,
    });

    setPromotingStaff(null);
    showToast(
      'ok',
      `Updated ${res.profile.name} to ${newPostLabel} (${newCategory}). Synced ${syncResult.tasksUpdated} tasks & ${syncResult.srmUpdated} SRM tickets.`
    );
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    const res = staffPermissionService.updateIndiaPostStaffProfile(
      editingStaff.id,
      {
        name: editName.trim(),
        contact: editContact.trim(),
        email: editEmail.trim(),
        status: editStatus,
        subOffice: editSubOffice.trim(),
        officePincode: editPincode.trim(),
        beat: editBeat.trim(),
        canViewAllRecords: editCanViewAll,
        serviceModules: editModules,
      },
      actorName
    );
    if (!res.success) {
      showToast('err', res.error || 'Failed to update staff profile.');
      return;
    }
    const cleanPass = editNewPassword.trim();
    if (cleanPass) {
      if (cleanPass.length < 4) {
        showToast('err', 'Staff password must be at least 4 characters.');
        return;
      }
      const pwRes = staffPermissionService.adminUpdateStaffPassword(
        editingStaff.employeeId || editingStaff.email || editingStaff.id,
        cleanPass
      );
      if (!pwRes.success) {
        showToast('err', pwRes.error || 'Profile updated, but password reset failed.');
        return;
      }
    }
    setEditingStaff(null);
    setEditNewPassword('');
    showToast(
      'ok',
      cleanPass
        ? `Saved profile, module permissions & updated login password for ${editName.trim()}.`
        : `Saved profile & module permissions for ${editName.trim()}.`
    );
  };

  const handleCreateIndiaPostStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = createName.trim();
    const cleanMobile = createContact.replace(/\D/g, '').slice(-10);
    if (!cleanName || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      showToast('err', 'Enter staff full name and a valid 10-digit Indian mobile number.');
      return;
    }
    const cleanPass = createPassword.trim() || DEFAULT_STAFF_FALLBACK_PASSWORD;
    if (cleanPass.length < 4) {
      showToast('err', 'Login password must be at least 4 characters.');
      return;
    }
    const cleanEmpId =
      createEmployeeId.trim().toUpperCase() || `IP-KOTA-${cleanMobile.slice(-4)}`;
    const cleanEmail =
      createEmail.trim().toLowerCase() || `${cleanEmpId.toLowerCase()}@indiapost-portal.in`;
    let created: StaffProfile;
    try {
      const result = staffPermissionService.upsertStaffWithAutoOfficeAndBeat({
        employeeId: cleanEmpId,
        name: cleanName,
        contact: cleanMobile,
        email: cleanEmail,
        password: cleanPass,
        designationType: createPostLabel as DesignationType,
        role: createRole,
        circle: 'Rajasthan Circle',
        division: 'Kota Division',
        partnerOrganization: 'India Post (Kota Division)',
        headOffice: 'Kota H.O.',
        subOffice: createSubOffice.trim() || 'Dadabari S.O.',
        officePincode: createPincode.trim() || '324009',
        officeAddress: `${createSubOffice.trim() || 'Dadabari S.O.'}, Kota Division (${createPincode.trim() || '324009'})`,
        beat: createBeat.trim() || 'Beat 1',
        assignedColonies: [],
        approvalStatus: 'Approved',
        serviceModules: DEFAULT_MODULES,
      });
      created = result.profile;
    } catch (err: any) {
      showToast(
        'err',
        err?.message || 'Could not save India Post staff login.'
      );
      return;
    }
    staffPermissionService.updateIndiaPostStaffProfile(
      created.id,
      { postCategory: createCategory },
      actorName
    );
    staffPermissionService.adminUpdateStaffPassword(
      created.employeeId || created.email || created.id,
      cleanPass
    );
    setShowCreateModal(false);
    setCreateName('');
    setCreateContact('');
    setCreateEmail('');
    setCreateEmployeeId('');
    setCreatePassword('');
    showToast(
      'ok',
      `Created India Post staff login "${created.name}" (${created.employeeId}) under ${createSubOffice}.`
    );
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase text-red-700 font-semibold">
            India Post · Staff Logins, Post-Wise Role Assignment &amp; Promotion Ledger
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">
            India Post Staff Logins, Roles, Duty Categories &amp; Promotions ({indiaPostStaff.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Brand-owned staff onboarding, credentials/passwords, Delivery/Counter/IPPB/Supervisory posts, and automatic beat &amp; SRM sync.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            title={`Add postal operational staff (${totalPostalStaffCount} active)`}
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-lg font-semibold inline-flex items-center gap-1.5 bg-red-800 hover:bg-red-900 text-white cursor-pointer whitespace-nowrap"
          >
            <Plus size={14} />
            <span>Add Postal Staff Login</span>
          </button>
          <button
            type="button"
            onClick={() => setSubView('ROSTER')}
            className={`px-3 py-2 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
              subView === 'ROSTER'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users size={14} />
            <span>Staff Roster ({indiaPostStaff.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSubView('PROMOTIONS')}
            className={`px-3 py-2 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
              subView === 'PROMOTIONS'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <History size={14} />
            <span>Promotion Audit Ledger ({promotionHistory.length})</span>
          </button>
          <button
            type="button"
            onClick={() =>
              exportCsvWithBom(
                subView === 'ROSTER'
                  ? 'india_post_staff_roles_roster'
                  : 'india_post_staff_promotions_ledger',
                subView === 'ROSTER'
                  ? ['Employee ID', 'Name', 'Post / Designation', 'Duty Category', 'Office', 'PIN', 'Beat', 'Status', 'Contact']
                  : ['Order Ref', 'Employee ID', 'Staff Name', 'Previous Post', 'New Post', 'New Category', 'Office', 'Beat', 'Effective Date', 'Promoted By'],
                subView === 'ROSTER'
                  ? filteredStaff.map((s) => [
                      s.employeeId || s.id,
                      s.name,
                      s.designationType || s.designation || s.role,
                      s.postCategory || '',
                      s.subOffice || s.assignedOffice || '',
                      s.officePincode || '',
                      s.beat || '',
                      s.status || 'Active',
                      s.contact || '',
                    ])
                  : promotionHistory.map((p) => [
                      p.orderRef || p.id,
                      p.employeeId || p.staffId,
                      p.staffName,
                      p.previousPost,
                      p.newPost,
                      p.newPostCategory,
                      p.newOffice || '',
                      p.newBeat || '',
                      p.effectiveDate,
                      p.promotedBy,
                    ])
              )
            }
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`p-3 rounded-lg border text-xs font-medium flex items-center justify-between gap-2 ${
            notice.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>{notice.text}</span>
          </span>
          <button type="button" onClick={() => setNotice(null)} className="cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {subView === 'ROSTER' ? (
        <div className="space-y-4">
          {/* Duty Category Filter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white border-slate-200 hover:border-slate-400 text-slate-800'
              }`}
            >
              <div className={selectedCategory === 'ALL' ? 'text-slate-300' : 'text-slate-500'}>
                All Categories
              </div>
              <div className="text-xl font-bold font-mono tabular-nums mt-1">
                {indiaPostStaff.length}
              </div>
            </button>
            {DUTY_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    active
                      ? 'bg-red-800 text-white border-red-800'
                      : 'bg-white border-slate-200 hover:border-slate-400 text-slate-800'
                  }`}
                >
                  <div className={active ? 'text-red-100 truncate' : 'text-slate-500 truncate'}>
                    {cat}
                  </div>
                  <div className="text-xl font-bold font-mono tabular-nums mt-1">
                    {categoryCounts[cat] || 0}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Search & Roster Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-semibold text-slate-700">
                Showing {filteredStaff.length} postal staff profiles
                {selectedCategory !== 'ALL' ? ` in ${selectedCategory}` : ''}
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, ID, office, beat, PIN..."
                  className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-64"
                />
              </div>
            </div>

            {filteredStaff.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                No postal staff profiles match this filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Post &amp; Duty Category</th>
                      <th className="py-3 px-4">Office &amp; PIN</th>
                      <th className="py-3 px-4">Beat</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStaff.slice(0, 120).map((s) => {
                      const post = s.designationType || s.designation || s.role;
                      const cat =
                        s.postCategory ||
                        staffPermissionService.deriveIndiaPostDutyCategory(post);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{s.name}</div>
                            <div className="text-[11px] font-mono text-slate-500">
                              {s.employeeId || s.id} · {s.contact || s.email || '—'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{post}</div>
                            <div className="text-[11px] text-slate-500">
                              {cat} · Role: <span className="font-mono">{s.role}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            <div>{s.subOffice || s.assignedOffice || 'Kota Division'}</div>
                            <div className="text-[11px] font-mono text-slate-500">
                              PIN {s.officePincode || '—'}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700">{s.beat || '—'}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold ${
                                s.status === 'Inactive'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {s.status || 'Active'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openPromoteModal(s)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-800 hover:bg-red-900 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Award size={12} />
                                <span>Promote / Post</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditModal(s)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 size={12} />
                                <span>Login &amp; Modules</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Promotion Audit Ledger */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Post Change &amp; Promotion History ({promotionHistory.length})
            </h3>
            <span className="text-[11px] font-mono text-slate-500">IMMUTABLE AUDIT TRAIL</span>
          </div>
          {promotionHistory.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              No staff promotions or post transfers recorded yet. Use &ldquo;Promote / Post&rdquo; on any staff row to log the first order.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {promotionHistory.map((rec) => (
                <div key={rec.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <span>{rec.staffName}</span>
                      <span className="text-slate-400 font-mono">({rec.employeeId || rec.staffId})</span>
                      <ArrowUpRight size={13} className="text-emerald-700" />
                      <span className="text-red-800">{rec.newPost}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      From: {rec.previousPost} ({rec.previousOffice || '—'}, {rec.previousBeat || '—'}) → To:{' '}
                      {rec.newPostCategory} · {rec.newOffice || '—'} · {rec.newBeat || '—'}
                    </div>
                    {rec.notes && <div className="text-[11px] text-slate-500 mt-0.5">{rec.notes}</div>}
                  </div>
                  <div className="text-right font-mono text-[11px] text-slate-500 shrink-0">
                    <div>Eff: {rec.effectiveDate} {rec.orderRef ? `· Ref ${rec.orderRef}` : ''}</div>
                    <div>By: {rec.promotedBy}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Promote / Reassign Post Modal */}
      {promotingStaff && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Promote / Reassign Post — {promotingStaff.name}
                </h3>
                <div className="text-[11px] font-mono text-slate-500">
                  Current: {promotingStaff.designationType || promotingStaff.role} · {promotingStaff.subOffice} ({promotingStaff.beat})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPromotingStaff(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handlePromoteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Official Post / Designation *
                </label>
                <select
                  value={newPostLabel}
                  onChange={(e) => {
                    const chosen = POSTAL_POST_OPTIONS.find((p) => p.label === e.target.value);
                    setNewPostLabel(e.target.value);
                    if (chosen) {
                      setNewRole(chosen.role);
                      setNewCategory(chosen.category);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                >
                  {POSTAL_POST_OPTIONS.map((p) => (
                    <option key={p.label} value={p.label}>
                      {p.label} ({p.category})
                    </option>
                  ))}
                  {!POSTAL_POST_OPTIONS.some((p) => p.label === newPostLabel) && (
                    <option value={newPostLabel}>{newPostLabel}</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duty Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as IndiaPostDutyCategory)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  >
                    {DUTY_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Access Role Key</label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value.toUpperCase() as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Posting Office</label>
                  <input
                    list="ip-offices-datalist"
                    value={newSubOffice}
                    onChange={(e) => {
                      setNewSubOffice(e.target.value);
                      const match = offices.find((o) => o.officeName === e.target.value);
                      if (match?.pincode) setNewPincode(match.pincode);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                  <datalist id="ip-offices-datalist">
                    {offices.map((o) => (
                      <option key={o.officeId || o.id} value={o.officeName} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Office PIN</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Beat</label>
                  <input
                    type="text"
                    disabled={preserveExistingBeat}
                    value={preserveExistingBeat ? promotingStaff.beat || '' : newBeat}
                    onChange={(e) => setNewBeat(e.target.value)}
                    placeholder="e.g. Beat 2 or All Beats"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg disabled:bg-slate-100"
                  />
                </div>
                <label className="flex items-center gap-2 py-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={preserveExistingBeat}
                    onChange={(e) => setPreserveExistingBeat(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span>Preserve existing beat</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Order / Memo Ref</label>
                  <input
                    type="text"
                    value={orderRef}
                    onChange={(e) => setOrderRef(e.target.value)}
                    placeholder="e.g. KOTA/B2/2026-14"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Order Notes</label>
                <textarea
                  rows={2}
                  value={promoNotes}
                  onChange={(e) => setPromoNotes(e.target.value)}
                  placeholder="Optional remarks for audit trail & SRM handoff"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPromotingStaff(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-800 hover:bg-red-900 text-white font-semibold cursor-pointer"
                >
                  Confirm Post Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff & Service Modules Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield size={15} className="text-red-700" />
                <span>Edit Profile &amp; Modules — {editingStaff.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">10-Digit Mobile *</label>
                  <input
                    required
                    maxLength={10}
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-1">
                  <label className="block font-semibold text-slate-700 mb-1">Office</label>
                  <input
                    value={editSubOffice}
                    onChange={(e) => setEditSubOffice(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PIN</label>
                  <input
                    maxLength={6}
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Beat</label>
                  <input
                    value={editBeat}
                    onChange={(e) => setEditBeat(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 space-y-2">
                <div className="font-semibold text-slate-800">Service Module Visibility</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: 'crmSection', label: 'Citizen CRM & Properties' },
                    { key: 'specialBillsSection', label: 'Statutory Bills & ACG-61' },
                    { key: 'learningSection', label: 'Postal Departmental LMS' },
                    { key: 'schemeLeadsSection', label: 'PLI / SSA / IPPB Scheme Leads' },
                    { key: 'contentSharingSection', label: 'Citizen Broadcast & Dispatch' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean((editModules as any)[item.key])}
                        onChange={(e) =>
                          setEditModules((prev) => ({ ...prev, [item.key]: e.target.checked }))
                        }
                      />
                      <span className="text-slate-700">{item.label}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editCanViewAll}
                      onChange={(e) => setEditCanViewAll(e.target.checked)}
                    />
                    <span className="text-slate-700">View All Office Records</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <KeyRound size={13} className="text-red-700" />
                  <span>Reset / Set Login Password (Optional)</span>
                </label>
                <input
                  type="password"
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  placeholder="Leave blank to keep existing password (min 4 chars)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Login ID: <span className="font-mono font-semibold">{editingStaff.employeeId || editingStaff.contact || editingStaff.email}</span>
                  {editingStaff.hasCustomPassword ? ' · Custom password active' : ` · Default (${DEFAULT_STAFF_FALLBACK_PASSWORD})`}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                >
                  Save Profile, Password &amp; Modules
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Onboard New India Post Staff Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Onboard India Post Staff Login
                </h3>
                <div className="text-[11px] text-slate-500">
                  Creates an active Kota Division staff account directly inside India Post Portal
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateIndiaPostStaff} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    required
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">10-Digit Mobile *</label>
                  <input
                    required
                    maxLength={10}
                    value={createContact}
                    onChange={(e) => setCreateContact(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee ID (Auto if blank)</label>
                  <input
                    value={createEmployeeId}
                    onChange={(e) => setCreateEmployeeId(e.target.value.toUpperCase())}
                    placeholder="e.g. IP-KOTA-112"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Login Password</label>
                  <input
                    type="password"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder={`Default: ${DEFAULT_STAFF_FALLBACK_PASSWORD}`}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="staff@indiapost-portal.in"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Post *</label>
                  <select
                    value={createPostLabel}
                    onChange={(e) => {
                      const chosen = POSTAL_POST_OPTIONS.find((p) => p.label === e.target.value);
                      setCreatePostLabel(e.target.value);
                      if (chosen) {
                        setCreateRole(chosen.role);
                        setCreateCategory(chosen.category);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  >
                    {POSTAL_POST_OPTIONS.map((p) => (
                      <option key={p.label} value={p.label}>
                        {p.label} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Posting Office</label>
                  <input
                    list="ip-offices-create-list"
                    value={createSubOffice}
                    onChange={(e) => {
                      setCreateSubOffice(e.target.value);
                      const match = offices.find((o) => o.officeName === e.target.value);
                      if (match?.pincode) setCreatePincode(match.pincode);
                    }}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                  <datalist id="ip-offices-create-list">
                    {offices.map((o) => (
                      <option key={o.officeId || o.id} value={o.officeName} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Office PIN</label>
                  <input
                    maxLength={6}
                    value={createPincode}
                    onChange={(e) => setCreatePincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Beat</label>
                  <input
                    value={createBeat}
                    onChange={(e) => setCreateBeat(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-800 hover:bg-red-900 text-white font-semibold cursor-pointer"
                >
                  Create Postal Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
