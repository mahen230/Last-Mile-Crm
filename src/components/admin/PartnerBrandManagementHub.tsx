import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Check,
  Copy,
  Download,
  ExternalLink,
  Layers,
  Palette,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Store as StoreIcon,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {
  Brand,
  CommercialStoreRecord,
  PartnerAccount,
  PartnerLifecycleStatus,
  PartnerTeamRole,
  Store,
} from '../../types/models';
import {
  DEFAULT_ROLE_PERMISSIONS,
  PartnerDataFlowSummary,
  partnerBrandService,
  slugifyPartnerName,
} from '../../services/partnerBrandService';
import { commercialPropertyService } from '../../services/commercialPropertyService';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { PartnerBrandLogo } from '../common/PartnerBrandLogo';
import PartnerThemeLogoPicker from './PartnerThemeLogoPicker';

type ManagementTab = 'BRANDS' | 'DIRECT_PARTNERS' | 'APPROVALS' | 'STRATEGIC_MATRIX';

const STATUS_OPTIONS: PartnerLifecycleStatus[] = ['Active', 'Pending', 'Suspended'];

const ROLE_LABELS: Record<PartnerTeamRole, string> = {
  PARTNER_OWNER: 'Partner Owner',
  STORE_MANAGER: 'Store Manager',
  SALES_EXECUTIVE: 'Sales Executive',
  CRM_OPERATOR: 'CRM Operator',
  SUPPORT_DESK: 'Support Desk',
};

