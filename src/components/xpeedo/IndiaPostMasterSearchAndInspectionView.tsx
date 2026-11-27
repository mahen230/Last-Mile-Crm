import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Download,
  FileText,
  Filter,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Store,
  TrendingUp,
  UserCheck,
  Users,
  X,
  Tag,
  Sparkles,
} from 'lucide-react';
import { CONSOLIDATED_BEAT_MATRIX } from '../../data/consolidatedBeatMatrix';
import { staffPermissionService } from '../../services/staffPermissionService';
import { customerService } from '../../services/customerService';
import { POSTAL_PRODUCTS } from '../../data/productsData';
import { b2bPartnershipService } from '../../services/b2bPartnershipService';
import { exportCsvWithBom, xpeedoOpsService } from '../../services/xpeedoOpsService';
import { commonDataCentreService } from '../../services/commonDataCentreService';
import { indiaPostBulkShowcaseService } from '../../services/indiaPostBulkShowcaseService';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { StaffAttributionLink } from '../common/StaffAttributionModal';
import { SearchConsoleDuplicatePanel } from '../common/SearchConsoleDuplicatePanel';
import { StaffProfile, Customer, Lead, POSTAL_SERVICE_TAG_OPTIONS } from '../../types/models';

type SearchInspectionSection =
  | 'STAFF'
  | 'CUSTOMERS_PROPERTIES'
  | 'PRODUCTS_SCHEMES'
  | 'B2B_MARKETING';

interface B2BMarketingAgent {
  id: string;
  agentCode: string;
  name: string;
  designation: string;
  contactNumber: string;
  email: string;
  officeName: string;
  assignedPincode: string;
  managedTerritory: string;
  activeCorporateAccounts: number;
  monthlyRevenueInr: number;
  tier: 'Diamond Executive' | 'Senior Development Agent' | 'Direct Commercial Agent';
  status: 'Active on Field' | 'Review';
}

const SEEDED_MARKETING_AGENTS: B2BMarketingAgent[] = [
  {
    id: 'agent-ip-01',
    agentCode: 'AGNT-KTA-01',
    name: 'Rajendra Prasad Sharma',
    designation: 'Senior Business Development Executive (Bulk Parcels)',
    contactNumber: '9414012101',
    email: 'rajendra.biz@indiapost.gov.in',
    officeName: 'Kota H.O. (324001)',
    assignedPincode: '324001',
    managedTerritory: 'Kota H.O. & Commercial Hub Beats 1–12',
    activeCorporateAccounts: 18,
    monthlyRevenueInr: 850000,
    tier: 'Diamond Executive',
    status: 'Active on Field',
  },
  {
    id: 'agent-ip-02',
    agentCode: 'AGNT-KTA-02',
    name: 'Vikram Singh Hada',
    designation: 'Postal Revenue & Corporate BNPL Agent',
    contactNumber: '9414012102',
    email: 'vikram.hada@indiapost.gov.in',
    officeName: 'Dadabari S.O. (324009)',
    assignedPincode: '324009',
    managedTerritory: 'Dadabari Beats 1–34 & Industrial Area',
    activeCorporateAccounts: 14,
    monthlyRevenueInr: 620000,
    tier: 'Senior Development Agent',
    status: 'Active on Field',
  },
  {
    id: 'agent-ip-03',
    agentCode: 'AGNT-KTA-03',
    name: 'Sunita Meena',
    designation: 'Direct Marketing Agent (Educational Publications & E-Com)',
    contactNumber: '9414012103',
    email: 'sunita.meena@indiapost.gov.in',
    officeName: 'Vigyan Nagar S.O. (324005)',
    assignedPincode: '324005',
    managedTerritory: 'Coaching Hubs, Hostels & Vigyan Nagar Beats',
    activeCorporateAccounts: 22,
    monthlyRevenueInr: 1120000,
    tier: 'Diamond Executive',
    status: 'Active on Field',
  },
  {
    id: 'agent-ip-04',
    agentCode: 'AGNT-KTA-04',
    name: 'Mahesh Kumar Verma',
    designation: 'Direct Commercial Agent (Handloom & Saree Clusters)',
    contactNumber: '9414012104',
    email: 'mahesh.verma@indiapost.gov.in',
    officeName: 'Gumanpura S.O. (324007)',
    assignedPincode: '324007',
    managedTerritory: 'Gumanpura & Shopping Center Wholesale Beats',
    activeCorporateAccounts: 11,
    monthlyRevenueInr: 490000,
    tier: 'Direct Commercial Agent',
    status: 'Active on Field',
  },
];