export default function PartnerBrandManagementHub({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<ManagementTab>('BRANDS');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PartnerLifecycleStatus>('ALL');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const [brands, setBrands] = useState<Brand[]>(() => partnerBrandService.getAllBrands());
  const [stores, setStores] = useState<Store[]>(() => partnerBrandService.getAllStores());
  const [accounts, setAccounts] = useState<PartnerAccount[]>(() =>
    partnerBrandService.getAllPartnerAccounts()
  );
  const [counts, setCounts] = useState(() => partnerBrandService.getGlobalSummaryCounts());
  const [pendingApprovals, setPendingApprovals] = useState(() =>
    partnerBrandService.getPendingBrandApprovals()
  );
  const [approvalRoleDraft, setApprovalRoleDraft] = useState<Record<string, PartnerTeamRole>>({});
  const [approvalCategoryDraft, setApprovalCategoryDraft] = useState<Record<string, string>>({});
  const [approvalNonTerritoryDraft, setApprovalNonTerritoryDraft] = useState<Record<string, boolean>>({});

  // Modals & Inspector Drawer
  const [showCreateBrandModal, setShowCreateBrandModal] = useState(false);
  const [showCreateDirectModal, setShowCreateDirectModal] = useState(false);
  const [showImportDrawer, setShowImportDrawer] = useState(false);
  const [inspectedPartnerId, setInspectedPartnerId] = useState<string | null>(null);

  // Edit Theme, Logo & Strategic Profile Modal
  const [themeEditPartner, setThemeEditPartner] = useState<PartnerAccount | null>(null);
  const [tDisplayName, setTDisplayName] = useState('');
  const [tCategory, setTCategory] = useState('');
  const [tTagline, setTTagline] = useState('');
  const [tMonogram, setTMonogram] = useState('');
  const [tAccentColor, setTAccentColor] = useState('#0F172A');
  const [tThemePresetName, setTThemePresetName] = useState('');
  const [tLogoPresetId, setTLogoPresetId] = useState('MONOGRAM');
  const [tLogoUrl, setTLogoUrl] = useState('');
  const [tRoleInSystem, setTRoleInSystem] = useState('');
  const [tCoreProducts, setTCoreProducts] = useState('');
  const [tHubScope, setTHubScope] = useState('');
  const [tMarketingReturn, setTMarketingReturn] = useState('');

  // Create Brand Form State
  const [bName, setBName] = useState('');
  const [bSlug, setBSlug] = useState('');
  const [bCategory, setBCategory] = useState('Retail & Consumer Commerce');
  const [bTagline, setBTagline] = useState('');
  const [bAccentColor, setBAccentColor] = useState('#991B1B');
  const [bThemePresetName, setBThemePresetName] = useState('Crimson Pillar');
  const [bLogoPresetId, setBLogoPresetId] = useState('POSTAL_PILLAR');
  const [bLogoUrl, setBLogoUrl] = useState('');
  const [bMonogram, setBMonogram] = useState('');
  const [bRoleInSystem, setBRoleInSystem] = useState('Brand Partner');
  const [bCoreProducts, setBCoreProducts] = useState('');
  const [bHubScope, setBHubScope] = useState('');
  const [bMarketingReturn, setBMarketingReturn] = useState('');
  const [bOwnerName, setBOwnerName] = useState('');
  const [bOwnerEmail, setBOwnerEmail] = useState('');
  const [bOwnerPhone, setBOwnerPhone] = useState('');
  const [bPincode, setBPincode] = useState('324009');
  const [bOwnerPasscode, setBOwnerPasscode] = useState('');
  const [bInitialStatus, setBInitialStatus] = useState<PartnerLifecycleStatus>('Active');

  // Create Direct Store / Local Partner Form State
  const [dType, setDType] = useState<'DIRECT_STORE' | 'LOCAL_PARTNER'>('DIRECT_STORE');
  const [dName, setDName] = useState('');
  const [dSlug, setDSlug] = useState('');
  const [dCategory, setDCategory] = useState('Direct Retail Store');
  const [dAccentColor, setDAccentColor] = useState('#0F172A');
  const [dThemePresetName, setDThemePresetName] = useState('Command Slate');
  const [dLogoPresetId, setDLogoPresetId] = useState('STORE_FRONT');
  const [dLogoUrl, setDLogoUrl] = useState('');
  const [dMonogram, setDMonogram] = useState('');
  const [dAddress, setDAddress] = useState('');
  const [dPincode, setDPincode] = useState('324009');
  const [dBeatNo, setDBeatNo] = useState('');
  const [dOwnerName, setDOwnerName] = useState('');
  const [dOwnerEmail, setDOwnerEmail] = useState('');
  const [dOwnerPhone, setDOwnerPhone] = useState('');
  const [dOwnerPasscode, setDOwnerPasscode] = useState('');
  const [dStatus, setDStatus] = useState<PartnerLifecycleStatus>('Active');

  // Add Linked Store Inline Form inside Inspector
  const [showAddLinkedStoreForm, setShowAddLinkedStoreForm] = useState(false);
  const [lsName, setLsName] = useState('');
  const [lsPincode, setLsPincode] = useState('324009');
  const [lsBeatNo, setLsBeatNo] = useState('');
  const [lsAddress, setLsAddress] = useState('');
  const [lsManagerName, setLsManagerName] = useState('');
  const [lsManagerPhone, setLsManagerPhone] = useState('');

  // Optional Import from Commercial Directory
  const [importPasscode, setImportPasscode] = useState('Partner@2026');
  const [commercialStores] = useState<CommercialStoreRecord[]>(() =>
    commercialPropertyService.getScopedStores(userProfile)
  );

  const refresh = () => {
    setBrands(partnerBrandService.getAllBrands());
    setStores(partnerBrandService.getAllStores());
    setAccounts(partnerBrandService.getAllPartnerAccounts());
    setCounts(partnerBrandService.getGlobalSummaryCounts());
    setPendingApprovals(partnerBrandService.getPendingBrandApprovals());
  };

  useEffect(() => {
    return partnerBrandService.subscribe(refresh);
  }, []);

  const brandAccounts = useMemo(
    () => accounts.filter((a) => a.partnerType === 'BRAND'),
    [accounts]
  );

  const directAccounts = useMemo(
    () => accounts.filter((a) => a.partnerType !== 'BRAND'),
    [accounts]
  );

  const strategicAccounts = useMemo(
    () =>
      accounts.filter(
        (a) =>
          a.roleInSystem ||
          a.coreProductsServices ||
          a.storeBeatHubScope ||
          a.marketingGrowthReturn
      ),
    [accounts]
  );

  const filteredAccounts = useMemo(() => {
    const source = activeTab === 'BRANDS' ? brandAccounts : directAccounts;
    const q = searchQuery.trim().toLowerCase();
    return source.filter((a) => {
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      if (!q) return true;
      return (
        a.displayName.toLowerCase().includes(q) ||
        a.partnerSlug.toLowerCase().includes(q) ||
        a.ownerName.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.roleInSystem || '').toLowerCase().includes(q) ||
        a.pincode.includes(q)
      );
    });
  }, [activeTab, brandAccounts, directAccounts, searchQuery, statusFilter]);

  const inspectedSummary: PartnerDataFlowSummary | null = useMemo(() => {
    if (!inspectedPartnerId) return null;
    return partnerBrandService.getPartnerDataFlowSummary(inspectedPartnerId);
  }, [inspectedPartnerId, accounts, stores, brands]);

  const buildFullLoginUrl = (slug: string) => {
    const path = partnerBrandService.getPartnerLoginPath(slug);
    if (typeof window === 'undefined') return path;
    return `${window.location.origin}${path}`;
  };

  const handleCopyPartnerLink = async (slug: string) => {
    const url = buildFullLoginUrl(slug);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore clipboard restrictions
    }
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug((prev) => (prev === slug ? null : prev)), 2200);
  };

  const openThemeLogoEditor = (account: PartnerAccount) => {
    setThemeEditPartner(account);
    setTDisplayName(account.displayName);
    setTCategory(account.category);
    setTTagline(account.tagline || '');
    setTMonogram(account.monogram);
    setTAccentColor(account.accentColor || '#0F172A');
    setTThemePresetName(account.themePresetName || '');
    setTLogoPresetId(account.logoPresetId || 'MONOGRAM');
    setTLogoUrl(account.logoUrl || '');
    setTRoleInSystem(account.roleInSystem || '');
    setTCoreProducts(account.coreProductsServices || '');
    setTHubScope(account.storeBeatHubScope || '');
    setTMarketingReturn(account.marketingGrowthReturn || '');
  };

  const handleSaveThemeAndProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeEditPartner) return;
    const updated = partnerBrandService.updatePartnerBrandingAndProfile(themeEditPartner.id, {
      displayName: tDisplayName,
      category: tCategory,
      tagline: tTagline,
      monogram: tMonogram,
      accentColor: tAccentColor,
      themePresetName: tThemePresetName,
      logoPresetId: tLogoPresetId,
      logoUrl: tLogoUrl,
      roleInSystem: tRoleInSystem,
      coreProductsServices: tCoreProducts,
      storeBeatHubScope: tHubScope,
      marketingGrowthReturn: tMarketingReturn,
    });
    if (updated) {
      setThemeEditPartner(null);
      setFeedbackMsg(
        `Applied theme & logo changes dynamically to /partner/login/${updated.partnerSlug} and workspace.`
      );
    }
  };

  const handleCreateBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName.trim() || !bOwnerName.trim() || !bOwnerPasscode.trim()) return;

    const result = partnerBrandService.createBrandWithOwner({
      name: bName.trim(),
      customSlug: bSlug.trim() || slugifyPartnerName(bName),
      category: bCategory,
      tagline: bTagline.trim() || undefined,
      accentColor: bAccentColor,
      themePresetName: bThemePresetName,
      logoPresetId: bLogoPresetId,
      logoUrl: bLogoUrl.trim() || undefined,
      roleInSystem: bRoleInSystem.trim() || undefined,
      coreProductsServices: bCoreProducts.trim() || undefined,
      storeBeatHubScope: bHubScope.trim() || undefined,
      marketingGrowthReturn: bMarketingReturn.trim() || undefined,
      ownerName: bOwnerName.trim(),
      ownerEmail: bOwnerEmail.trim() || `${slugifyPartnerName(bName)}@partner.local`,
      ownerPhone: bOwnerPhone.trim(),
      pincode: bPincode.trim() || '324009',
      ownerPasscode: bOwnerPasscode.trim(),
      status: bInitialStatus,
    });

    if (bMonogram.trim()) {
      partnerBrandService.updatePartnerBrandingAndProfile(result.partner.id, {
        monogram: bMonogram.trim(),
      });
    }

    setShowCreateBrandModal(false);
    setBName('');
    setBSlug('');
    setBTagline('');
    setBLogoUrl('');
    setBMonogram('');
    setBCoreProducts('');
    setBHubScope('');
    setBMarketingReturn('');
    setBOwnerName('');
    setBOwnerEmail('');
    setBOwnerPhone('');
    setBOwnerPasscode('');
    setInspectedPartnerId(result.partner.id);
    setActiveTab('BRANDS');
    setFeedbackMsg(
      `Created brand "${result.brand.name}" with themed login link /partner/login/${result.partner.partnerSlug}.`
    );
  };

  const handleCreateDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dName.trim() || !dOwnerName.trim() || !dOwnerPasscode.trim()) return;

    const result = partnerBrandService.createDirectPartnerStore({
      partnerType: dType,
      name: dName.trim(),
      customSlug: dSlug.trim() || slugifyPartnerName(dName),
      category: dCategory,
      accentColor: dAccentColor,
      themePresetName: dThemePresetName,
      logoPresetId: dLogoPresetId,
      logoUrl: dLogoUrl.trim() || undefined,
      address: dAddress.trim() || `PIN ${dPincode}`,
      pincode: dPincode.trim() || '324009',
      beatNo: dBeatNo.trim() || undefined,
      ownerName: dOwnerName.trim(),
      ownerEmail: dOwnerEmail.trim() || `${slugifyPartnerName(dName)}@partner.local`,
      ownerPhone: dOwnerPhone.trim(),
      ownerPasscode: dOwnerPasscode.trim(),
      status: dStatus,
    });

    if (dMonogram.trim()) {
      partnerBrandService.updatePartnerBrandingAndProfile(result.partner.id, {
        monogram: dMonogram.trim(),
      });
    }

    setShowCreateDirectModal(false);
    setDName('');
    setDSlug('');
    setDLogoUrl('');
    setDMonogram('');
    setDAddress('');
    setDBeatNo('');
    setDOwnerName('');
    setDOwnerEmail('');
    setDOwnerPhone('');
    setDOwnerPasscode('');
    setInspectedPartnerId(result.partner.id);
    setActiveTab('DIRECT_PARTNERS');
    setFeedbackMsg(
      `Registered "${result.partner.displayName}" with themed login link /partner/login/${result.partner.partnerSlug}.`
    );
  };

  const handleAddLinkedStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectedSummary?.brand || !lsName.trim()) return;
    const created = partnerBrandService.addLinkedStoreToBrand({
      brandId: inspectedSummary.brand.id,
      name: lsName.trim(),
      pincode: lsPincode.trim() || '324009',
      beatNo: lsBeatNo.trim() || undefined,
      address: lsAddress.trim() || `PIN ${lsPincode}`,
      managerName: lsManagerName.trim() || undefined,
      managerPhone: lsManagerPhone.trim() || undefined,
      status: 'Active',
    });
    if (created) {
      setShowAddLinkedStoreForm(false);
      setLsName('');
      setLsBeatNo('');
      setLsAddress('');
      setLsManagerName('');
      setLsManagerPhone('');
      setFeedbackMsg(
        `Linked store "${created.name}" (${created.code}) added under ${inspectedSummary.brand.name}.`
      );
    }
  };

  const handleImportCommercialRecord = (record: CommercialStoreRecord) => {
    const account = partnerBrandService.onboardCommercialStoreRecord(
      record,
      importPasscode.trim() || 'Partner@2026'
    );
    setShowImportDrawer(false);
    setActiveTab(account.partnerType === 'BRAND' ? 'BRANDS' : 'DIRECT_PARTNERS');
    setInspectedPartnerId(account.id);
    setFeedbackMsg(
      `Provisioned partner portal /partner/login/${account.partnerSlug} for "${account.displayName}".`
    );
  };

  const handleSyncCorePillars = () => {
    const added = partnerBrandService.syncCoreStrategicPartners(true);
    setFeedbackMsg(
      added > 0
        ? `Restored ${added} core anchor partner(s) (India Post, Xpeedo Logistics, Xpeedo EV).`
        : 'All 3 core anchor brand partners (India Post, Xpeedo Logistics, Xpeedo EV) are already active.'
    );
  };

  return (
    <section
      id="partner-brand-management-hub"
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
    >
      {/* Top Bar */}
      <div className="px-6 py-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-500">
            Admin Control · Partner, Brand &amp; Theme Architecture
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Partner &amp; Brand Management
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl">
            Manage Anchor &amp; Store Brand Partners (India Post, Xpeedo Logistics, Xpeedo EV),
            linked stores, direct partners, and file-upload-free brand color/logo themes applied
            dynamically to each partner&apos;s isolated login page and workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSyncCorePillars}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
            title="Ensure India Post, Xpeedo Logistics & Xpeedo EV pillars exist"
          >
            <RefreshCw size={13} />
            <span>Sync Core Pillars</span>
          </button>
          {commercialStores.length > 0 && (
            <button
              type="button"
              onClick={() => setShowImportDrawer(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download size={13} />
              <span>Import Directory</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowCreateDirectModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus size={14} />
            <span>Add Direct Store / Partner</span>
          </button>
          <button
            type="button"
            onClick={() => setShowCreateBrandModal(true)}
            className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus size={14} />
            <span>Create Brand</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className="mx-6 mt-4 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck size={15} className="text-emerald-700 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-emerald-700 hover:text-emerald-950 font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 border-b border-slate-200 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 text-xs">
        <div className="px-6 py-4">
          <div className="text-slate-500 font-medium">Registered Brands</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {counts.totalBrands}
          </div>
        </div>
        <div className="px-6 py-4">
          <div className="text-slate-500 font-medium">Brand-Linked Stores</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {counts.totalLinkedStores}
          </div>
        </div>
        <div className="px-6 py-4">
          <div className="text-slate-500 font-medium">Direct Stores &amp; Partners</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {counts.totalDirectPartners}
          </div>
        </div>
        <div className="px-6 py-4">
          <div className="text-slate-500 font-medium">Pending Team Requests</div>
          <div
            className={`text-2xl font-bold font-mono tabular-nums mt-1 ${
              counts.pendingTeamApprovals > 0 ? 'text-amber-600' : 'text-slate-900'
            }`}
          >
            {counts.pendingTeamApprovals}
          </div>
        </div>
        <div className="px-6 py-4 col-span-2 lg:col-span-1">
          <div className="text-slate-500 font-medium">Scoped CRM Records</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {counts.totalCrmRecords}
          </div>
        </div>
      </div>

      {/* Segmented View Tabs + Filters */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setActiveTab('BRANDS')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'BRANDS'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Brands &amp; Linked Stores ({brandAccounts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DIRECT_PARTNERS')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'DIRECT_PARTNERS'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Direct Stores &amp; Local Business Partners ({directAccounts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('APPROVALS')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'APPROVALS'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Brand Partner Login Approvals</span>
            {(pendingApprovals.pendingPartners.length + pendingApprovals.pendingTeamLogins.length) > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                {pendingApprovals.pendingPartners.length + pendingApprovals.pendingTeamLogins.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('STRATEGIC_MATRIX')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'STRATEGIC_MATRIX'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Strategic Role &amp; Growth Matrix ({strategicAccounts.length})
          </button>
        </div>

        {activeTab !== 'STRATEGIC_MATRIX' && activeTab !== 'APPROVALS' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, slug, role or PIN..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 w-60 focus:outline-none focus:border-slate-900"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | PartnerLifecycleStatus)}
              aria-label="Filter by partner status"
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-900 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        {activeTab === 'APPROVALS' ? (
          <div className="space-y-6">
            {/* Pending Partner Brand Workspaces */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  1. Pending Brand / Store Registrations ({pendingApprovals.pendingPartners.length})
                </h3>
                <span className="text-[11px] text-slate-500">
                  Approve, suspend, or inspect brand accounts before portal login is activated
                </span>
              </div>
              {pendingApprovals.pendingPartners.length === 0 ? (
                <div className="p-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500 text-center">
                  All registered Brand &amp; Direct Store workspaces have been reviewed. You can also manage lifecycle status from the Brands tab.
                </div>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                  {pendingApprovals.pendingPartners.map((p) => (
                    <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{p.displayName}</span>
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                            {p.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          /{p.partnerSlug} · Owner: {p.ownerName} ({p.ownerEmail}) · PIN {p.pincode}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            partnerBrandService.updatePartnerStatus(p.id, 'Active');
                            setFeedbackMsg(`Approved and activated Brand Portal for "${p.displayName}".`);
                          }}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Approve &amp; Activate
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            partnerBrandService.updatePartnerStatus(p.id, 'Suspended');
                            setFeedbackMsg(`Suspended "${p.displayName}".`);
                          }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Reject / Suspend
                        </button>
                        <button
                          type="button"
                          onClick={() => setInspectedPartnerId(p.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Inspect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Brand Team & B2B Agent Login Requests */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  2. Pending Brand Team &amp; Non-Territory B2B Login Requests ({pendingApprovals.pendingTeamLogins.length})
                </h3>
                <span className="text-[11px] text-slate-500">
                  Assign Role, Non-Territory Category Scope, and approve portal access
                </span>
              </div>
              {pendingApprovals.pendingTeamLogins.length === 0 ? (
                <div className="p-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500 text-center">
                  No pending team or B2B partner login requests at the moment.
                </div>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                  {pendingApprovals.pendingTeamLogins.map((req) => {
                    const selectedRole = approvalRoleDraft[req.id] || req.role;
                    const isNonTerr = approvalNonTerritoryDraft[req.id] ?? Boolean(req.isNonTerritoryAgent);
                    const catText = approvalCategoryDraft[req.id] ?? (req.assignedCategories || []).join(', ');
                    return (
                      <div key={req.id} className="p-4 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="font-bold text-slate-900 flex flex-wrap items-center gap-2">
                            <span>{req.name}</span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold">
                              Brand: {req.partnerName}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                              Pending
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {req.email} · {req.phone || '—'} {req.requestedNote ? `· Note: "${req.requestedNote}"` : ''}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
                          <select
                            value={selectedRole}
                            onChange={(e) =>
                              setApprovalRoleDraft((prev) => ({
                                ...prev,
                                [req.id]: e.target.value as PartnerTeamRole,
                              }))
                            }
                            aria-label={`Assign role for ${req.name}`}
                            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                          >
                            {Object.entries(ROLE_LABELS).map(([k, label]) => (
                              <option key={k} value={k}>
                                {label}
                              </option>
                            ))}
                          </select>

                          <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isNonTerr}
                              onChange={(e) =>
                                setApprovalNonTerritoryDraft((prev) => ({
                                  ...prev,
                                  [req.id]: e.target.checked,
                                }))
                              }
                            />
                            <span className="font-semibold">Non-Territory B2B Agent</span>
                          </label>

                          {isNonTerr && (
                            <input
                              type="text"
                              value={catText}
                              onChange={(e) =>
                                setApprovalCategoryDraft((prev) => ({
                                  ...prev,
                                  [req.id]: e.target.value,
                                }))
                              }
                              placeholder="Categories (e.g. PLI, EV Fleet)"
                              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg w-44"
                            />
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              const cats = catText
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean);
                              partnerBrandService.approveOrUpdateTeamLoginAccess(req.id, {
                                status: 'Active',
                                role: selectedRole,
                                isNonTerritoryAgent: isNonTerr,
                                assignedCategories: cats,
                              });
                              setFeedbackMsg(`Approved login access for ${req.name} (${ROLE_LABELS[selectedRole]}).`);
                            }}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              partnerBrandService.approveOrUpdateTeamLoginAccess(req.id, {
                                status: 'Deactivated',
                              });
                              setFeedbackMsg(`Declined request for ${req.name}.`);
                            }}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => setInspectedPartnerId(req.partnerId)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold cursor-pointer"
                          >
                            Inspect Brand
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Active / All Brand Accounts Quick Governance */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-slate-900">
                3. All Brand Accounts Lifecycle Control ({accounts.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {accounts.map((acc) => (
                  <div key={acc.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{acc.displayName}</div>
                      <div className="text-[11px] font-mono text-slate-500 truncate">/{acc.partnerSlug} · {acc.status}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <select
                        value={acc.status}
                        onChange={(e) =>
                          partnerBrandService.updatePartnerStatus(acc.id, e.target.value as PartnerLifecycleStatus)
                        }
                        className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-[11px] font-bold"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setInspectedPartnerId(acc.id)}
                        className="px-2 py-1 bg-slate-900 text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'STRATEGIC_MATRIX' ? (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="py-3 px-4 font-semibold">Partner</th>
                  <th className="py-3 px-4 font-semibold">Role in System</th>
                  <th className="py-3 px-4 font-semibold">Core Products / Services</th>
                  <th className="py-3 px-4 font-semibold">Store / Beat / Hub Scope</th>
                  <th className="py-3 px-4 font-semibold">Marketing &amp; Growth Return (Hame Kya Milta Hai)</th>
                  <th className="py-3 px-4 font-semibold text-right">Theme &amp; Portal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {strategicAccounts.map((account) => {
                  const loginPath = partnerBrandService.getPartnerLoginPath(account.partnerSlug);
                  return (
                    <tr key={account.id} className="hover:bg-slate-50/70 align-top">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <PartnerBrandLogo
                            displayName={account.displayName}
                            monogram={account.monogram}
                            accentColor={account.accentColor}
                            logoPresetId={account.logoPresetId}
                            logoUrl={account.logoUrl}
                            size="sm"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{account.displayName}</div>
                            <div className="text-[11px] font-mono text-slate-500">
                              {loginPath}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-[180px]">
                        {account.roleInSystem || account.category}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 leading-relaxed max-w-[260px]">
                        {account.coreProductsServices || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 leading-relaxed max-w-[240px]">
                        {account.storeBeatHubScope || `PIN ${account.pincode}`}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-900 font-medium leading-relaxed max-w-[240px]">
                        {account.marketingGrowthReturn || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          type="button"
                          onClick={() => openThemeLogoEditor(account)}
                          className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Palette size={12} />
                          <span>Theme &amp; Logo</span>
                        </button>
                        <a
                          href={loginPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold inline-flex items-center gap-1"
                        >
                          <span>Portal</span>
                          <ExternalLink size={11} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="py-12 px-6 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50/50 space-y-3">
            <div className="w-11 h-11 rounded-lg bg-slate-200/80 text-slate-700 flex items-center justify-center mx-auto">
              {activeTab === 'BRANDS' ? <Layers size={20} /> : <StoreIcon size={20} />}
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-sm font-bold text-slate-900">
                {activeTab === 'BRANDS'
                  ? 'No matching brands found'
                  : 'No direct stores or local business partners configured yet'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeTab === 'BRANDS'
                  ? 'Create a parent Brand or restore the 3 core strategic pillars to issue isolated login links.'
                  : 'Register a standalone Direct Store or Local Business Partner to grant scoped store CRM and internal team access.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  activeTab === 'BRANDS'
                    ? setShowCreateBrandModal(true)
                    : setShowCreateDirectModal(true)
                }
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>
                  {activeTab === 'BRANDS' ? 'Create Brand' : 'Add Direct Store / Partner'}
                </span>
              </button>
              {activeTab === 'BRANDS' && (
                <button
                  type="button"
                  onClick={handleSyncCorePillars}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>Sync Core Pillars</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-4 font-semibold">
                    {activeTab === 'BRANDS' ? 'Brand & Role in System' : 'Store / Partner & Type'}
                  </th>
                  <th className="py-3 px-4 font-semibold">Hub / Beat Scope</th>
                  <th className="py-3 px-4 font-semibold text-right">Stores</th>
                  <th className="py-3 px-4 font-semibold text-right">Team / Req</th>
                  <th className="py-3 px-4 font-semibold">Individual Partner Login Link</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Theme &amp; Flow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(compact ? filteredAccounts.slice(0, 8) : filteredAccounts).map((account) => {
                  const summary = partnerBrandService.getPartnerDataFlowSummary(account.id);
                  const loginPath = partnerBrandService.getPartnerLoginPath(account.partnerSlug);
                  const isCopied = copiedSlug === account.partnerSlug;

                  return (
                    <tr key={account.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <PartnerBrandLogo
                            displayName={account.displayName}
                            monogram={account.monogram}
                            accentColor={account.accentColor}
                            logoPresetId={account.logoPresetId}
                            logoUrl={account.logoUrl}
                            size="md"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">
                              {account.displayName}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[230px]">
                              {account.roleInSystem ||
                                (account.partnerType === 'BRAND'
                                  ? 'Brand'
                                  : account.partnerType === 'DIRECT_STORE'
                                  ? 'Direct Store'
                                  : 'Local Partner')}{' '}
                              · {account.category}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="font-medium text-slate-800 truncate">
                          {account.storeBeatHubScope || account.ownerName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono tabular-nums truncate">
                          PIN {account.pincode} · {account.ownerName}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        {summary?.stores.length ?? 0}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        <span className="font-semibold text-slate-900">
                          {summary?.teamMembers.length ?? 0}
                        </span>
                        {(summary?.pendingRequests.length ?? 0) > 0 && (
                          <span className="text-amber-700 font-semibold">
                            {' '}
                            / {summary?.pendingRequests.length} req
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <code className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono text-slate-800 max-w-[180px] truncate">
                            {loginPath}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyPartnerLink(account.partnerSlug)}
                            className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[11px] font-semibold text-slate-700 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                            title="Copy isolated partner login link"
                          >
                            {isCopied ? (
                              <Check size={12} className="text-emerald-700" />
                            ) : (
                              <Copy size={12} />
                            )}
                            <span>{isCopied ? 'Copied' : 'Copy'}</span>
                          </button>
                          <a
                            href={loginPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-700 shrink-0"
                            title="Open isolated partner login page"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={account.status}
                          onChange={(e) =>
                            partnerBrandService.updatePartnerStatus(
                              account.id,
                              e.target.value as PartnerLifecycleStatus
                            )
                          }
                          aria-label={`Change status for ${account.displayName}`}
                          className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold cursor-pointer focus:outline-none ${
                            account.status === 'Active'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : account.status === 'Pending'
                              ? 'bg-amber-50 border-amber-300 text-amber-800'
                              : 'bg-red-50 border-red-300 text-red-800'
                          }`}
                        >
                          {STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          type="button"
                          onClick={() => openThemeLogoEditor(account)}
                          className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                          title="Customize Brand Color, System Logo & Role Matrix"
                        >
                          <Palette size={12} />
                          <span>Theme</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInspectedPartnerId(account.id);
                            setShowAddLinkedStoreForm(false);
                          }}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Users size={12} />
                          <span>Data &amp; Team</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ====================================================================
          DATA & TEAM FLOW INSPECTOR DRAWER
         ==================================================================== */}
      {inspectedSummary && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full flex flex-col border-l border-slate-200 overflow-hidden">
            <div
              className="px-6 py-4 text-white flex items-center justify-between gap-4"
              style={{ backgroundColor: inspectedSummary.partner.accentColor || '#0F172A' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <PartnerBrandLogo
                  displayName={inspectedSummary.partner.displayName}
                  monogram={inspectedSummary.partner.monogram}
                  accentColor={inspectedSummary.partner.accentColor}
                  logoPresetId={inspectedSummary.partner.logoPresetId}
                  logoUrl={inspectedSummary.partner.logoUrl}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="text-[11px] text-white/80">
                    Data &amp; Team Flow Inspector · {inspectedSummary.partner.status}
                  </div>
                  <h3 className="text-base font-bold text-white truncate">
                    {inspectedSummary.partner.displayName}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openThemeLogoEditor(inspectedSummary.partner)}
                  className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Palette size={13} />
                  <span>Edit Theme &amp; Logo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectedPartnerId(null)}
                  className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white cursor-pointer"
                  aria-label="Close inspector"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Strategic Role & Growth Summary (when configured) */}
              {(inspectedSummary.partner.roleInSystem ||
                inspectedSummary.partner.coreProductsServices ||
                inspectedSummary.partner.marketingGrowthReturn) && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">Role in System</div>
                    <div className="font-semibold text-slate-900 mt-0.5">
                      {inspectedSummary.partner.roleInSystem || inspectedSummary.partner.category}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Store / Beat / Hub Scope
                    </div>
                    <div className="font-medium text-slate-800 mt-0.5">
                      {inspectedSummary.partner.storeBeatHubScope ||
                        `PIN ${inspectedSummary.partner.pincode}`}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Core Products / Services
                    </div>
                    <div className="text-slate-700 mt-0.5 leading-relaxed">
                      {inspectedSummary.partner.coreProductsServices || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Marketing &amp; Growth Return
                    </div>
                    <div className="text-emerald-800 font-medium mt-0.5 leading-relaxed">
                      {inspectedSummary.partner.marketingGrowthReturn || '—'}
                    </div>
                  </div>
                </div>
              )}

              {/* Isolated Portal URL & Status Bar */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Individual White-Label Partner Login Link
                  </div>
                  <div className="font-mono font-semibold text-slate-900 truncate">
                    {buildFullLoginUrl(inspectedSummary.partner.partnerSlug)}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyPartnerLink(inspectedSummary.partner.partnerSlug)}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-semibold text-slate-800 inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSlug === inspectedSummary.partner.partnerSlug ? (
                      <Check size={13} className="text-emerald-700" />
                    ) : (
                      <Copy size={13} />
                    )}
                    <span>
                      {copiedSlug === inspectedSummary.partner.partnerSlug ? 'Copied' : 'Copy Link'}
                    </span>
                  </button>
                  <a
                    href={partnerBrandService.getPartnerLoginPath(
                      inspectedSummary.partner.partnerSlug
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-white rounded-lg font-semibold inline-flex items-center gap-1"
                    style={{
                      backgroundColor: inspectedSummary.partner.accentColor || '#0F172A',
                    }}
                  >
                    <span>Open Portal</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Section 1: Linked / Assigned Stores */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 size={15} className="text-slate-600" />
                    <span>
                      {inspectedSummary.brand
                        ? `Linked Stores Under ${inspectedSummary.brand.name} (${inspectedSummary.stores.length})`
                        : `Store Record (${inspectedSummary.stores.length})`}
                    </span>
                  </h4>
                  {inspectedSummary.brand && (
                    <button
                      type="button"
                      onClick={() => setShowAddLinkedStoreForm((v) => !v)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>{showAddLinkedStoreForm ? 'Cancel' : 'Link Store'}</span>
                    </button>
                  )}
                </div>

                {showAddLinkedStoreForm && inspectedSummary.brand && (
                  <form
                    onSubmit={handleAddLinkedStore}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Store / Branch Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={lsName}
                          onChange={(e) => setLsName(e.target.value)}
                          placeholder="e.g. Talwandi Flagship Store"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          required
                          value={lsPincode}
                          onChange={(e) => setLsPincode(e.target.value)}
                          placeholder="324005"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Beat / Zone (Optional)
                        </label>
                        <input
                          type="text"
                          value={lsBeatNo}
                          onChange={(e) => setLsBeatNo(e.target.value)}
                          placeholder="e.g. Beat 2"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Store Manager Name
                        </label>
                        <input
                          type="text"
                          value={lsManagerName}
                          onChange={(e) => setLsManagerName(e.target.value)}
                          placeholder="Manager Full Name"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">
                          Store Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={lsAddress}
                          onChange={(e) => setLsAddress(e.target.value)}
                          placeholder="Complete shop/hub address"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-semibold cursor-pointer"
                    >
                      Save Linked Store
                    </button>
                  </form>
                )}

                {inspectedSummary.stores.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 text-slate-500 text-center">
                    No stores linked under this brand yet. Click &quot;Link Store&quot; above to
                    add a branch or hub.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl">
                    {inspectedSummary.stores.map((st) => (
                      <div key={st.id} className="p-3.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900">
                            {st.name}{' '}
                            <span className="font-mono text-[11px] font-normal text-slate-500">
                              · {st.code}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                            PIN {st.pincode}
                            {st.beatNo ? ` · ${st.beatNo}` : ''} · {st.address}
                          </div>
                        </div>
                        <span
                          className={`text-[11px] font-semibold shrink-0 ${
                            st.status === 'Active'
                              ? 'text-emerald-700'
                              : st.status === 'Pending'
                              ? 'text-amber-700'
                              : 'text-red-700'
                          }`}
                        >
                          {st.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Pending Onboarding Requests */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <UserCheck size={15} className="text-amber-600" />
                  <span>
                    Pending Portal Onboarding Requests ({inspectedSummary.pendingRequests.length})
                  </span>
                </h4>

                {inspectedSummary.pendingRequests.length === 0 ? (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500">
                    No pending staff/partner onboarding requests for this slug.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 border border-amber-200 rounded-xl bg-amber-50/30">
                    {inspectedSummary.pendingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-slate-900">
                            {req.name} · {ROLE_LABELS[req.role]}
                          </div>
                          <div className="text-[11px] text-slate-600 font-mono">
                            {req.email} · {req.phone}
                          </div>
                          {req.requestedNote && (
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              Note: {req.requestedNote}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              partnerBrandService.updateTeamMember(req.id, {
                                status: 'Active',
                                permissions: DEFAULT_ROLE_PERMISSIONS[req.role],
                              })
                            }
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              partnerBrandService.updateTeamMember(req.id, {
                                status: 'Deactivated',
                              })
                            }
                            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3: Active & Deactivated Internal Team */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Users size={15} className="text-slate-600" />
                  <span>Internal Team Roster ({inspectedSummary.teamMembers.length})</span>
                </h4>

                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl">
                  {inspectedSummary.teamMembers.map((m) => (
                    <div key={m.id} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900">
                          {m.name} ·{' '}
                          <span className="font-medium text-slate-600">{ROLE_LABELS[m.role]}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {m.email} · {m.phone || '—'} · Stores:{' '}
                          {m.assignedStoreIds.length === 0
                            ? 'All Partner Stores'
                            : `${m.assignedStoreIds.length} assigned`}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[11px] font-semibold ${
                            m.status === 'Active' ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                        >
                          {m.status}
                        </span>
                        {m.role !== 'PARTNER_OWNER' && (
                          <button
                            type="button"
                            onClick={() =>
                              partnerBrandService.updateTeamMember(m.id, {
                                status: m.status === 'Active' ? 'Deactivated' : 'Active',
                              })
                            }
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold cursor-pointer"
                          >
                            {m.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Scoped CRM Data Flow Summary */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900">
                  Scoped Store CRM Data Flow ({inspectedSummary.crmRecords.length} Records)
                </h4>
                <div className="grid grid-cols-5 gap-2 text-center border border-slate-200 rounded-xl p-3 bg-slate-50">
                  {(['New', 'In Follow-Up', 'Qualified', 'Converted', 'Closed'] as const).map(
                    (stage) => (
                      <div key={stage}>
                        <div className="text-[10px] text-slate-500 font-medium">{stage}</div>
                        <div className="text-base font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                          {inspectedSummary.crmByStage[stage]}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: EDIT THEME, LOGO & STRATEGIC PROFILE (FILE-UPLOAD-FREE)
         ==================================================================== */}
      {themeEditPartner && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 overflow-hidden text-xs max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                Brand Theme, Logo &amp; Role Profile · {themeEditPartner.displayName}
              </h3>
              <button
                type="button"
                onClick={() => setThemeEditPartner(null)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveThemeAndProfile} className="p-5 space-y-5 overflow-y-auto">
              <PartnerThemeLogoPicker
                displayName={tDisplayName}
                monogram={tMonogram}
                accentColor={tAccentColor}
                logoPresetId={tLogoPresetId}
                logoUrl={tLogoUrl}
                onChange={(patch) => {
                  if (patch.monogram !== undefined) setTMonogram(patch.monogram);
                  if (patch.accentColor !== undefined) setTAccentColor(patch.accentColor);
                  if (patch.themePresetName !== undefined)
                    setTThemePresetName(patch.themePresetName);
                  if (patch.logoPresetId !== undefined) setTLogoPresetId(patch.logoPresetId);
                  if (patch.logoUrl !== undefined) setTLogoUrl(patch.logoUrl);
                }}
              />

              <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Display Name *</label>
                  <input
                    type="text"
                    required
                    value={tDisplayName}
                    onChange={(e) => setTDisplayName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={tCategory}
                    onChange={(e) => setTCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Portal Tagline (Displayed on /partner/login/{themeEditPartner.partnerSlug})
                  </label>
                  <input
                    type="text"
                    value={tTagline}
                    onChange={(e) => setTTagline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Role in System
                  </label>
                  <input
                    type="text"
                    value={tRoleInSystem}
                    onChange={(e) => setTRoleInSystem(e.target.value)}
                    placeholder="e.g. Brand + Store Partner"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Store / Beat / Hub Scope
                  </label>
                  <input
                    type="text"
                    value={tHubScope}
                    onChange={(e) => setTHubScope(e.target.value)}
                    placeholder="Beats, PINs, or hubs"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Core Products / Services
                  </label>
                  <textarea
                    rows={2}
                    value={tCoreProducts}
                    onChange={(e) => setTCoreProducts(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Marketing &amp; Growth Return
                  </label>
                  <textarea
                    rows={2}
                    value={tMarketingReturn}
                    onChange={(e) => setTMarketingReturn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setThemeEditPartner(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg font-semibold cursor-pointer"
                  style={{ backgroundColor: tAccentColor }}
                >
                  Apply Theme &amp; Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: CREATE BRAND
         ==================================================================== */}
      {showCreateBrandModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 overflow-hidden text-xs max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Create Brand &amp; Isolated Partner Account</h3>
              <button
                type="button"
                onClick={() => setShowCreateBrandModal(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateBrandSubmit} className="p-5 space-y-4 overflow-y-auto">
              <PartnerThemeLogoPicker
                displayName={bName}
                monogram={bMonogram || (bName ? bName.slice(0, 2).toUpperCase() : 'BR')}
                accentColor={bAccentColor}
                logoPresetId={bLogoPresetId}
                logoUrl={bLogoUrl}
                onChange={(patch) => {
                  if (patch.monogram !== undefined) setBMonogram(patch.monogram);
                  if (patch.accentColor !== undefined) setBAccentColor(patch.accentColor);
                  if (patch.themePresetName !== undefined)
                    setBThemePresetName(patch.themePresetName);
                  if (patch.logoPresetId !== undefined) setBLogoPresetId(patch.logoPresetId);
                  if (patch.logoUrl !== undefined) setBLogoUrl(patch.logoUrl);
                }}
              />

              <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={bName}
                    onChange={(e) => setBName(e.target.value)}
                    placeholder="e.g. Kota Fresh Mobility"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Partner Login Slug
                  </label>
                  <input
                    type="text"
                    value={bSlug}
                    onChange={(e) => setBSlug(slugifyPartnerName(e.target.value))}
                    placeholder={bName ? slugifyPartnerName(bName) : 'kota-fresh'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={bCategory}
                    onChange={(e) => setBCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Role in System
                  </label>
                  <input
                    type="text"
                    value={bRoleInSystem}
                    onChange={(e) => setBRoleInSystem(e.target.value)}
                    placeholder="e.g. Brand + Store Partner"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Short Tagline (Shown on Isolated Login Page)
                  </label>
                  <input
                    type="text"
                    value={bTagline}
                    onChange={(e) => setBTagline(e.target.value)}
                    placeholder="e.g. Regional Store Operations & Partner Desk"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Core Products / Services
                  </label>
                  <input
                    type="text"
                    value={bCoreProducts}
                    onChange={(e) => setBCoreProducts(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Store / Beat / Hub Scope
                  </label>
                  <input
                    type="text"
                    value={bHubScope}
                    onChange={(e) => setBHubScope(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Marketing &amp; Growth Return
                  </label>
                  <input
                    type="text"
                    value={bMarketingReturn}
                    onChange={(e) => setBMarketingReturn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Primary Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={bOwnerName}
                    onChange={(e) => setBOwnerName(e.target.value)}
                    placeholder="Owner Full Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Owner Mobile (10-digit) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={bOwnerPhone}
                    onChange={(e) => setBOwnerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Owner Login Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={bOwnerEmail}
                    onChange={(e) => setBOwnerEmail(e.target.value)}
                    placeholder="owner@brand.in"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Initial Owner Passcode *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={bOwnerPasscode}
                    onChange={(e) => setBOwnerPasscode(e.target.value)}
                    placeholder="Min 4 chars"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">HQ Pincode</label>
                  <input
                    type="text"
                    value={bPincode}
                    onChange={(e) => setBPincode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Initial Portal Status
                  </label>
                  <select
                    value={bInitialStatus}
                    onChange={(e) => setBInitialStatus(e.target.value as PartnerLifecycleStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateBrandModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg font-semibold cursor-pointer"
                  style={{ backgroundColor: bAccentColor }}
                >
                  Create Brand &amp; Generate Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: CREATE DIRECT STORE / LOCAL BUSINESS PARTNER
         ==================================================================== */}
      {showCreateDirectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 overflow-hidden text-xs max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                Add Standalone Direct Store or Local Business Partner
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateDirectModal(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateDirectSubmit} className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setDType('DIRECT_STORE')}
                  className={`py-2 rounded-md font-semibold transition cursor-pointer ${
                    dType === 'DIRECT_STORE'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  Direct Store
                </button>
                <button
                  type="button"
                  onClick={() => setDType('LOCAL_PARTNER')}
                  className={`py-2 rounded-md font-semibold transition cursor-pointer ${
                    dType === 'LOCAL_PARTNER'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  Local Business Partner
                </button>
              </div>

              <PartnerThemeLogoPicker
                displayName={dName}
                monogram={dMonogram || (dName ? dName.slice(0, 2).toUpperCase() : 'ST')}
                accentColor={dAccentColor}
                logoPresetId={dLogoPresetId}
                logoUrl={dLogoUrl}
                onChange={(patch) => {
                  if (patch.monogram !== undefined) setDMonogram(patch.monogram);
                  if (patch.accentColor !== undefined) setDAccentColor(patch.accentColor);
                  if (patch.themePresetName !== undefined)
                    setDThemePresetName(patch.themePresetName);
                  if (patch.logoPresetId !== undefined) setDLogoPresetId(patch.logoPresetId);
                  if (patch.logoUrl !== undefined) setDLogoUrl(patch.logoUrl);
                }}
              />

              <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Store / Partner Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={dName}
                    onChange={(e) => setDName(e.target.value)}
                    placeholder="e.g. Sharma Kirana & General"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Partner Login Slug
                  </label>
                  <input
                    type="text"
                    value={dSlug}
                    onChange={(e) => setDSlug(slugifyPartnerName(e.target.value))}
                    placeholder={dName ? slugifyPartnerName(dName) : 'sharma-kirana'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Business Category
                  </label>
                  <input
                    type="text"
                    value={dCategory}
                    onChange={(e) => setDCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pincode &amp; Optional Beat
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={dPincode}
                      onChange={(e) => setDPincode(e.target.value)}
                      placeholder="324009"
                      className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                    />
                    <input
                      type="text"
                      value={dBeatNo}
                      onChange={(e) => setDBeatNo(e.target.value)}
                      placeholder="Beat 2"
                      className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Store Address *</label>
                  <input
                    type="text"
                    required
                    value={dAddress}
                    onChange={(e) => setDAddress(e.target.value)}
                    placeholder="Shop address, landmark, city"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Owner / Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={dOwnerName}
                    onChange={(e) => setDOwnerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={dOwnerPhone}
                    onChange={(e) => setDOwnerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Login Email *</label>
                  <input
                    type="email"
                    required
                    value={dOwnerEmail}
                    onChange={(e) => setDOwnerEmail(e.target.value)}
                    placeholder="partner@store.in"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Initial Passcode *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={dOwnerPasscode}
                    onChange={(e) => setDOwnerPasscode(e.target.value)}
                    placeholder="Min 4 chars"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={dStatus}
                    onChange={(e) => setDStatus(e.target.value as PartnerLifecycleStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDirectModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg font-semibold cursor-pointer"
                  style={{ backgroundColor: dAccentColor }}
                >
                  Save &amp; Issue Partner Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: IMPORT EXISTING COMMERCIAL STORE RECORD
         ==================================================================== */}
      {showImportDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 overflow-hidden text-xs max-h-[85vh] flex flex-col">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                Provision Portal Link from Commercial Directory
              </h3>
              <button
                type="button"
                onClick={() => setShowImportDrawer(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Default Initial Passcode for Imported Owner Account
                </label>
                <input
                  type="text"
                  value={importPasscode}
                  onChange={(e) => setImportPasscode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl">
                {commercialStores.slice(0, 12).map((cs) => (
                  <div key={cs.id} className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">
                        {cs.brandName || cs.storeName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {cs.storeName} · PIN {cs.pincode} · {cs.category}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleImportCommercialRecord(cs)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold cursor-pointer shrink-0"
                    >
                      Provision Link
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