export default function IndiaPostMasterSearchAndInspectionView() {
  const { userProfile } = useAuth();
  const activeUser = staffPermissionService.getActiveSession() || userProfile;
  const isSuperAdmin = staffPermissionService.isSuperAdmin(activeUser);

  const [activeSection, setActiveSection] = useState<SearchInspectionSection>('STAFF');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [globalMasterQuery, setGlobalMasterQuery] = useState('');
  const [globalSearchCategory, setGlobalSearchCategory] = useState<
    'ALL' | 'CITIZENS' | 'TAGS' | 'PROPERTIES' | 'LEADS' | 'SHOWCASE' | 'STAFF' | 'PINS'
  >('ALL');

  // ---------------------------------------------------------------------------
  // PANEL 1: STAFF SEARCH & DRILL-DOWN STATE
  // ---------------------------------------------------------------------------
  const [staffOfficeFilter, setStaffOfficeFilter] = useState('ALL');
  const [staffBeatFilter, setStaffBeatFilter] = useState('ALL');
  const [staffRoleFilter, setStaffRoleFilter] = useState('ALL');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [selectedStaffForModal, setSelectedStaffForModal] = useState<StaffProfile | null>(null);

  // ---------------------------------------------------------------------------
  // PANEL 2: CUSTOMERS & PROPERTY LEDGER SEARCH STATE
  // ---------------------------------------------------------------------------
  const [custPinFilter, setCustPinFilter] = useState('ALL');
  const [custColonyFilter, setCustColonyFilter] = useState('ALL');
  const [custBeatFilter, setCustBeatFilter] = useState('ALL');
  const [custSchemeFilter, setCustSchemeFilter] = useState('ALL');
  const [custSearchQuery, setCustSearchQuery] = useState('');
  const [selectedCustForModal, setSelectedCustForModal] = useState<Customer | null>(null);

  // ---------------------------------------------------------------------------
  // PANEL 3: OFFICE PRODUCTS & POSTAL SCHEMES STATE
  // ---------------------------------------------------------------------------
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [selectedProductForModal, setSelectedProductForModal] = useState<any | null>(null);

  // ---------------------------------------------------------------------------
  // PANEL 4: LEADS, B2B & MARKETING REVENUE AGENTS STATE
  // ---------------------------------------------------------------------------
  const [b2bSubTab, setB2bSubTab] = useState<'LEADS' | 'CORPORATE_ACCOUNTS' | 'MARKETING_AGENTS'>('CORPORATE_ACCOUNTS');
  const [leadStageFilter, setLeadStageFilter] = useState('ALL');
  const [b2bSearchQuery, setB2bSearchQuery] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);
  const [actionBanner, setActionBanner] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [quickTaskNote, setQuickTaskNote] = useState('');
  const [custModalRemark, setCustModalRemark] = useState('');
  const [custModalError, setCustModalError] = useState<string | null>(null);

  const showActionToast = (kind: 'ok' | 'err', text: string) => {
    setActionBanner({ kind, text });
    window.setTimeout(() => setActionBanner(null), 5000);
  };

  // Strictly Scoped Datasets
  const allStaff = useMemo(() => {
    void refreshTick;
    return staffPermissionService
      .getAllStaffProfiles()
      .filter(
        (s) =>
          (!s.brandId || s.brandId === 'india-post') &&
          staffPermissionService.matchesUserBeatScope(activeUser, {
            beatNo: s.beat,
            officeId: s.officeId,
            officeName: s.assignedOffice,
            pincode: s.officePincode,
            assignedStaffId: s.employeeId || s.id,
            assignedStaffEmail: s.email,
          })
      );
  }, [refreshTick, activeUser]);

  const allOffices = useMemo(() => {
    void refreshTick;
    const raw = staffPermissionService.getDynamicOffices();
    const seen = new Set<string>();
    return raw.filter((o) => {
      const key = (o.officeId || o.id || o.officeName).toUpperCase();
      if (seen.has(key)) return false;
      seen.add(key);
      if (o.brandId && o.brandId !== 'india-post') return false;
      if (isSuperAdmin) return true;
      return staffPermissionService.matchesUserBeatScope(activeUser, {
        officeId: o.officeId || o.id,
        officeName: o.officeName,
        pincode: o.pincode,
      });
    });
  }, [refreshTick, activeUser, isSuperAdmin]);

  const allCustomers = useMemo(() => {
    void refreshTick;
    return customerService
      .getScopedCustomers(activeUser)
      .filter((c) => !c.brandId || c.brandId === 'india-post');
  }, [refreshTick, activeUser]);

  const allProperties = useMemo(() => {
    void refreshTick;
    return customerService.getScopedProperties(activeUser);
  }, [refreshTick, activeUser]);

  const allLeads = useMemo(() => {
    void refreshTick;
    return customerService
      .getScopedLeads(activeUser)
      .filter((l) => !l.brandId || l.brandId === 'india-post');
  }, [refreshTick, activeUser]);

  const showcaseCatalog = useMemo(() => {
    void refreshTick;
    return indiaPostBulkShowcaseService.getUnifiedShowcaseCatalog();
  }, [refreshTick]);

  const handleQuickScheduleFollowUp = (target: {
    customerId: string;
    customerName: string;
    customerMobile: string;
    beatNo?: string;
    productName?: string;
    note?: string;
  }) => {
    const dueDate = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
    const noteText =
      (target.note || quickTaskNote || '').trim() ||
      `Master Search quick follow-up for ${target.productName || 'Postal Services'} (${target.beatNo || 'Beat 2'})`;

    customerService.scheduleFollowUp({
      customerId: target.customerId,
      customerName: target.customerName,
      customerMobile: target.customerMobile || '9000000000',
      beatNo: target.beatNo || 'Beat 2',
      scheduledDate: dueDate,
      productName: target.productName || 'Citizen Follow-Up',
      currentStatus: 'Pending',
      outcome: '',
      nextAction: noteText,
      assignedStaffName: 'India Post Beat Desk',
      remarks: noteText,
      brandId: 'india-post',
      brandName: 'India Post',
    });

    const client = xpeedoOpsService.ensureClientForWorkspace({
      workspaceKey: 'INDIA_POST',
      name: 'India Post',
      code: 'BRD-INPOST-01',
    });
    xpeedoOpsService.createTask(
      {
        title: `Follow-up: ${target.customerName} (${target.beatNo || 'Beat 2'})`,
        description: noteText,
        clientId: client.id,
        workspaceId: 'INDIA_POST',
        projectId: 'GENERAL',
        assigneeId: '',
        assigneeName: 'Dadabari S.O. Desk',
        status: 'Assigned',
        priority: 'High',
        startDate: new Date().toISOString().split('T')[0],
        dueDate,
        estimatedHours: 2,
        blockedByTaskIds: [],
        approvalStage: 'NONE',
        createdBy: 'Master Search Console',
      },
      'Master Search Console',
      'CLIENT_ADMIN'
    );

    customerService.logAudit(
      'MASTER_SEARCH_TASK_CREATED',
      'Task',
      target.customerId,
      target.customerName,
      `Scheduled follow-up & field task for ${dueDate}: ${noteText}`
    );

    setQuickTaskNote('');
    setRefreshTick((t) => t + 1);
    showActionToast('ok', `Follow-up & Operations Task scheduled for ${target.customerName} (${dueDate}) and recorded in audit_logs.`);
  };

  const handleQuickConvertLead = (lead: Lead) => {
    const activeProfile = staffPermissionService.getActiveSession();
    const resCust = commonDataCentreService.verifyAndCommitCustomer(
      activeProfile,
      {
        name: lead.customerName,
        mobile: lead.customerMobile || '9000000000',
        beatNo: lead.beatNo || 'Beat 2',
        pincode: lead.pincode || '324009',
        colony: lead.postOfficeName || 'Dadabari',
        area: lead.postOfficeName || 'Dadabari',
        brandId: 'india-post',
        brandName: 'India Post',
        address: {
          houseNumber: '',
          sectorLocality: lead.postOfficeName || 'Dadabari',
          pincode: lead.pincode || '324009',
          fullAddress: lead.customerAddress || `${lead.postOfficeName || 'Dadabari S.O.'}, Kota - ${lead.pincode || '324009'}`,
        },
        financialInterest: lead.productName,
        verificationStatus: 'Field Confirmed',
        source: 'Master Search Conversion',
      },
      {
        remark: `Lead converted from Master Search Console (${lead.productName})`,
        isIntentionalEdit: true,
        source: 'Master Search Console',
      }
    );

    if (!resCust.success || !resCust.data) {
      showActionToast('err', resCust.error || 'Three-Layer Verification blocked lead conversion.');
      return;
    }

    customerService.convertLeadToProduct(lead.id, `IP-${Date.now().toString().slice(-6)}`);
    setRefreshTick((t) => t + 1);
    showActionToast(
      'ok',
      `3-Layer Verified: Lead "${lead.customerName}" converted to active India Post customer (${resCust.data.masterId || resCust.data.id}) and synced to Common Data Centre.`
    );
  };

  const b2bApplications = useMemo(() => {
    return b2bPartnershipService
      .getApplications()
      .filter(
        (app) =>
          (!app.targetBrandSlug || app.targetBrandSlug === 'india-post') &&
          (isSuperAdmin ||
            staffPermissionService.matchesUserBeatScope(activeUser, {
              pincode: app.targetPincode,
              officeName: app.officeName,
            }))
      );
  }, [activeUser, isSuperAdmin]);

  const uniqueOfficeNames = useMemo(() => {
    return Array.from(new Set(allOffices.map((o) => o.officeName))).sort();
  }, [allOffices]);

  const uniquePincodes = useMemo(() => {
    return Array.from(new Set(allOffices.map((o) => o.pincode).filter(Boolean))).sort();
  }, [allOffices]);

  const uniqueColonies = useMemo(() => {
    return Array.from(
      new Set(
        allProperties
          .map((p) => p.colony || p.area || '')
          .filter(Boolean)
      )
    ).sort();
  }, [allProperties]);

  const beatNumbersList = useMemo(() => {
    return Array.from(
      new Set(CONSOLIDATED_BEAT_MATRIX.map((b) => b.beatNumber))
    ).sort((a, b) => {
      const na = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const nb = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return na - nb;
    });
  }, []);

  // Filtered Staff
  const filteredStaff = useMemo(() => {
    return allStaff.filter((s) => {
      if (staffOfficeFilter !== 'ALL' && s.assignedOffice !== staffOfficeFilter) return false;
      if (staffBeatFilter !== 'ALL' && s.beat !== staffBeatFilter) return false;
      if (staffRoleFilter !== 'ALL') {
        const r = (s.role || '').toUpperCase();
        const cat = (s.postCategory || '').toUpperCase();
        if (!r.includes(staffRoleFilter.toUpperCase()) && !cat.includes(staffRoleFilter.toUpperCase())) {
          return false;
        }
      }
      if (staffSearchQuery.trim()) {
        const q = staffSearchQuery.trim().toLowerCase();
        const hit =
          s.name.toLowerCase().includes(q) ||
          (s.employeeId && s.employeeId.toLowerCase().includes(q)) ||
          s.contact.includes(q) ||
          (s.email && s.email.toLowerCase().includes(q)) ||
          (s.beat && s.beat.toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    });
  }, [allStaff, staffOfficeFilter, staffBeatFilter, staffRoleFilter, staffSearchQuery]);

  // Filtered Customers (including service interest tags)
  const filteredCustomers = useMemo(() => {
    return allCustomers.filter((c) => {
      if (custPinFilter !== 'ALL' && c.pincode !== custPinFilter) return false;
      if (custColonyFilter !== 'ALL' && (c.colony || c.area) !== custColonyFilter) return false;
      if (custBeatFilter !== 'ALL' && c.beatNo !== custBeatFilter) return false;
      if (custSchemeFilter !== 'ALL') {
        const blob = `${c.activeScheme || ''} ${c.schemeHistory?.join(' ') || ''} ${(c.interestedServiceTags || []).join(' ')}`.toLowerCase();
        if (!blob.includes(custSchemeFilter.toLowerCase())) return false;
      }
      if (custSearchQuery.trim()) {
        const q = custSearchQuery.trim().toLowerCase();
        const hit =
          c.name.toLowerCase().includes(q) ||
          c.mobile.includes(q) ||
          (c.houseNo && c.houseNo.toLowerCase().includes(q)) ||
          (c.colony && c.colony.toLowerCase().includes(q)) ||
          (c.propertyId && c.propertyId.toLowerCase().includes(q)) ||
          (c.interestedServiceTags && c.interestedServiceTags.join(' ').toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    });
  }, [allCustomers, custPinFilter, custColonyFilter, custBeatFilter, custSchemeFilter, custSearchQuery]);

  // Unified Global Master Search index across Citizens, Tags, Properties, Leads, Showcase, Staff, and PINs
  const globalSearchHits = useMemo(() => {
    const q = globalMasterQuery.trim().toLowerCase();
    if (!q) return null;

    const citizenHits =
      globalSearchCategory === 'ALL' || globalSearchCategory === 'CITIZENS' || globalSearchCategory === 'TAGS'
        ? allCustomers
            .filter((c) => {
              const tagText = (c.interestedServiceTags || []).join(' ').toLowerCase();
              if (globalSearchCategory === 'TAGS') return tagText.includes(q);
              return (
                c.name.toLowerCase().includes(q) ||
                c.mobile.includes(q) ||
                (c.colony || '').toLowerCase().includes(q) ||
                (c.pincode || '').includes(q) ||
                (c.beatNo || '').toLowerCase().includes(q) ||
                tagText.includes(q)
              );
            })
            .slice(0, 6)
        : [];

    const propertyHits =
      globalSearchCategory === 'ALL' || globalSearchCategory === 'PROPERTIES'
        ? allProperties
            .filter((p) =>
              `${p.houseNo} ${p.propertyId} ${p.colony || ''} ${p.area || ''} ${p.beatNo || ''} ${p.pincode || ''}`
                .toLowerCase()
                .includes(q)
            )
            .slice(0, 6)
        : [];

    const leadHits =
      globalSearchCategory === 'ALL' || globalSearchCategory === 'LEADS' || globalSearchCategory === 'TAGS'
        ? allLeads
            .filter((l) =>
              `${l.customerName} ${l.customerMobile} ${l.productName} ${(l.serviceTags || []).join(' ')} ${l.pincode || ''} ${l.beatNo || ''}`
                .toLowerCase()
                .includes(q)
            )
            .slice(0, 6)
        : [];

    const showcaseHits =
      globalSearchCategory === 'ALL' || globalSearchCategory === 'SHOWCASE'
        ? showcaseCatalog
            .filter((s) =>
              `${s.title} ${s.code} ${s.category} ${s.bulkCustomerName || ''} ${s.pincode || ''} ${s.suggestedServiceTags.join(' ')}`
                .toLowerCase()
                .includes(q)
            )
            .slice(0, 6)
        : [];

    const staffHits =
      globalSearchCategory === 'ALL' || globalSearchCategory === 'STAFF'
        ? allStaff
            .filter((s) =>
              `${s.name} ${s.employeeId || s.id} ${s.contact || ''} ${s.role} ${s.assignedOffice} ${s.beat || ''} ${s.officePincode || ''}`
                .toLowerCase()
                .includes(q)
            )
            .slice(0, 6)
        : [];

    const officeHits =
      globalSearchCategory === 'ALL' || globalSearchCategory === 'PINS'
        ? allOffices
            .filter((o) => `${o.officeName} ${o.pincode} ${o.division || ''}`.toLowerCase().includes(q))
            .slice(0, 6)
        : [];

    return {
      citizenHits,
      propertyHits,
      leadHits,
      showcaseHits,
      staffHits,
      officeHits,
      total:
        citizenHits.length +
        propertyHits.length +
        leadHits.length +
        showcaseHits.length +
        staffHits.length +
        officeHits.length,
    };
  }, [globalMasterQuery, globalSearchCategory, allCustomers, allProperties, allLeads, showcaseCatalog, allStaff, allOffices]);

  const duplicateMobileCounts = useMemo(() => {
    const counts = new Map<string, number>();
    allCustomers.forEach((c) => {
      const m = String(c.mobile || '').replace(/\D/g, '').slice(-10);
      if (m.length === 10) {
        counts.set(m, (counts.get(m) || 0) + 1);
      }
    });
    return counts;
  }, [allCustomers]);

  const selectedCustDupCheck = useMemo(() => {
    if (!selectedCustForModal) return null;
    return commonDataCentreService.detectCustomerDuplicates({
      excludeId: selectedCustForModal.id,
      mobile: selectedCustForModal.mobile,
      name: selectedCustForModal.name,
      houseNo: selectedCustForModal.houseNo,
      colony: selectedCustForModal.colony || selectedCustForModal.area,
      propertyId: selectedCustForModal.propertyId,
    });
  }, [selectedCustForModal]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return POSTAL_PRODUCTS.filter((p) => {
      if (productCategoryFilter !== 'ALL' && p.category !== productCategoryFilter) return false;
      if (productSearchQuery.trim()) {
        const q = productSearchQuery.trim().toLowerCase();
        const hit =
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [productCategoryFilter, productSearchQuery]);

  // Filtered B2B & Leads
  const filteredLeads = useMemo(() => {
    return allLeads.filter((l) => {
      if (leadStageFilter !== 'ALL' && l.stage !== leadStageFilter) return false;
      if (b2bSearchQuery.trim()) {
        const q = b2bSearchQuery.trim().toLowerCase();
        const hit =
          l.customerName.toLowerCase().includes(q) ||
          l.customerMobile.includes(q) ||
          l.productName.toLowerCase().includes(q) ||
          (l.notes && l.notes.toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    });
  }, [allLeads, leadStageFilter, b2bSearchQuery]);

  const filteredCorporate = useMemo(() => {
    return b2bApplications.filter((app) => {
      if (b2bSearchQuery.trim()) {
        const q = b2bSearchQuery.trim().toLowerCase();
        const hit =
          app.businessName.toLowerCase().includes(q) ||
          app.contactName.toLowerCase().includes(q) ||
          app.contactPhone.includes(q) ||
          app.referenceId.toLowerCase().includes(q) ||
          app.category.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [b2bApplications, b2bSearchQuery]);

  const filteredAgents = useMemo(() => {
    return SEEDED_MARKETING_AGENTS.filter((ag) => {
      if (b2bSearchQuery.trim()) {
        const q = b2bSearchQuery.trim().toLowerCase();
        const hit =
          ag.name.toLowerCase().includes(q) ||
          ag.agentCode.toLowerCase().includes(q) ||
          ag.contactNumber.includes(q) ||
          ag.managedTerritory.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [b2bSearchQuery]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // CSV Exporters
  const exportStaffCsv = () => {
    exportCsvWithBom(
      `india_post_staff_directory_${new Date().toISOString().split('T')[0]}`,
      ['Employee ID', 'Name', 'Role', 'Duty Category', 'Office', 'PIN Code', 'Beat', 'Mobile', 'Email', 'Status'],
      filteredStaff.map((s) => [
        s.employeeId || s.id,
        s.name,
        s.role,
        s.postCategory || 'Delivery',
        s.assignedOffice,
        s.pincode,
        s.beat || 'Beat 1',
        s.contact,
        s.email,
        s.status || 'Active on Duty',
      ])
    );
  };

  const exportCustomersCsv = () => {
    exportCsvWithBom(
      `india_post_customers_registry_${new Date().toISOString().split('T')[0]}`,
      ['Citizen ID', 'Name', 'Mobile', 'House No', 'Colony', 'PIN Code', 'Beat', 'Property ID', 'Active Scheme'],
      filteredCustomers.map((c) => [
        c.id,
        c.name,
        c.mobile,
        c.houseNo || '',
        c.colony || c.area || '',
        c.pincode,
        c.beatNo,
        c.propertyId || '',
        c.activeScheme || 'N/A',
      ])
    );
  };

  const exportB2bCsv = () => {
    exportCsvWithBom(
      `india_post_b2b_corporate_accounts_${new Date().toISOString().split('T')[0]}`,
      ['Reference ID', 'Business Name', 'Contact Name', 'Phone', 'Category', 'Monthly Volume', 'Target PIN', 'Status'],
      filteredCorporate.map((c) => [
        c.referenceId,
        c.businessName,
        c.contactName,
        c.contactPhone,
        c.category,
        c.monthlyVolumeEstimate,
        c.targetPincode,
        c.status,
      ])
    );
  };

  return (
    <div className="space-y-6" id="india-post-master-inspection">
      {/* Power BI-Style Executive Header */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white rounded-2xl border border-red-900/60 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-red-600/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-amber-400 text-slate-950 font-black tracking-wide uppercase text-[10px] flex items-center gap-1 shadow-xs">
                <ShieldCheck size={12} />
                <span>{isSuperAdmin ? 'Master Admin / Owner View' : 'Scoped Master Search'}</span>
              </span>
              <span className="text-amber-300 font-mono font-semibold">BRD-INPOST-01</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">
                {isSuperAdmin
                  ? 'Department of Post Sovereign System'
                  : `${activeUser?.subOffice || activeUser?.assignedOffice || 'Assigned Office'} (${activeUser?.officePincode || activeUser?.pincode || '324009'}) · ${activeUser?.beat || 'Scoped Jurisdiction'}`}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Department of Post · Master Search &amp; Inspection Console</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Unified search across your permitted citizens, service interest tags, properties, leads, showcase catalog, rostered staff, and post office PINs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (activeSection === 'STAFF') exportStaffCsv();
                else if (activeSection === 'CUSTOMERS_PROPERTIES') exportCustomersCsv();
                else exportB2bCsv();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-2 border border-slate-700 shadow-sm cursor-pointer"
            >
              <Download size={14} className="text-amber-400" />
              <span>Export Filtered Dataset (UTF-8 BOM)</span>
            </button>
          </div>
        </div>

        {/* 4 Primary Operational Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-red-900/40 text-xs">
          <div className="bg-slate-900/80 border border-red-900/40 rounded-xl p-3.5 space-y-1">
            <div className="text-slate-400 flex items-center justify-between">
              <span>All Delivery Beats</span>
              <MapPin size={13} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white tabular-nums">
              {CONSOLIDATED_BEAT_MATRIX.length}
            </div>
            <div className="text-[11px] text-amber-300/80 font-medium">
              100% Mapped (Beats 1–34)
            </div>
          </div>

          <div className="bg-slate-900/80 border border-red-900/40 rounded-xl p-3.5 space-y-1">
            <div className="text-slate-400 flex items-center justify-between">
              <span>Delivery &amp; Office Staff</span>
              <Users size={13} className="text-blue-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white tabular-nums">
              {allStaff.length}
            </div>
            <div className="text-[11px] text-blue-300/80 font-medium">
              Active Rostered Personnel
            </div>
          </div>

          <div className="bg-slate-900/80 border border-red-900/40 rounded-xl p-3.5 space-y-1">
            <div className="text-slate-400 flex items-center justify-between">
              <span>10-Level Properties</span>
              <Building2 size={13} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white tabular-nums">
              {allProperties.length}
            </div>
            <div className="text-[11px] text-emerald-300/80 font-medium">
              Sequence-Wise Household Tags
            </div>
          </div>

          <div className="bg-slate-900/80 border border-red-900/40 rounded-xl p-3.5 space-y-1">
            <div className="text-slate-400 flex items-center justify-between">
              <span>Citizens &amp; B2B Network</span>
              <TrendingUp size={13} className="text-rose-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white tabular-nums">
              {allCustomers.length + b2bApplications.length}
            </div>
            <div className="text-[11px] text-rose-300/80 font-medium">
              {allCustomers.length} Citizens · {b2bApplications.length} Corporate Accounts
            </div>
          </div>
        </div>
      </div>

      {actionBanner && (
        <div
          className={`px-4 py-3 rounded-xl border text-xs font-bold flex items-center justify-between gap-2 ${
            actionBanner.kind === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <span>{actionBanner.text}</span>
          <button type="button" onClick={() => setActionBanner(null)} className="cursor-pointer opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* UNIFIED GLOBAL MASTER SEARCH CONSOLE BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-red-700" />
            <input
              type="text"
              value={globalMasterQuery}
              onChange={(e) => setGlobalMasterQuery(e.target.value)}
              placeholder="Unified Master Search: search citizen, mobile, house/plot, service tag (SSA/IPPB/Parcel), showcase item, staff ID, or PIN..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
            />
            {globalMasterQuery && (
              <button
                type="button"
                onClick={() => setGlobalMasterQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(['ALL', 'CITIZENS', 'TAGS', 'PROPERTIES', 'LEADS', 'SHOWCASE', 'STAFF', 'PINS'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setGlobalSearchCategory(cat)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  globalSearchCategory === cat
                    ? 'bg-red-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Records' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Service Tag Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="font-bold text-slate-500 flex items-center gap-1 mr-1">
            <Tag size={12} className="text-red-700" /> Quick Tag Lookup:
          </span>
          {POSTAL_SERVICE_TAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setGlobalSearchCategory('TAGS');
                setGlobalMasterQuery(tag.split('(')[0].trim());
              }}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-red-50 hover:text-red-800 text-slate-700 font-medium border border-slate-200 transition cursor-pointer"
            >
              {tag.split('(')[0].trim()}
            </button>
          ))}
        </div>

        {/* Live Unified Results */}
        {globalSearchHits && (
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                Unified Search Matches: <span className="text-red-700 font-mono">{globalSearchHits.total}</span>
              </span>
              <span className="text-[11px] text-slate-500">Click any hit to inspect or jump straight to its section</span>
            </div>

            {globalSearchHits.total === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500 text-center">
                No scoped records matched &ldquo;{globalMasterQuery}&rdquo;.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {globalSearchHits.citizenHits.map((c) => (
                  <button
                    key={`g-c-${c.id}`}
                    type="button"
                    onClick={() => {
                      setActiveSection('CUSTOMERS_PROPERTIES');
                      setCustSearchQuery(c.name);
                      setSelectedCustForModal(c);
                      setCustModalRemark(c.remarks || '');
                    }}
                    className="p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200 text-left transition cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-blue-800 uppercase">
                      <span>Citizen · {c.beatNo}</span>
                      <span className="font-mono">{c.pincode}</span>
                    </div>
                    <div className="font-bold text-slate-900 truncate">{c.name}</div>
                    <div className="text-[11px] text-slate-600 font-mono truncate">{c.mobile} · {c.colony || c.area || 'Assigned Beat'}</div>
                    {c.interestedServiceTags && c.interestedServiceTags.length > 0 && (
                      <div className="text-[10px] text-blue-700 truncate font-semibold">
                        Tags: {c.interestedServiceTags.join(', ')}
                      </div>
                    )}
                  </button>
                ))}

                {globalSearchHits.propertyHits.map((p) => (
                  <button
                    key={`g-p-${p.id}`}
                    type="button"
                    onClick={() => {
                      setActiveSection('CUSTOMERS_PROPERTIES');
                      setCustSearchQuery(p.houseNo || p.propertyId || '');
                    }}
                    className="p-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200 text-left transition cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 uppercase">
                      <span>Property · {p.beatNo}</span>
                      <span className="font-mono">{p.pincode}</span>
                    </div>
                    <div className="font-bold text-slate-900 truncate">{p.houseNo} · {p.colony || p.area}</div>
                    <div className="text-[11px] text-slate-600 font-mono truncate">{p.propertyId}</div>
                  </button>
                ))}

                {globalSearchHits.leadHits.map((l) => (
                  <button
                    key={`g-l-${l.id}`}
                    type="button"
                    onClick={() => {
                      setActiveSection('B2B_MARKETING');
                      setB2bSubTab('LEADS');
                      setB2bSearchQuery(l.customerName);
                    }}
                    className="p-3 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200 text-left transition cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-amber-900 uppercase">
                      <span>Lead · {l.stage}</span>
                      <span className="font-mono">{l.pincode}</span>
                    </div>
                    <div className="font-bold text-slate-900 truncate">{l.customerName}</div>
                    <div className="text-[11px] text-slate-700 truncate">{l.productName}</div>
                  </button>
                ))}

                {globalSearchHits.showcaseHits.map((s) => (
                  <button
                    key={`g-sh-${s.id}`}
                    type="button"
                    onClick={() => {
                      setActiveSection('PRODUCTS_SCHEMES');
                      setProductSearchQuery(s.code);
                    }}
                    className="p-3 rounded-xl bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200 text-left transition cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-rose-800 uppercase">
                      <span className="flex items-center gap-1"><Sparkles size={10} /> Showcase · {s.sourceType}</span>
                      <span className="font-mono">{s.code}</span>
                    </div>
                    <div className="font-bold text-slate-900 truncate">{s.title}</div>
                    <div className="text-[11px] text-slate-600 truncate">
                      {s.bulkCustomerName || s.category} · ₹{s.unitPrice.toLocaleString('en-IN')}
                    </div>
                  </button>
                ))}

                {globalSearchHits.staffHits.map((st) => (
                  <button
                    key={`g-st-${st.id}`}
                    type="button"
                    onClick={() => {
                      setActiveSection('STAFF');
                      setStaffSearchQuery(st.name);
                      setSelectedStaffForModal(st);
                    }}
                    className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-left transition cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 uppercase">
                      <span>Staff · {st.role}</span>
                      <span className="font-mono">{st.officePincode || '324009'}</span>
                    </div>
                    <div className="font-bold text-slate-900 truncate">{st.name}</div>
                    <div className="text-[11px] text-slate-600 truncate">{st.assignedOffice} · {st.beat || 'Office Desk'}</div>
                  </button>
                ))}

                {globalSearchHits.officeHits.map((o) => (
                  <button
                    key={`g-of-${o.id}`}
                    type="button"
                    onClick={() => {
                      setActiveSection('STAFF');
                      setStaffOfficeFilter(o.officeName);
                    }}
                    className="p-3 rounded-xl bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-200 text-left transition cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-indigo-800 uppercase">
                      <span>Post Office / PIN</span>
                      <span className="font-mono">{o.pincode}</span>
                    </div>
                    <div className="font-bold text-slate-900 truncate">{o.officeName}</div>
                    <div className="text-[11px] text-slate-600 truncate">{o.division || 'Kota Division'}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4 Multi-Level Inspection Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {[
          {
            key: 'STAFF' as SearchInspectionSection,
            label: `Staff & Personnel Search (${filteredStaff.length}/${allStaff.length})`,
            icon: Users,
            desc: 'Multi-criteria: Office -> Beat -> Role -> Personnel',
          },
          {
            key: 'CUSTOMERS_PROPERTIES' as SearchInspectionSection,
            label: `Customer & Property Ledger (${filteredCustomers.length})`,
            icon: Building2,
            desc: 'Area -> Colony -> Beat -> Citizen/House',
          },
          {
            key: 'PRODUCTS_SCHEMES' as SearchInspectionSection,
            label: `Office Products & Schemes (${filteredProducts.length})`,
            icon: Package,
            desc: 'Category -> Scheme -> Rates -> Availability',
          },
          {
            key: 'B2B_MARKETING' as SearchInspectionSection,
            label: `Leads, B2B & Revenue Agents (${filteredCorporate.length + filteredAgents.length})`,
            icon: Briefcase,
            desc: 'Pipeline Leads -> Corporate Accounts -> Agents',
          },
        ].map((tab) => {
          const active = activeSection === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveSection(tab.key)}
              className={`px-4 py-3 rounded-2xl text-left transition border cursor-pointer shrink-0 ${
                active
                  ? 'bg-red-900 text-white border-red-800 shadow-md ring-2 ring-amber-400/30'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon size={16} className={active ? 'text-amber-300' : 'text-slate-500'} />
                <span className="text-xs font-black">{tab.label}</span>
              </div>
              <div className={`text-[10px] mt-0.5 ${active ? 'text-red-200' : 'text-slate-400'}`}>
                {tab.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: STAFF & PERSONNEL SEARCH & VIEW (MULTI-LEVEL DRILL-DOWN)       */}
      {/* ========================================================================= */}
      {activeSection === 'STAFF' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-red-700" />
                <span>Postal Staff &amp; Delivery Personnel Directory</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect staff records step-by-step: Filter by Office / PIN first, then drill down by Beat, Role, Mobile, or Duty assignment.
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-slate-500">
              Showing <span className="text-red-700">{filteredStaff.length}</span> of {allStaff.length} Staff
            </div>
          </div>

          {/* Structured Multi-Level Filter Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Level 1: Office / PIN Filter */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Building2 size={12} className="text-red-700" />
                <span>1. Office / PIN Filter</span>
              </label>
              <select
                value={staffOfficeFilter}
                onChange={(e) => setStaffOfficeFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-red-600"
              >
                <option value="ALL">All Post Offices &amp; PINs</option>
                {uniqueOfficeNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level 2: Beat Filter (1–34) */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <MapPin size={12} className="text-amber-600" />
                <span>2. Beat (1–34)</span>
              </label>
              <select
                value={staffBeatFilter}
                onChange={(e) => setStaffBeatFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-red-600"
              >
                <option value="ALL">All 34 Beats</option>
                {beatNumbersList.map((beat) => (
                  <option key={beat} value={beat}>
                    {beat}
                  </option>
                ))}
              </select>
            </div>

            {/* Level 3: Role / Duty Category */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Award size={12} className="text-blue-600" />
                <span>3. Role / Post-wise Assignment</span>
              </label>
              <select
                value={staffRoleFilter}
                onChange={(e) => setStaffRoleFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-red-600"
              >
                <option value="ALL">All Roles &amp; Duties</option>
                <option value="POSTMAN">Postman / Delivery</option>
                <option value="GDS/PMAN">GDS / PMAN Relief</option>
                <option value="GDS/BPM">GDS / Branch Postmaster</option>
                <option value="SPM">Sub-Postmaster (SPM)</option>
                <option value="Banking & IPPB">Banking &amp; IPPB Cash</option>
                <option value="Counter & Booking">Counter &amp; Booking</option>
                <option value="Supervisory">Supervisory</option>
              </select>
            </div>

            {/* Search Query */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Search size={12} className="text-slate-500" />
                <span>4. Name / ID / Mobile Search</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh, 50510312, 9414..."
                value={staffSearchQuery}
                onChange={(e) => setStaffSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-600 font-medium"
              />
            </div>
          </div>

          {/* Staff Roster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((staff) => {
              const matchedBeatEntry = CONSOLIDATED_BEAT_MATRIX.find(
                (b) => b.beatNumber === staff.beat
              );
              return (
                <div
                  key={staff.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-red-300 hover:shadow-md transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-mono font-bold text-slate-400 uppercase">
                          {staff.employeeId || staff.id}
                        </div>
                        <h3 className="text-sm font-black text-slate-900 leading-snug">
                          {staff.name}
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold shrink-0">
                        {staff.role}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-slate-400 shrink-0" />
                        <span className="font-medium truncate">{staff.assignedOffice}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-mono text-slate-500">PIN {staff.pincode}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-amber-600 shrink-0" />
                        <span className="font-bold text-amber-900">{staff.beat || 'Beat Unassigned'}</span>
                        {matchedBeatEntry && (
                          <span className="text-[11px] text-slate-500 truncate">
                            ({matchedBeatEntry.colonies[0] || 'Dadabari Area'})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        <span className="font-mono text-slate-700">{staff.contact}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>{staff.status || 'Active on Duty'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedStaffForModal(staff)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Full Profile</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredStaff.length === 0 && (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-2">
              <Users size={28} className="text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-700">No staff matched your filters</div>
              <p className="text-xs text-slate-500">
                Try clearing the office, beat, or role search filters above.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: CUSTOMERS & PROPERTY LEDGER SEARCH & VIEW                     */}
      {/* ========================================================================= */}
      {activeSection === 'CUSTOMERS_PROPERTIES' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Building2 size={18} className="text-red-700" />
                <span>Customer Directory &amp; 10-Level Property Household Ledger</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Filter by Area / Colony / Beat / PIN first, then drill down by Customer Name, Mobile, Plot/House, or Linked Scheme.
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-slate-500">
              Showing <span className="text-red-700">{filteredCustomers.length}</span> of {allCustomers.length} Citizens
            </div>
          </div>

          {/* Multi-Level Search Filter Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* PIN Code Filter */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <MapPin size={12} className="text-red-700" />
                <span>1. PIN Code</span>
              </label>
              <select
                value={custPinFilter}
                onChange={(e) => setCustPinFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-red-600 font-mono"
              >
                <option value="ALL">All PINs (324009, 324001...)</option>
                {uniquePincodes.map((pin) => (
                  <option key={pin} value={pin}>
                    PIN {pin}
                  </option>
                ))}
              </select>
            </div>

            {/* Colony Filter */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Building2 size={12} className="text-amber-600" />
                <span>2. Colony / Area</span>
              </label>
              <select
                value={custColonyFilter}
                onChange={(e) => setCustColonyFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-red-600"
              >
                <option value="ALL">All Colonies / Sectors</option>
                {uniqueColonies.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Beat Filter */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <MapPin size={12} className="text-blue-600" />
                <span>3. Beat (1–34)</span>
              </label>
              <select
                value={custBeatFilter}
                onChange={(e) => setCustBeatFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-red-600"
              >
                <option value="ALL">All 34 Beats</option>
                {beatNumbersList.map((beat) => (
                  <option key={beat} value={beat}>
                    {beat}
                  </option>
                ))}
              </select>
            </div>

            {/* Scheme Filter */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Package size={12} className="text-emerald-600" />
                <span>4. Scheme / Service</span>
              </label>
              <select
                value={custSchemeFilter}
                onChange={(e) => setCustSchemeFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-red-600"
              >
                <option value="ALL">All Schemes</option>
                <option value="SSA">Sukanya Samriddhi (SSA)</option>
                <option value="PPF">PPF Account</option>
                <option value="PLI">PLI / RPLI</option>
                <option value="IPPB">IPPB Savings</option>
                <option value="NSC">NSC / KVP</option>
                <option value="SCSS">Senior Citizen (SCSS)</option>
              </select>
            </div>

            {/* Citizen Search */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <Search size={12} className="text-slate-500" />
                <span>5. Name / Mobile / Plot</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sharma, 98290..., Plot 42"
                value={custSearchQuery}
                onChange={(e) => setCustSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-600 font-medium"
              />
            </div>
          </div>

          {/* Customers Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Citizen Name</th>
                  <th className="p-3">Mobile &amp; WhatsApp</th>
                  <th className="p-3">House / Plot</th>
                  <th className="p-3">Colony &amp; PIN</th>
                  <th className="p-3">Beat</th>
                  <th className="p-3">Active Scheme Interest</th>
                  <th className="p-3">Staff Attribution</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.slice(0, 50).map((cust) => {
                  const cleanMob = String(cust.mobile || '').replace(/\D/g, '').slice(-10);
                  const isDupRow =
                    (cleanMob.length === 10 && (duplicateMobileCounts.get(cleanMob) || 0) > 1) ||
                    Boolean(cust.hasConflict);
                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-bold text-slate-900">
                        <div>{cust.name}</div>
                        {isDupRow && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                            Already Exists / Duplicate Match
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span>{cust.mobile}</span>
                          <a
                            href={`https://api.whatsapp.com/send?phone=91${cust.mobile.replace(/\D/g, '')}&text=Namaste%20${encodeURIComponent(
                              cust.name
                            )},%20this%20is%20Department%20of%20Post%20Dadabari%20324009.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700"
                          >
                            <MessageCircle size={13} />
                          </a>
                        </div>
                      </td>
                      <td className="p-3 text-slate-700">{cust.houseNo || 'Plot Verified'}</td>
                      <td className="p-3 text-slate-700">
                        <span className="font-medium">{cust.colony || cust.area || 'Dadabari'}</span>{' '}
                        <span className="font-mono text-slate-500 text-[11px]">({cust.pincode})</span>
                      </td>
                      <td className="p-3 font-bold text-amber-800">{cust.beatNo}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold text-[11px]">
                          {cust.activeScheme || 'Postal Savings / IPPB'}
                        </span>
                      </td>
                      <td className="p-3">
                        {cust.staffAttribution || cust.submittedByStaffId || cust.enteredByName || cust.assignedStaffName ? (
                          <StaffAttributionLink
                            attribution={cust.staffAttribution}
                            staffId={cust.submittedByStaffId || cust.assignedStaffId}
                            fallbackName={cust.enteredByName || cust.assignedStaffName}
                            compact
                          />
                        ) : (
                          <span className="text-[11px] text-slate-400">Dadabari S.O.</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          {cust.verificationStatus || 'Verified Citizen'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCustForModal(cust);
                            setCustModalRemark(cust.remarks || '');
                            setCustModalError(null);
                          }}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer transition"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length > 50 && (
            <div className="text-center text-xs text-slate-500 pt-2">
              Showing top 50 matches. Use the search bar to narrow down citizens.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: OFFICE PRODUCTS & POSTAL SCHEMES SEARCH & VIEW                */}
      {/* ========================================================================= */}
      {activeSection === 'PRODUCTS_SCHEMES' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Package size={18} className="text-red-700" />
                <span>Department of Post Products, Small Savings &amp; Insurance Schemes</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect official sovereign government interest rates, tax benefits, eligibility criteria, and office counter mapping.
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-slate-500">
              {filteredProducts.length} Official Schemes Available
            </div>
          </div>

          {/* Product Filter Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Scheme Category</label>
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-red-600"
              >
                <option value="ALL">All Categories (Savings, Child, Insurance...)</option>
                <option value="Child & Women Empowerment">Child &amp; Women Empowerment (SSA)</option>
                <option value="Savings & Deposits">Savings &amp; Deposits (PPF, SB, TD, RD)</option>
                <option value="Long-term Growth & Sovereign Bonds">Long-term Growth (NSC, KVP)</option>
                <option value="Senior Citizens & Special">Senior Citizens &amp; Special (SCSS, MSSC)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Scheme Search</label>
              <input
                type="text"
                placeholder="Search by code (SSA, PPF, PLI) or keyword..."
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-600 font-medium"
              />
            </div>
          </div>

          {/* Products Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-red-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-black font-mono">
                      {prod.code}
                    </span>
                    <span className="text-slate-500 font-semibold">{prod.category}</span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {prod.name}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>

                  <div className="pt-2 border-t border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sovereign Rate:</span>
                      <span className="font-bold text-emerald-800 font-mono">
                        {prod.interestRateOrBonus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Deposit Range:</span>
                      <span className="font-medium text-slate-800">
                        {prod.minInvestment} to {prod.maxInvestment}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tax Benefit:</span>
                      <span className="font-bold text-blue-700 text-[11px] truncate max-w-[180px]">
                        {prod.taxBenefits}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-amber-800 font-bold">All SO/BO Counters</span>
                  <button
                    type="button"
                    onClick={() => setSelectedProductForModal(prod)}
                    className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect Rules</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: LEADS, B2B & MARKETING REVENUE AGENTS                           */}
      {/* ========================================================================= */}
      {activeSection === 'B2B_MARKETING' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Briefcase size={18} className="text-red-700" />
                <span>Leads, B2B Bulk Parcel Accounts &amp; Marketing Revenue Agents</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor business pipeline leads, corporate bulk parcel dispatch contracts, and the marketing agent network driving postal revenue.
              </p>
            </div>
            
            {/* Sub-Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setB2bSubTab('CORPORATE_ACCOUNTS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  b2bSubTab === 'CORPORATE_ACCOUNTS'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                B2B Corporate Accounts ({filteredCorporate.length})
              </button>
              <button
                type="button"
                onClick={() => setB2bSubTab('MARKETING_AGENTS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  b2bSubTab === 'MARKETING_AGENTS'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Revenue &amp; Marketing Agents ({filteredAgents.length})
              </button>
              <button
                type="button"
                onClick={() => setB2bSubTab('LEADS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  b2bSubTab === 'LEADS'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pipeline Leads ({filteredLeads.length})
              </button>
            </div>
          </div>

          {/* Search Bar for Section 4 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex flex-wrap items-center gap-3">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search corporate accounts, agents, business category, phone..."
              value={b2bSearchQuery}
              onChange={(e) => setB2bSearchQuery(e.target.value)}
              className="flex-1 min-w-[200px] bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
            />
            {b2bSubTab === 'LEADS' && (
              <select
                value={leadStageFilter}
                onChange={(e) => setLeadStageFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-semibold"
              >
                <option value="ALL">All Stages</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Follow-up Scheduled">Follow-up Scheduled</option>
                <option value="Application Submitted">Application Submitted</option>
                <option value="Closed Won">Closed Won</option>
              </select>
            )}
          </div>

          {/* Sub-Tab 1: B2B Corporate Accounts */}
          {b2bSubTab === 'CORPORATE_ACCOUNTS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCorporate.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between hover:border-red-300 transition"
                  >
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-red-800 text-[11px]">
                          {app.referenceId}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          {app.status}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 leading-snug">
                        {app.businessName}
                      </h3>

                      <div className="space-y-1 text-slate-600">
                        <div>
                          <span className="text-slate-500">Contact:</span>{' '}
                          <span className="font-semibold text-slate-800">{app.contactName}</span> (
                          <span className="font-mono">{app.contactPhone}</span>)
                        </div>
                        <div>
                          <span className="text-slate-500">Category:</span>{' '}
                          <span className="font-medium text-slate-800">{app.category}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Monthly Volume:</span>{' '}
                          <span className="font-bold text-blue-700">{app.monthlyVolumeEstimate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Routed Hub:</span>{' '}
                          <span className="font-medium text-slate-800">{app.officeName}</span> (PIN {app.targetPincode})
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500">Speed Post BNPL / COD</span>
                      <a
                        href={`https://api.whatsapp.com/send?phone=91${app.contactPhone.replace(/\D/g, '')}&text=Namaste%20${encodeURIComponent(
                          app.contactName
                        )},%20this%20is%20Department%20of%20Post%20Bulk%20Parcel%20Desk.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5"
                      >
                        <MessageCircle size={13} />
                        <span>WhatsApp Desk</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCorporate.length === 0 && (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2 text-xs">
                  <Package size={28} className="text-slate-400 mx-auto" />
                  <div className="font-bold text-slate-700">No B2B Corporate Accounts Found</div>
                  <p className="text-slate-500">
                    Corporate postal accounts and bulk parcel contracts will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 2: Postal Marketing & Revenue Agents */}
          {b2bSubTab === 'MARKETING_AGENTS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAgents.map((ag) => (
                  <div
                    key={ag.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-red-300 transition text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono font-bold text-red-800 text-[11px]">
                          {ag.agentCode}
                        </span>
                        <h3 className="text-base font-black text-slate-900 mt-0.5">
                          {ag.name}
                        </h3>
                        <div className="text-[11px] text-slate-500 font-medium">{ag.designation}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-black text-[10px] shrink-0">
                        {ag.tier}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                      <div>
                        <div className="text-slate-500">Assigned Office / Hub:</div>
                        <div className="font-bold text-slate-800 mt-0.5">{ag.officeName}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Territory Jurisdiction:</div>
                        <div className="font-medium text-slate-800 mt-0.5">{ag.managedTerritory}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Corporate Accounts:</div>
                        <div className="font-bold text-blue-700 text-sm mt-0.5">
                          {ag.activeCorporateAccounts} Active Shippers
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500">Monthly Revenue Driver:</div>
                        <div className="font-black text-emerald-800 text-sm mt-0.5 font-mono">
                          ₹{ag.monthlyRevenueInr.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="font-mono text-slate-600">{ag.contactNumber}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {ag.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Pipeline Leads */}
          {b2bSubTab === 'LEADS' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Lead / Business</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Product / Service</th>
                      <th className="p-3">Pincode Hub</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Stage</th>
                      <th className="p-3 text-right">Quick CRM Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeads.map((ld) => {
                      const isConverted = String(ld.stage || '').toLowerCase().includes('converted') || String(ld.stage || '').toLowerCase().includes('won');
                      return (
                        <tr key={ld.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3 font-bold text-slate-900">{ld.customerName}</td>
                          <td className="p-3 font-mono">{ld.customerMobile}</td>
                          <td className="p-3 text-slate-700 font-medium">{ld.productName}</td>
                          <td className="p-3 text-slate-700">
                            {ld.postOfficeName} (PIN {ld.pincode})
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                ld.priority === 'Urgent'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {ld.priority}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold text-[10px]">
                              {ld.stage}
                            </span>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickScheduleFollowUp({
                                  customerId: ld.customerId || ld.id,
                                  customerName: ld.customerName,
                                  customerMobile: ld.customerMobile,
                                  beatNo: ld.beatNo,
                                  productName: ld.productName,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-[11px] cursor-pointer"
                            >
                              + Task / Follow-Up
                            </button>
                            {!isConverted && (
                              <button
                                type="button"
                                onClick={() => handleQuickConvertLead(ld)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] cursor-pointer"
                              >
                                Convert to Customer
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredLeads.length === 0 && (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2 text-xs">
                  <Briefcase size={28} className="text-slate-400 mx-auto" />
                  <div className="font-bold text-slate-700">No Pipeline Leads Found</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Staff Detail Inspection Modal */}
      {selectedStaffForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="space-y-0.5">
                <div className="font-mono text-red-700 font-bold uppercase text-[10px]">
                  Official Staff Profile · {selectedStaffForModal.employeeId || selectedStaffForModal.id}
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedStaffForModal.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStaffForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl">
              <div>
                <div className="text-slate-500">Official Designation:</div>
                <div className="font-bold text-slate-800">{selectedStaffForModal.role}</div>
              </div>
              <div>
                <div className="text-slate-500">Duty Category:</div>
                <div className="font-bold text-red-700">
                  {selectedStaffForModal.postCategory || 'Delivery'}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Assigned Post Office:</div>
                <div className="font-medium text-slate-800">{selectedStaffForModal.assignedOffice}</div>
              </div>
              <div>
                <div className="text-slate-500">PIN Code:</div>
                <div className="font-mono font-bold text-slate-800">{selectedStaffForModal.pincode}</div>
              </div>
              <div>
                <div className="text-slate-500">Assigned Beat:</div>
                <div className="font-bold text-amber-800">{selectedStaffForModal.beat || 'Beat 1'}</div>
              </div>
              <div>
                <div className="text-slate-500">Status:</div>
                <div className="font-bold text-emerald-700">{selectedStaffForModal.status || 'Active on Duty'}</div>
              </div>
              <div>
                <div className="text-slate-500">Mobile Contact:</div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-800">{selectedStaffForModal.contact}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedStaffForModal.contact)}
                    className="text-slate-400 hover:text-red-700 cursor-pointer"
                    title="Copy mobile number"
                  >
                    {copiedText === selectedStaffForModal.contact ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
              <div>
                <div className="text-slate-500">Official Email:</div>
                <div className="font-medium text-slate-800 truncate">{selectedStaffForModal.email}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedStaffForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer & Linked Property Inspection Modal */}
      {selectedCustForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="space-y-0.5">
                <div className="font-mono text-red-700 font-bold uppercase text-[10px]">
                  Verified Citizen &amp; Property Record · {selectedCustForModal.propertyId || selectedCustForModal.id}
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedCustForModal.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl">
              <div>
                <div className="text-slate-500">Mobile Contact:</div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-800">{selectedCustForModal.mobile}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedCustForModal.mobile)}
                    className="text-slate-400 hover:text-red-700 cursor-pointer"
                    title="Copy mobile number"
                  >
                    {copiedText === selectedCustForModal.mobile ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
              <div>
                <div className="text-slate-500">Assigned Beat &amp; PIN:</div>
                <div className="font-bold text-amber-800">
                  {selectedCustForModal.beatNo} · PIN {selectedCustForModal.pincode}
                </div>
              </div>
              <div>
                <div className="text-slate-500">House / Plot No:</div>
                <div className="font-bold text-slate-800">{selectedCustForModal.houseNo || 'Plot Verified'}</div>
              </div>
              <div>
                <div className="text-slate-500">Colony / Area:</div>
                <div className="font-medium text-slate-800">
                  {selectedCustForModal.colony || selectedCustForModal.area || 'Dadabari'}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Active Scheme:</div>
                <div className="font-bold text-blue-700">
                  {selectedCustForModal.activeScheme || 'Postal Savings / IPPB'}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Verification Status:</div>
                <div className="font-bold text-emerald-700">
                  {selectedCustForModal.verificationStatus || 'Verified Citizen'}
                </div>
              </div>
              {selectedCustForModal.interestedServiceTags &&
                selectedCustForModal.interestedServiceTags.length > 0 && (
                  <div className="col-span-2 pt-2 border-t border-slate-200">
                    <div className="text-slate-500 mb-1">Interested Postal Service Tags:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCustForModal.interestedServiceTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              {(selectedCustForModal.staffAttribution ||
                selectedCustForModal.submittedByStaffId ||
                selectedCustForModal.enteredByName ||
                selectedCustForModal.assignedStaffName) && (
                <div className="col-span-2 pt-2 border-t border-slate-200">
                  <div className="text-slate-500 mb-0.5">Submitted / Verified By Staff:</div>
                  <StaffAttributionLink
                    attribution={selectedCustForModal.staffAttribution}
                    staffId={selectedCustForModal.submittedByStaffId || selectedCustForModal.assignedStaffId}
                    fallbackName={selectedCustForModal.enteredByName || selectedCustForModal.assignedStaffName}
                    compact
                  />
                </div>
              )}
            </div>

            {/* Search Console Duplicate & Mandatory Remark Update Section */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200">
              <SearchConsoleDuplicatePanel
                entityType="CUSTOMER"
                customerCheck={selectedCustDupCheck}
                remark={custModalRemark}
                onRemarkChange={setCustModalRemark}
                forceShowRemark
                layer1Ok={Boolean(selectedCustForModal.name && selectedCustForModal.mobile)}
                layer2Ok={Boolean(staffPermissionService.getActiveSession())}
                layer2Reason="Active authenticated staff session is required to re-verify or update master records."
              />

              {custModalError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
                  {custModalError}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setCustModalError(null);
                    const activeProfile = staffPermissionService.getActiveSession();
                    const res = commonDataCentreService.verifyAndCommitCustomer(
                      activeProfile,
                      {
                        ...selectedCustForModal,
                        verificationStatus: 'Field Confirmed',
                        remarks: custModalRemark,
                      },
                      {
                        remark: custModalRemark,
                        isIntentionalEdit: true,
                        source: 'Master Search Console Re-Verification',
                      }
                    );
                    if (!res.success || !res.data) {
                      setCustModalError(res.error || 'Three-Layer Verification failed.');
                      return;
                    }
                    setSelectedCustForModal(res.data);
                    setRefreshTick((t) => t + 1);
                    showActionToast(
                      'ok',
                      `3-Layer Verified: "${res.data.name}" synced across Common Data Centre with Remark.`
                    );
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                >
                  Verify &amp; Sync Remark to Master Store
                </button>
              </div>
            </div>

            <div className="pt-2 space-y-2 border-t border-slate-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={quickTaskNote}
                  onChange={(e) => setQuickTaskNote(e.target.value)}
                  placeholder="Optional follow-up / doorstep task instruction..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    handleQuickScheduleFollowUp({
                      customerId: selectedCustForModal.id,
                      customerName: selectedCustForModal.name,
                      customerMobile: selectedCustForModal.mobile,
                      beatNo: selectedCustForModal.beatNo,
                      productName: selectedCustForModal.activeScheme || 'Citizen Visit',
                      note: quickTaskNote,
                    });
                    setSelectedCustForModal(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-red-800 hover:bg-red-900 text-white font-bold whitespace-nowrap cursor-pointer"
                >
                  Create Task &amp; Follow-Up
                </button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <a
                  href={`https://api.whatsapp.com/send?phone=91${selectedCustForModal.mobile.replace(/\D/g, '')}&text=Namaste%20${encodeURIComponent(
                    selectedCustForModal.name
                  )},%20this%20is%20Department%20of%20Post%20(${selectedCustForModal.pincode}).`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp Citizen</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedCustForModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProductForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-red-700 font-bold uppercase text-[10px]">
                  Scheme Specifications · {selectedProductForModal.code}
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedProductForModal.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed">{selectedProductForModal.description}</p>

            <div className="space-y-2 bg-slate-50 p-4 rounded-xl">
              <div className="flex justify-between">
                <span className="text-slate-500">Interest / Bonus Rate:</span>
                <span className="font-bold text-emerald-800 font-mono">
                  {selectedProductForModal.interestRateOrBonus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tenure / Maturity:</span>
                <span className="font-medium text-slate-800">{selectedProductForModal.tenure}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax Exemption:</span>
                <span className="font-bold text-blue-700">{selectedProductForModal.taxBenefits}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedProductForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
