import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  CheckSquare,
  Clock,
  Edit3,
  Eye,
  EyeOff,
  LayoutGrid,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Square,
  Trash2,
  TrendingUp,
  UserPlus,
  Wallet,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { staffPermissionService } from '../../services/staffPermissionService';
import { customerService } from '../../services/customerService';
import {
  indiaPostBulkShowcaseService,
  SHOWCASE_ASSET_OPTIONS,
  PostalServiceOffering,
  DEFAULT_POSTAL_OFFERINGS,
  POSTAL_OFFERINGS_STORAGE_KEY,
  inferServiceTagsForProduct,
} from '../../services/indiaPostBulkShowcaseService';
import {
  DynamicOfficeRecord,
  FollowUp,
  IndiaPostBulkCustomer,
  IndiaPostPromotedProduct,
  Lead,
} from '../../types/models';

export type { PostalServiceOffering };

interface DispatchBagItem {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  category: string;
  unitPrice: number;
  priceDisplay: string;
  quantity: number;
  sourceType: 'BULK_PROMOTED' | 'SHOWCASE_OFFERING';
  sla: string;
  pincode: string;
  imageUrl?: string;
}

const CATEGORY_PILLS = [
  { id: 'ALL', label: 'All Catalog' },
  { id: 'BULK_PRODUCTS', label: 'Bulk Promoted Products' },
  { id: 'Banking & FinTech', label: 'Banking & FinTech' },
  { id: 'Identity & Citizen Services', label: 'Identity & Citizen' },
  { id: 'Mail & Logistics', label: 'Mail & Logistics' },
  { id: 'Sovereign Savings & Insurance', label: 'Savings & Insurance' },
] as const;

export default function IndiaPostStorefrontView() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'STOREFRONT' | 'MEMBER_DASHBOARD' | 'BULK_SHOWCASE'>(
    'STOREFRONT'
  );

  // Offices
  const [offices, setOffices] = useState<DynamicOfficeRecord[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>(
    () => userProfile?.officeId || userProfile?.officePincode || 'DADABARI_SO'
  );

  // Postal Offerings
  const [offerings, setOfferings] = useState<PostalServiceOffering[]>(() => {
    try {
      const saved = localStorage.getItem(POSTAL_OFFERINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_POSTAL_OFFERINGS;
  });

  // Search, Category & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'FEATURED' | 'PRICE_ASC' | 'PRICE_DESC'>('FEATURED');

  // CRM State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  // Notices
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  // Bulk Customers & Promoted Products
  const [bulkCustomers, setBulkCustomers] = useState<IndiaPostBulkCustomer[]>(() =>
    indiaPostBulkShowcaseService.getBulkCustomers(true)
  );
  const [promotedProducts, setPromotedProducts] = useState<IndiaPostPromotedProduct[]>(() =>
    indiaPostBulkShowcaseService.getPromotedProducts(true)
  );
  const [bulkSearch, setBulkSearch] = useState('');

  // Quick View & Dispatch Bag Drawer
  const [quickViewProduct, setQuickViewProduct] = useState<IndiaPostPromotedProduct | null>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [bagItems, setBagItems] = useState<DispatchBagItem[]>([]);
  const [bagCustomerName, setBagCustomerName] = useState('');
  const [bagMobile, setBagMobile] = useState('');
  const [bagColony, setBagColony] = useState('');
  const [bagNotes, setBagNotes] = useState('');
  const [bagError, setBagError] = useState<string | null>(null);

  // Bulk Customer & Promoted Product Admin Modals
  const [showBulkCustModal, setShowBulkCustModal] = useState(false);
  const [bcBusinessName, setBcBusinessName] = useState('');
  const [bcCategory, setBcCategory] = useState('Books & Study Material');
  const [bcPincode, setBcPincode] = useState('324009');
  const [bcBeatNo, setBcBeatNo] = useState('Beat 2');
  const [bcContactPerson, setBcContactPerson] = useState('');
  const [bcTagline, setBcTagline] = useState('');

  const [showPromoProdModal, setShowPromoProdModal] = useState(false);
  const [ppTitle, setPpTitle] = useState('');
  const [ppBulkCustId, setPpBulkCustId] = useState(
    () => indiaPostBulkShowcaseService.getBulkCustomers(true)[0]?.id || 'BULK-KOTA-01'
  );
  const [ppPriceDisplay, setPpPriceDisplay] = useState('₹999');
  const [ppRetailPrice, setPpRetailPrice] = useState(999);
  const [ppBulkOffer, setPpBulkOffer] = useState('BNPL contract rates on 15+ units via Speed Post');
  const [ppImageUrl, setPpImageUrl] = useState(SHOWCASE_ASSET_OPTIONS[0].url);
  const [ppDescription, setPpDescription] = useState('');

  // Lead Funnel Modal
  const [leadModalOffering, setLeadModalOffering] = useState<PostalServiceOffering | null>(null);
  const [lfCitizenName, setLfCitizenName] = useState('');
  const [lfMobile, setLfMobile] = useState('');
  const [lfAddress, setLfAddress] = useState('');
  const [lfColony, setLfColony] = useState('');
  const [lfBeat, setLfBeat] = useState('Beat 2');
  const [lfPincode, setLfPincode] = useState('324009');
  const [lfPreferredDate, setLfPreferredDate] = useState('');
  const [lfInitialAmount, setLfInitialAmount] = useState('');
  const [lfNotes, setLfNotes] = useState('');

  // Add / Edit Offering Modals
  const [showAddOfferingModal, setShowAddOfferingModal] = useState(false);
  const [newOffName, setNewOffName] = useState('');
  const [newOffCategory, setNewOffCategory] =
    useState<PostalServiceOffering['category']>('Banking & FinTech');
  const [newOffDesc, setNewOffDesc] = useState('');
  const [newOffCommission, setNewOffCommission] = useState('₹35 per transaction');
  const [newOffCommissionNum, setNewOffCommissionNum] = useState(35);
  const [newOffSla, setNewOffSla] = useState('Within 24 hours');
  const [newOffMin] = useState('₹100');
  const [editingOffering, setEditingOffering] = useState<PostalServiceOffering | null>(null);

  const refreshAllData = () => {
    const allOffices = staffPermissionService.getDynamicOffices();
    setOffices(allOffices);
    setLeads(customerService.getScopedLeads(userProfile));
    setFollowUps(customerService.getScopedFollowUps(userProfile));
    const allTasks = customerService.getTasks();
    setTasks(
      staffPermissionService.isSuperAdmin(userProfile)
        ? allTasks
        : allTasks.filter((t) => staffPermissionService.matchesUserBeatScope(userProfile, t as any))
    );
    setBulkCustomers(indiaPostBulkShowcaseService.getBulkCustomers(true));
    setPromotedProducts(indiaPostBulkShowcaseService.getPromotedProducts(true));
  };

  useEffect(() => {
    refreshAllData();
    const unsubPerms = staffPermissionService.subscribe(refreshAllData);
    const unsubCust = customerService.subscribe(refreshAllData);
    const unsubBulk = indiaPostBulkShowcaseService.subscribe(refreshAllData);
    return () => {
      unsubPerms();
      unsubCust();
      unsubBulk();
    };
  }, [userProfile]);

  const saveOfferingsToStorage = (updated: PostalServiceOffering[]) => {
    setOfferings(updated);
    try {
      localStorage.setItem(POSTAL_OFFERINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage quota
    }
  };

  const showSuccessNotice = (msg: string) => {
    setBannerMessage(msg);
    setTimeout(() => setBannerMessage(null), 5000);
  };

  const currentOffice = useMemo(() => {
    return (
      offices.find(
        (o) =>
          o.id === selectedOfficeId ||
          o.officeId === selectedOfficeId ||
          o.officeName.toLowerCase().includes(selectedOfficeId.toLowerCase())
      ) ||
      offices[0] ||
      null
    );
  }, [offices, selectedOfficeId]);

  useEffect(() => {
    if (currentOffice) {
      setLfPincode(currentOffice.pincode || '324009');
      if (currentOffice.mappedBeats?.length) {
        setLfBeat(currentOffice.mappedBeats[0]);
      }
      if (currentOffice.mappedColonies?.length) {
        setLfColony(currentOffice.mappedColonies[0]);
        setBagColony(currentOffice.mappedColonies[0]);
      }
    }
  }, [currentOffice]);

  const filteredProducts = useMemo(() => {
    if (
      categoryFilter !== 'ALL' &&
      categoryFilter !== 'BULK_PRODUCTS'
    ) {
      return [];
    }
    const q = searchQuery.trim().toLowerCase();
    const list = promotedProducts.filter((p) => {
      if (!p.isActive) return false;
      if (!q) return true;
      return `${p.title} ${p.bulkCustomerName} ${p.category} ${p.pincode} ${p.sku} ${p.description}`
        .toLowerCase()
        .includes(q);
    });
    if (sortOrder === 'PRICE_ASC') {
      return [...list].sort((a, b) => (a.retailPrice || 0) - (b.retailPrice || 0));
    }
    if (sortOrder === 'PRICE_DESC') {
      return [...list].sort((a, b) => (b.retailPrice || 0) - (a.retailPrice || 0));
    }
    return [...list].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  }, [promotedProducts, categoryFilter, searchQuery, sortOrder]);

  const filteredOfferings = useMemo(() => {
    if (categoryFilter === 'BULK_PRODUCTS') return [];
    return offerings.filter((off) => {
      if (categoryFilter !== 'ALL' && off.category !== categoryFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        off.name.toLowerCase().includes(q) ||
        off.description.toLowerCase().includes(q) ||
        off.code.toLowerCase().includes(q) ||
        off.category.toLowerCase().includes(q)
      );
    });
  }, [offerings, categoryFilter, searchQuery]);

  const featuredHeroProduct = useMemo(() => {
    return (
      promotedProducts.find((p) => p.isActive && p.isFeatured) ||
      promotedProducts.find((p) => p.isActive) ||
      null
    );
  }, [promotedProducts]);

  // Bag actions
  const addPromotedProductToBag = (prod: IndiaPostPromotedProduct) => {
    setBagItems((prev) => {
      const existing = prev.find((i) => i.id === prod.id);
      if (existing) {
        return prev.map((i) => (i.id === prod.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        {
          id: prod.id,
          code: prod.sku,
          title: prod.title,
          subtitle: prod.bulkCustomerName,
          category: prod.category,
          unitPrice: prod.retailPrice || 500,
          priceDisplay: prod.priceDisplay || `₹${prod.retailPrice || 500}`,
          quantity: 1,
          sourceType: 'BULK_PROMOTED',
          sla: prod.beatCoverage || 'Speed Post Dispatch',
          pincode: prod.pincode,
          imageUrl: prod.imageUrl,
        },
      ];
    });
    setBagOpen(true);
  };

  const addOfferingToBag = (off: PostalServiceOffering) => {
    setBagItems((prev) => {
      const existing = prev.find((i) => i.id === off.id);
      if (existing) {
        return prev.map((i) => (i.id === off.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      const numericVal = Number((off.minAmount || '').replace(/[^\d]/g, '')) || 500;
      return [
        ...prev,
        {
          id: off.id,
          code: off.code,
          title: off.name,
          subtitle: off.category,
          category: off.category,
          unitPrice: numericVal,
          priceDisplay: off.minAmount || `₹${numericVal}`,
          quantity: 1,
          sourceType: 'SHOWCASE_OFFERING',
          sla: off.sla,
          pincode: currentOffice?.pincode || '324009',
        },
      ];
    });
    setBagOpen(true);
  };

  const updateBagQuantity = (id: string, delta: number) => {
    setBagItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const totalBagCount = useMemo(
    () => bagItems.reduce((sum, item) => sum + item.quantity, 0),
    [bagItems]
  );

  const totalBagValue = useMemo(
    () => bagItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [bagItems]
  );

  const handleCheckoutBagAsLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (bagItems.length === 0) return;
    const cleanName = bagCustomerName.trim();
    const cleanMobile = bagMobile.replace(/\D/g, '').slice(-10);
    if (!cleanName || cleanMobile.length < 10) {
      setBagError('Enter citizen / bulk buyer name and a valid 10-digit mobile number.');
      return;
    }
    setBagError(null);

    const resolvedPincode = userProfile?.officePincode || currentOffice?.pincode || '324009';
    const resolvedOfficeName = currentOffice?.officeName || userProfile?.subOffice || 'Dadabari S.O.';
    const resolvedBeat =
      (userProfile?.beat && userProfile.beat !== 'All Beats'
        ? userProfile.beat
        : currentOffice?.mappedBeats?.[0] || 'Beat 2'
      )
        .replace(/^Beat\s+/i, '')
        .trim() || '2';

    let linkedCustomer = customerService.getCustomerByMobile(cleanMobile);
    const derivedTags: string[] = Array.from(
      new Set<string>(
        bagItems.flatMap((item) => inferServiceTagsForProduct(`${item.code} ${item.title} ${item.category}`))
      )
    );

    if (!linkedCustomer) {
      const added = customerService.addOrUpdateCustomer(
        {
          name: cleanName,
          mobile: cleanMobile,
          colony: bagColony || currentOffice?.mappedColonies?.[0] || 'Dadabari Extension',
          area: bagColony || currentOffice?.mappedColonies?.[0] || 'Dadabari Extension',
          pincode: resolvedPincode,
          subOfficeMapping: resolvedOfficeName,
          beatNo: resolvedBeat,
          interestedServiceTags: derivedTags,
          financialInterest: derivedTags.join(', '),
          verificationStatus: 'Pending Verification',
          enteredBy: userProfile?.email,
          enteredByName: userProfile?.name,
          assignedStaffId: userProfile?.id,
          assignedStaffName: userProfile?.name,
          assignedStaffEmail: userProfile?.email,
        },
        'India Post Storefront Dispatch Bag'
      );
      linkedCustomer = added.customer;
    }

    const primary = bagItems[0];
    customerService.createLead({
      customerId: linkedCustomer.id,
      customerName: cleanName,
      customerMobile: cleanMobile,
      customerAddress: `${bagColony || 'Local Beat'}, ${resolvedOfficeName} (${resolvedPincode})`,
      productCode: primary.code,
      productName:
        bagItems.length === 1
          ? primary.title
          : `${primary.title} + ${bagItems.length - 1} more item(s)`,
      selectedProducts: bagItems.map((item) => ({
        id: item.id,
        code: item.code,
        title: item.title,
        sourceType: item.sourceType,
        category: item.category,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        sla: item.sla,
        pincode: item.pincode,
      })),
      quantity: totalBagCount,
      serviceTags: derivedTags,
      sla: primary.sla,
      requirement: bagNotes.trim()
        ? `${bagNotes.trim()} · Items: ${bagItems.map((i) => `${i.title} x${i.quantity}`).join(', ')}`
        : `Storefront Dispatch Order: ${bagItems.map((i) => `${i.title} x${i.quantity}`).join(', ')}`,
      source: 'India Post Storefront Dispatch Bag',
      sourceChannel: 'Postman Doorstep',
      sourceStaffId: userProfile?.employeeId || userProfile?.id,
      sourceStaffName: userProfile?.name,
      priority: 'High',
      leadScore: 88,
      stage: 'New',
      estimatedValue: totalBagValue,
      nextFollowUpDate: new Date().toISOString().split('T')[0],
      assignedStaffId: userProfile?.id || 'STAFF-BEAT-02',
      assignedStaffName: userProfile?.name || 'Assigned Beat Staff',
      assignedStaffEmail: userProfile?.email,
      beatNo: resolvedBeat,
      pincode: resolvedPincode,
      officeName: resolvedOfficeName,
    });

    setBagItems([]);
    setBagCustomerName('');
    setBagMobile('');
    setBagNotes('');
    setBagOpen(false);
    showSuccessNotice(
      `Dispatch inquiry for ${cleanName} (${totalBagCount} items · ₹${totalBagValue.toLocaleString('en-IN')}) logged into CRM pipeline.`
    );
    refreshAllData();
  };

  const handleToggleOfferingVisibility = (id: string) => {
    const updated = offerings.map((off) =>
      off.id === id ? { ...off, isActive: !off.isActive } : off
    );
    saveOfferingsToStorage(updated);
    showSuccessNotice('Offering visibility updated.');
  };

  const openLeadFunnel = (offering: PostalServiceOffering) => {
    setFormErrorMessage(null);
    setLeadModalOffering(offering);
    setLfCitizenName('');
    setLfMobile('');
    setLfAddress('');
    setLfInitialAmount(offering.minAmount || '');
    setLfNotes('');
    setLfBeat(
      userProfile?.beat && userProfile.beat !== 'All Beats'
        ? userProfile.beat
        : currentOffice?.mappedBeats?.[0] || 'Beat 2'
    );
    setLfPincode(userProfile?.officePincode || currentOffice?.pincode || '324009');
    setLfPreferredDate(new Date().toISOString().split('T')[0]);
  };

  const openBulkProductLeadFunnel = (prod: IndiaPostPromotedProduct) => {
    openLeadFunnel({
      id: prod.id,
      code: prod.sku,
      name: `${prod.title} (${prod.bulkCustomerName})`,
      category: 'Mail & Logistics',
      description: prod.description,
      commissionRate: prod.priceDisplay,
      commissionNumeric: prod.retailPrice > 0 ? prod.retailPrice : 500,
      isActive: prod.isActive,
      minAmount: `₹${prod.retailPrice || 500}`,
      sla: prod.beatCoverage || 'Speed Post / Business Parcel Dispatch',
      iconType: 'mail',
      highlights: [prod.bulkOfferDetails, `PIN ${prod.pincode}`],
    });
  };

  const handleSubmitLeadFunnel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadModalOffering) return;
    const cleanName = lfCitizenName.trim();
    const cleanMobile = lfMobile.replace(/\D/g, '').slice(-10);
    if (!cleanName || cleanMobile.length < 10) {
      setFormErrorMessage('Please provide citizen name and a valid 10-digit mobile number.');
      return;
    }
    setFormErrorMessage(null);

    const resolvedBeatNo =
      (lfBeat || userProfile?.beat || currentOffice?.mappedBeats?.[0] || 'Beat 2')
        .replace(/^Beat\s+/i, '')
        .trim() || '2';
    const resolvedPincode = (lfPincode || userProfile?.officePincode || currentOffice?.pincode || '324009').trim();
    const resolvedOfficeName = currentOffice?.officeName || userProfile?.subOffice || 'Dadabari S.O.';
    const numericEstValue =
      Number(lfInitialAmount.replace(/[^0-9]/g, '')) ||
      Math.max(500, leadModalOffering.commissionNumeric * 20);
    const derivedTags = inferServiceTagsForProduct(
      `${leadModalOffering.code} ${leadModalOffering.name} ${leadModalOffering.category}`
    );

    let linkedCustomer = customerService.getCustomerByMobile(cleanMobile);
    if (!linkedCustomer) {
      const addRes = customerService.addOrUpdateCustomer(
        {
          name: cleanName,
          mobile: cleanMobile,
          colony: lfColony || currentOffice?.mappedColonies?.[0] || 'Local Beat Area',
          area: lfColony || currentOffice?.mappedColonies?.[0] || 'Local Beat Area',
          pincode: resolvedPincode,
          subOfficeMapping: resolvedOfficeName,
          beatNo: resolvedBeatNo,
          interestedServiceTags: derivedTags,
          financialInterest: derivedTags.join(', '),
          verificationStatus: 'Pending Verification',
          enteredBy: userProfile?.email,
          enteredByName: userProfile?.name,
          assignedStaffId: userProfile?.id,
          assignedStaffName: userProfile?.name,
          assignedStaffEmail: userProfile?.email,
        },
        'India Post Showcase Lead'
      );
      linkedCustomer = addRes.customer;
    }

    customerService.createLead({
      customerId: linkedCustomer.id,
      customerName: cleanName,
      customerMobile: cleanMobile,
      customerAddress:
        lfAddress.trim() || `${lfColony || 'Beat Area'}, ${resolvedOfficeName} (${resolvedPincode})`,
      productCode: leadModalOffering.code,
      productName: leadModalOffering.name,
      selectedProducts: [
        {
          id: leadModalOffering.id,
          code: leadModalOffering.code,
          title: leadModalOffering.name,
          sourceType:
            leadModalOffering.id.startsWith('PROD-') || leadModalOffering.code.startsWith('IP-')
              ? 'BULK_PROMOTED'
              : 'SHOWCASE_OFFERING',
          category: leadModalOffering.category,
          unitPrice: numericEstValue,
          quantity: 1,
          commissionOrRate: leadModalOffering.commissionRate,
          sla: leadModalOffering.sla,
          pincode: resolvedPincode,
        },
      ],
      quantity: 1,
      serviceTags: derivedTags,
      commissionInfo: leadModalOffering.commissionRate,
      sla: leadModalOffering.sla,
      requirement: lfNotes.trim()
        ? `${lfNotes.trim()} (Preferred Date: ${lfPreferredDate || 'ASAP'})`
        : `India Post Showcase Inquiry for ${leadModalOffering.name}`,
      source: 'India Post Showcase',
      sourceChannel: 'Postman Doorstep',
      sourceStaffId: userProfile?.employeeId || userProfile?.id,
      sourceStaffName: userProfile?.name,
      priority: 'High',
      leadScore: 80,
      stage: lfPreferredDate ? 'Follow-up Scheduled' : 'New',
      estimatedValue: numericEstValue,
      nextFollowUpDate: lfPreferredDate || new Date().toISOString().split('T')[0],
      assignedStaffId: userProfile?.id || 'STAFF-BEAT-02',
      assignedStaffName: userProfile ? `${userProfile.name} (${userProfile.beat})` : 'Assigned Beat Staff',
      assignedStaffEmail: userProfile?.email,
      beatNo: resolvedBeatNo,
      pincode: resolvedPincode,
      officeName: resolvedOfficeName,
    });

    showSuccessNotice(
      `Lead captured for "${cleanName}" (${leadModalOffering.name}) and linked to CRM pipeline.`
    );
    setLeadModalOffering(null);
    refreshAllData();
  };

  const handleCreateOffering = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffName.trim()) return;
    const newOff: PostalServiceOffering = {
      id: `offering-${Date.now().toString().slice(-6)}`,
      code: `POST_${Date.now().toString().slice(-4)}`,
      name: newOffName.trim(),
      category: newOffCategory,
      description: newOffDesc.trim() || 'Custom localized India Post initiative.',
      commissionRate: newOffCommission.trim(),
      commissionNumeric: Number(newOffCommissionNum) || 30,
      isActive: true,
      minAmount: newOffMin.trim(),
      sla: newOffSla.trim(),
      iconType:
        newOffCategory === 'Banking & FinTech'
          ? 'bank'
          : newOffCategory === 'Mail & Logistics'
          ? 'mail'
          : 'shield',
      highlights: ['Local Beat Driven', 'Direct CRM Integration', 'Fast Turnaround'],
    };
    saveOfferingsToStorage([newOff, ...offerings]);
    showSuccessNotice(`Added new offering "${newOffName}".`);
    setShowAddOfferingModal(false);
    setNewOffName('');
    setNewOffDesc('');
  };

  const handleSaveEditedOffering = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffering) return;
    const updated = offerings.map((off) =>
      off.id === editingOffering.id ? editingOffering : off
    );
    saveOfferingsToStorage(updated);
    showSuccessNotice(`Updated details for "${editingOffering.name}".`);
    setEditingOffering(null);
  };

  const stats = useMemo(() => {
    let estimatedEarnings = 0;
    const categoryBreakdown: Record<string, number> = {
      'Banking & FinTech': 0,
      'Identity & Citizen Services': 0,
      'Mail & Logistics': 0,
      'Sovereign Savings & Insurance': 0,
    };
    leads.forEach((l) => {
      const matched = offerings.find(
        (o) =>
          o.name.toLowerCase() === (l.productOrService || '').toLowerCase() ||
          o.name.toLowerCase() === ((l as any).serviceName || '').toLowerCase()
      );
      const earned = matched ? matched.commissionNumeric : 35;
      estimatedEarnings += earned;
      const cat = matched ? matched.category : 'Banking & FinTech';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + earned;
    });
    const activeFollowUps = followUps.filter(
      (f) => f.currentStatus !== 'Completed' && f.currentStatus !== 'Cancelled'
    );
    const completedFollowUps = followUps.filter((f) => f.currentStatus === 'Completed');
    return {
      totalLeadsCount: leads.length,
      estimatedEarnings,
      categoryBreakdown,
      activeFollowUpsCount: activeFollowUps.length,
      completedFollowUpsCount: completedFollowUps.length,
    };
  }, [leads, followUps, offerings]);

  const handleUpdateFollowUpStatus = (
    followUpId: string,
    nextStatus: 'Pending' | 'Completed' | 'Overdue' | 'Rescheduled' | 'Cancelled'
  ) => {
    try {
      customerService.updateFollowUp(followUpId, { currentStatus: nextStatus });
      showSuccessNotice(`Follow-up marked as "${nextStatus}".`);
      refreshAllData();
    } catch {
      // ignore
    }
  };

  const handleToggleTask = (task: any) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      customerService.updateTask(task.id, { status: nextStatus });
      showSuccessNotice(`Task "${task.title}" marked as ${nextStatus}.`);
      refreshAllData();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 pb-14 text-slate-900">
      {/* ==================================================================== */}
      {/* STICKY TOP STOREFRONT NAVIGATION BAR                                 */}
      {/* ==================================================================== */}
      <div className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border border-slate-200/80 rounded-2xl px-4 sm:px-5 py-3 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Brand Identity + Workspace Mode Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#991B1B]">
                Developer Storefront Console · India Post
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                India Post Official Catalog &amp; Bulk Hub
              </h1>
            </div>

            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('STOREFRONT')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  activeTab === 'STOREFRONT'
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Catalog
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('BULK_SHOWCASE')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  activeTab === 'BULK_SHOWCASE'
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Bulk Registry ({promotedProducts.filter((p) => p.isActive).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('MEMBER_DASHBOARD')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  activeTab === 'MEMBER_DASHBOARD'
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                CRM &amp; Payouts
              </button>
            </div>
          </div>

          {/* Right: Inline Search + Office Selector + Bag Drawer Button */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, PIN, SKU, scheme..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900"
              />
            </div>

            <select
              value={selectedOfficeId}
              onChange={(e) => setSelectedOfficeId(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 max-w-[200px]"
            >
              {offices.map((off) => (
                <option key={off.id} value={off.id}>
                  {off.officeName} ({off.pincode})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setBagOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#991B1B] hover:bg-red-800 text-white font-bold inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <ShoppingBag size={14} />
              <span>Dispatch Bag</span>
              <span className="px-1.5 py-0.5 rounded bg-white/20 font-mono text-[11px] tabular-nums">
                {totalBagCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {bannerMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
          <span>{bannerMessage}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 1: PREMIUM STOREFRONT CATALOG                                    */}
      {/* ==================================================================== */}
      {activeTab === 'STOREFRONT' && (
        <div className="space-y-8">
          {/* Editorial 2-Column Hero */}
          {featuredHeroProduct && (
            <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-[#991B1B] font-bold">
                    {currentOffice?.officeName || 'Dadabari S.O.'} · PIN {currentOffice?.pincode || '324009'} · Verified Dispatch
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 leading-[1.12]">
                    Doorstep Postal Services &amp; Verified Bulk Shipper Catalog.
                  </h2>
                  <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
                    Browse promoted regional merchandise and official citizen banking, Speed Post, and savings offerings ready for instant beat dispatch and CRM lead capture.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => addPromotedProductToBag(featuredHeroProduct)}
                    className="px-5 py-3 rounded-xl bg-[#991B1B] hover:bg-red-800 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition"
                  >
                    <ShoppingBag size={15} />
                    <span>Add Featured Bundle ({featuredHeroProduct.priceDisplay})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddOfferingModal(true)}
                    className="px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Plus size={14} />
                    <span>New Postal Campaign</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="text-slate-500">Bulk Shippers</div>
                    <div className="text-base font-black text-slate-950 tabular-nums">
                      {bulkCustomers.filter((c) => c.isActive).length} Verified
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Catalog SKUs</div>
                    <div className="text-base font-black text-slate-950 tabular-nums">
                      {promotedProducts.filter((p) => p.isActive).length +
                        offerings.filter((o) => o.isActive).length} Active
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Pipeline Leads</div>
                    <div className="text-base font-black text-slate-950 tabular-nums">
                      {leads.length} Logged
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#F8FAFC] border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between">
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={featuredHeroProduct.imageUrl}
                    alt={featuredHeroProduct.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/90 text-white text-[10px] font-bold uppercase tracking-wider">
                    Featured Drop
                  </span>
                </div>
                <div className="p-5 flex items-center justify-between gap-4 bg-white border-t border-slate-100">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-950 text-sm truncate">
                      {featuredHeroProduct.title}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {featuredHeroProduct.bulkCustomerName} · PIN {featuredHeroProduct.pincode}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-black text-base text-[#991B1B] tabular-nums">
                      {featuredHeroProduct.priceDisplay}
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuickViewProduct(featuredHeroProduct)}
                      className="text-[11px] font-bold text-slate-700 hover:text-slate-950 underline cursor-pointer"
                    >
                      Quick View
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Category Filter + Sort Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {CATEGORY_PILLS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-slate-950 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs shrink-0">
              <SlidersHorizontal size={14} className="text-slate-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700"
              >
                <option value="FEATURED">Sort: Featured</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Promoted Bulk Products Grid (3-Column Clean Editorial Cards) */}
          {filteredProducts.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Promoted Bulk Catalog ({filteredProducts.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('BULK_SHOWCASE')}
                  className="text-xs font-bold text-[#991B1B] hover:underline cursor-pointer"
                >
                  Manage Bulk Inventory →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => (
                  <article
                    key={prod.id}
                    className="group bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between transition hover:border-slate-300 hover:shadow-md"
                  >
                    <div>
                      <div className="aspect-[4/3] bg-[#F8FAFC] overflow-hidden relative">
                        <img
                          src={prod.imageUrl}
                          alt={prod.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                        {prod.isFeatured && (
                          <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-950/90 text-white text-[10px] font-bold uppercase tracking-wider">
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="p-5 space-y-2">
                        <div className="text-[11px] font-medium text-slate-500 truncate">
                          {prod.bulkCustomerName} · PIN {prod.pincode} · {prod.sku}
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-bold text-slate-950 text-base leading-snug line-clamp-2">
                            {prod.title}
                          </h4>
                          <span className="font-mono font-black text-base text-[#991B1B] tabular-nums shrink-0">
                            {prod.priceDisplay}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {prod.bulkOfferDetails}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setQuickViewProduct(prod)}
                        className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => addPromotedProductToBag(prod)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag size={13} />
                        <span>Add to Bag</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openBulkProductLeadFunnel(prod)}
                        className="py-2 px-3 rounded-xl bg-[#991B1B] hover:bg-red-800 text-white font-bold cursor-pointer"
                        title="Direct CRM Lead"
                      >
                        Lead
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Citizen Postal Services & Sovereign Schemes Grid */}
          {filteredOfferings.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Citizen Banking, Savings &amp; Mail Services ({filteredOfferings.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddOfferingModal(true)}
                  className="text-xs font-bold text-slate-700 hover:text-slate-950 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} /> Add Custom Service
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredOfferings.map((off) => (
                  <div
                    key={off.id}
                    className={`rounded-2xl border bg-white p-5 flex flex-col justify-between transition hover:border-slate-300 ${
                      off.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-bold uppercase tracking-wider text-[#991B1B]">
                          {off.category}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleOfferingVisibility(off.id)}
                          className="text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          {off.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                          <span>{off.isActive ? 'Live' : 'Hidden'}</span>
                        </button>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-slate-950 leading-snug">
                          {off.name}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {off.description}
                        </p>
                      </div>

                      <div className="text-[11px] text-slate-500 pt-1">
                        {off.highlights.slice(0, 2).join(' · ')} · SLA: {off.sla}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Staff Commission</span>
                        <span className="font-mono font-bold text-emerald-800">
                          {off.commissionRate}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setEditingOffering(off)}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                        title="Edit Offering"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => addOfferingToBag(off)}
                        className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold cursor-pointer"
                      >
                        + Bag
                      </button>
                      <button
                        type="button"
                        onClick={() => openLeadFunnel(off)}
                        className="flex-1 py-2 px-3 bg-[#991B1B] hover:bg-red-800 text-white rounded-xl font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <UserPlus size={13} />
                        <span>Capture Lead</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: MEMBER COMMISSION, FOLLOW-UPS & FIELD TASKS                   */}
      {/* ==================================================================== */}
      {activeTab === 'MEMBER_DASHBOARD' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Commission Earned
              </div>
              <div className="text-2xl font-black text-slate-950 font-mono tabular-nums">
                ₹{stats.estimatedEarnings.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-emerald-700 font-semibold">
                From {stats.totalLeadsCount} CRM leads
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active Follow-ups
              </div>
              <div className="text-2xl font-black text-amber-700 font-mono tabular-nums">
                {stats.activeFollowUpsCount}
              </div>
              <p className="text-xs text-slate-500">Scheduled doorstep callbacks</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Target Achievement
              </div>
              <div className="text-2xl font-black text-blue-700 font-mono tabular-nums">84%</div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '84%' }} />
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Projected Payout
              </div>
              <div className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
                ₹{(stats.estimatedEarnings + 2400).toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-500">Monthly CSI disbursement cycle</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Wallet size={16} className="text-emerald-700" />
              <span>Category Commission Breakdown</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {(Object.entries(stats.categoryBreakdown) as Array<[string, number]>).map(([cat, amount]) => (
                <div key={cat} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">
                    {cat}
                  </span>
                  <span className="text-base font-black text-slate-900 font-mono tabular-nums">
                    ₹{Number(amount).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <Clock size={16} className="text-amber-600" />
                    <span>Active CRM Follow-Ups ({followUps.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Citizen leads requiring callback, KYC, or cash collection
                  </p>
                </div>
                <Link to="/follow-ups" className="text-xs font-bold text-blue-700 hover:underline">
                  Open Full CRM →
                </Link>
              </div>
              <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[460px]">
                {followUps.map((fu) => {
                  const isDone = fu.currentStatus === 'Completed';
                  return (
                    <div
                      key={fu.id}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                        isDone ? 'bg-slate-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 text-sm">
                          {fu.customerName} ·{' '}
                          <span className="font-mono text-xs text-slate-500">{fu.currentStatus}</span>
                        </div>
                        <div className="text-slate-600">
                          {fu.nextAction || fu.remarks} · Due{' '}
                          <span className="font-mono font-bold">{fu.scheduledDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {fu.currentStatus !== 'Completed' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateFollowUpStatus(fu.id, 'Completed')}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {followUps.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No active follow-ups queued.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col space-y-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <CheckSquare size={16} className="text-blue-600" />
                <span>Assigned Field Tasks ({tasks.length})</span>
              </h3>
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[420px]">
                {tasks.map((t) => {
                  const isDone = t.status === 'Completed';
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleToggleTask(t)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 ${
                        isDone ? 'bg-slate-50 border-slate-200 opacity-60' : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <span className="mt-0.5 text-blue-600 shrink-0">
                        {isDone ? (
                          <CheckSquare size={16} className="text-emerald-600" />
                        ) : (
                          <Square size={16} />
                        )}
                      </span>
                      <div>
                        <div className={`font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {t.title}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {t.colony || t.area ? `${t.colony || t.area} · ` : ''}Target: {t.householdsTarget || 5} HHs
                        </div>
                      </div>
                    </div>
                  );
                })}
                {tasks.length === 0 && (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No active tasks assigned.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: BULK CUSTOMERS & PROMOTED PRODUCTS ADMIN                      */}
      {/* ==================================================================== */}
      {activeTab === 'BULK_SHOWCASE' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Award size={17} className="text-[#991B1B]" />
                <span>India Post Bulk Customer &amp; Product Promotion Registry</span>
              </h2>
              <p className="text-slate-600">
                Manage verified India Post Bulk / BNPL contract accounts and promoted product catalogs synced live to Storefront &amp; Short Link Showcase.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={bulkSearch}
                  onChange={(e) => setBulkSearch(e.target.value)}
                  placeholder="Filter bulk customer or PIN..."
                  className="pl-8 pr-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowBulkCustModal(true)}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Add Bulk Customer
              </button>
              <button
                type="button"
                onClick={() => setShowPromoProdModal(true)}
                className="px-4 py-2 bg-[#991B1B] hover:bg-red-800 text-white rounded-xl font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Promote Product
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900">
                  Verified Bulk Customers ({bulkCustomers.length})
                </h3>
                <span className="text-[11px] font-mono text-emerald-700 font-bold">
                  {bulkCustomers.filter((c) => c.isActive).length} Live
                </span>
              </div>
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {bulkCustomers
                  .filter((c) => {
                    const q = bulkSearch.trim().toLowerCase();
                    if (!q) return true;
                    return `${c.businessName} ${c.category} ${c.pincode} ${c.officeName} ${c.beatNo}`
                      .toLowerCase()
                      .includes(q);
                  })
                  .map((cust) => (
                    <div
                      key={cust.id}
                      className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                        cust.isActive
                          ? 'bg-slate-50/70 border-slate-200'
                          : 'bg-slate-100 border-slate-200 opacity-65'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{cust.businessName}</div>
                          <div className="text-[11px] text-slate-600">
                            {cust.category} · {cust.officeName} (PIN {cust.pincode}) · {cust.beatNo}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            indiaPostBulkShowcaseService.toggleBulkCustomerStatus(cust.id);
                            showSuccessNotice(`Updated visibility for "${cust.businessName}".`);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer shrink-0 ${
                            cust.isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-slate-200 text-slate-700 border-slate-300'
                          }`}
                        >
                          {cust.isActive ? 'Live' : 'Hidden'}
                        </button>
                      </div>
                      <p className="text-slate-600">{cust.tagline}</p>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900">
                  Promoted Products ({promotedProducts.length})
                </h3>
                <span className="text-[11px] font-mono text-[#991B1B] font-bold">
                  Synced to Catalog
                </span>
              </div>
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {promotedProducts
                  .filter((p) => {
                    const q = bulkSearch.trim().toLowerCase();
                    if (!q) return true;
                    return `${p.title} ${p.bulkCustomerName} ${p.category} ${p.pincode}`
                      .toLowerCase()
                      .includes(q);
                  })
                  .map((prod) => (
                    <div
                      key={prod.id}
                      className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                        prod.isActive
                          ? 'bg-white border-slate-200'
                          : 'bg-slate-100 border-slate-200 opacity-65'
                      }`}
                    >
                      <img
                        src={prod.imageUrl}
                        alt={prod.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold text-slate-900 leading-snug">{prod.title}</div>
                          <span className="font-mono font-black text-[#991B1B] shrink-0">
                            {prod.priceDisplay}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 truncate">
                          {prod.bulkCustomerName} · PIN {prod.pincode}
                        </div>
                        <div className="pt-1 flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono text-slate-500">{prod.sku}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openBulkProductLeadFunnel(prod)}
                              className="px-2.5 py-1 rounded-lg bg-[#991B1B] hover:bg-red-800 text-white text-[10px] font-bold cursor-pointer"
                            >
                              + Lead
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                indiaPostBulkShowcaseService.togglePromotedProductStatus(prod.id);
                                showSuccessNotice(`Updated status for "${prod.title}".`);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                                prod.isActive
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-slate-200 text-slate-700 border-slate-300'
                              }`}
                            >
                              {prod.isActive ? 'Live' : 'Paused'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SLIDE-OVER DISPATCH / INQUIRY BAG DRAWER                             */}
      {/* ==================================================================== */}
      {bagOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-950">Dispatch &amp; Inquiry Bag</h3>
                <p className="text-xs text-slate-500">
                  Submit bundled offerings or promoted SKUs as one verified CRM lead.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBagOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {bagItems.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <ShoppingBag size={28} className="mx-auto text-slate-300" />
                  <p className="font-semibold text-slate-700">Your dispatch bag is empty</p>
                  <p>Add promoted products or postal services from the catalog.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {bagItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-slate-200 flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-slate-950 truncate">{item.title}</div>
                          <div className="text-[11px] text-slate-500">
                            {item.subtitle} · {item.priceDisplay}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateBagQuantity(item.id, -1)}
                            className="w-6 h-6 rounded border border-slate-300 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center font-mono font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateBagQuantity(item.id, 1)}
                            className="w-6 h-6 rounded border border-slate-300 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateBagQuantity(item.id, -item.quantity)}
                            className="ml-1 p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-slate-700">
                      Estimated Dispatch Value ({totalBagCount} items)
                    </span>
                    <span className="font-mono font-black text-base text-[#991B1B] tabular-nums">
                      ₹{totalBagValue.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <form onSubmit={handleCheckoutBagAsLead} className="space-y-3 pt-2 border-t border-slate-200">
                    {bagError && (
                      <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 font-semibold">
                        {bagError}
                      </div>
                    )}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Citizen / Bulk Buyer Name *
                      </label>
                      <input
                        required
                        value={bagCustomerName}
                        onChange={(e) => setBagCustomerName(e.target.value)}
                        placeholder="e.g. Rajesh Gupta"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Mobile *</label>
                        <input
                          required
                          value={bagMobile}
                          onChange={(e) => setBagMobile(e.target.value)}
                          placeholder="10-digit mobile"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Colony / Area</label>
                        <input
                          value={bagColony}
                          onChange={(e) => setBagColony(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Dispatch Notes</label>
                      <textarea
                        rows={2}
                        value={bagNotes}
                        onChange={(e) => setBagNotes(e.target.value)}
                        placeholder="Preferred pickup time, BNPL code, or doorstep delivery notes..."
                        className="w-full p-2.5 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-[#991B1B] hover:bg-red-800 text-white font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Create Multi-Item CRM Lead</span>
                      <ArrowRight size={14} />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* QUICK VIEW MODAL                                                     */}
      {/* ==================================================================== */}
      {quickViewProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden border border-slate-200 shadow-2xl grid grid-cols-1 sm:grid-cols-2">
            <div className="bg-[#F8FAFC] aspect-square sm:aspect-auto">
              <img
                src={quickViewProduct.imageUrl}
                alt={quickViewProduct.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 flex flex-col justify-between space-y-4 text-xs">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase text-[#991B1B]">
                    {quickViewProduct.sku} · PIN {quickViewProduct.pincode}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuickViewProduct(null)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-500 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
                <h3 className="text-lg font-black text-slate-950 leading-snug">
                  {quickViewProduct.title}
                </h3>
                <div className="font-mono font-black text-xl text-[#991B1B] tabular-nums">
                  {quickViewProduct.priceDisplay}
                </div>
                <p className="text-slate-600 leading-relaxed">{quickViewProduct.description}</p>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">
                    Bulk Shipper: {quickViewProduct.bulkCustomerName}
                  </div>
                  <div className="text-slate-600">{quickViewProduct.bulkOfferDetails}</div>
                  <div className="text-slate-500">Coverage: {quickViewProduct.beatCoverage}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    addPromotedProductToBag(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold cursor-pointer"
                >
                  Add to Bag
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const p = quickViewProduct;
                    setQuickViewProduct(null);
                    openBulkProductLeadFunnel(p);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-[#991B1B] hover:bg-red-800 text-white font-bold cursor-pointer"
                >
                  Direct Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STRUCTURED LEAD FUNNEL MODAL                                         */}
      {/* ==================================================================== */}
      {leadModalOffering && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 bg-slate-950 text-white flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
                  Direct CRM Lead Funnel
                </div>
                <h3 className="text-base font-black mt-0.5">{leadModalOffering.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setLeadModalOffering(null)}
                className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitLeadFunnel} className="p-5 overflow-y-auto space-y-3.5 text-xs flex-1">
              {formErrorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 font-bold flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{formErrorMessage}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Citizen Full Name *</label>
                  <input
                    required
                    placeholder="e.g. Ramesh Kumar Sharma"
                    value={lfCitizenName}
                    onChange={(e) => setLfCitizenName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Contact *</label>
                  <input
                    required
                    placeholder="e.g. 9829012345"
                    value={lfMobile}
                    onChange={(e) => setLfMobile(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Colony / Locality *</label>
                  <input
                    required
                    value={lfColony}
                    onChange={(e) => setLfColony(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PIN Code *</label>
                  <input
                    required
                    value={lfPincode}
                    onChange={(e) => setLfPincode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Delivery Beat *</label>
                  <input
                    required
                    value={lfBeat}
                    onChange={(e) => setLfBeat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Visit Date</label>
                  <input
                    type="date"
                    value={lfPreferredDate}
                    onChange={(e) => setLfPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Doorstep Address Details</label>
                <input
                  value={lfAddress}
                  onChange={(e) => setLfAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Deposit / Booking Requirement</label>
                <input
                  value={lfInitialAmount}
                  onChange={(e) => setLfInitialAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Field Notes</label>
                <textarea
                  rows={2}
                  value={lfNotes}
                  onChange={(e) => setLfNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLeadModalOffering(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#991B1B] hover:bg-red-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  Submit &amp; Capture Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CUSTOM OFFERING MODAL */}
      {showAddOfferingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 bg-slate-950 text-white flex items-center justify-between">
              <h3 className="text-base font-black">Register New Postal Offering</h3>
              <button
                type="button"
                onClick={() => setShowAddOfferingModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateOffering} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Offering Name *</label>
                <input
                  required
                  value={newOffName}
                  onChange={(e) => setNewOffName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newOffCategory}
                    onChange={(e) => setNewOffCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                  >
                    <option value="Banking & FinTech">Banking &amp; FinTech</option>
                    <option value="Identity & Citizen Services">Identity &amp; Citizen Services</option>
                    <option value="Mail & Logistics">Mail &amp; Logistics</option>
                    <option value="Sovereign Savings & Insurance">Sovereign Savings &amp; Insurance</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Execution SLA</label>
                  <input
                    value={newOffSla}
                    onChange={(e) => setNewOffSla(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newOffDesc}
                  onChange={(e) => setNewOffDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Commission Label</label>
                  <input
                    value={newOffCommission}
                    onChange={(e) => setNewOffCommission(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Commission (₹)</label>
                  <input
                    type="number"
                    value={newOffCommissionNum}
                    onChange={(e) => setNewOffCommissionNum(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddOfferingModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#991B1B] text-white rounded-xl font-bold cursor-pointer"
                >
                  Save Offering
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD BULK CUSTOMER MODAL */}
      {showBulkCustModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 bg-slate-950 text-white flex items-center justify-between">
              <h3 className="text-base font-black">Register Verified Bulk Customer</h3>
              <button
                type="button"
                onClick={() => setShowBulkCustModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!bcBusinessName.trim()) return;
                const saved = indiaPostBulkShowcaseService.upsertBulkCustomer({
                  businessName: bcBusinessName.trim(),
                  category: bcCategory,
                  pincode: bcPincode.trim() || '324009',
                  beatNo: bcBeatNo.trim() || 'Beat 2',
                  contactPerson: bcContactPerson.trim() || 'Dispatch Desk',
                  tagline: bcTagline.trim() || 'Verified India Post Speed Post & Business Parcel shipper',
                });
                setPpBulkCustId(saved.id);
                setShowBulkCustModal(false);
                setBcBusinessName('');
                setBcContactPerson('');
                setBcTagline('');
                showSuccessNotice(`Added Bulk Customer "${saved.businessName}".`);
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Name *</label>
                <input
                  required
                  value={bcBusinessName}
                  onChange={(e) => setBcBusinessName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sector Category</label>
                  <select
                    value={bcCategory}
                    onChange={(e) => setBcCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                  >
                    <option value="Books & Study Material">Books &amp; Study Material</option>
                    <option value="Handloom & Textiles">Handloom &amp; Textiles</option>
                    <option value="Medical & Diagnostics">Medical &amp; Diagnostics</option>
                    <option value="Agro & Regional Goods">Agro &amp; Regional Goods</option>
                    <option value="Industrial & Packaging">Industrial &amp; Packaging</option>
                    <option value="e-Commerce & BNPL Merchant">e-Commerce &amp; BNPL Merchant</option>
                    <option value="Government & Institutional">Government &amp; Institutional</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Office PIN Code *</label>
                  <input
                    required
                    value={bcPincode}
                    onChange={(e) => setBcPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Beat</label>
                  <input
                    value={bcBeatNo}
                    onChange={(e) => setBcBeatNo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person</label>
                  <input
                    value={bcContactPerson}
                    onChange={(e) => setBcContactPerson(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Promotion Tagline</label>
                <textarea
                  rows={2}
                  value={bcTagline}
                  onChange={(e) => setBcTagline(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkCustModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#991B1B] text-white rounded-xl font-bold cursor-pointer"
                >
                  Save Bulk Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMOTE PRODUCT MODAL */}
      {showPromoProdModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 bg-[#991B1B] text-white flex items-center justify-between">
              <h3 className="text-base font-black">Promote Bulk Customer Product</h3>
              <button
                type="button"
                onClick={() => setShowPromoProdModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!ppTitle.trim()) return;
                const saved = indiaPostBulkShowcaseService.upsertPromotedProduct({
                  title: ppTitle.trim(),
                  bulkCustomerId: ppBulkCustId,
                  priceDisplay: ppPriceDisplay.trim() || `₹${ppRetailPrice}`,
                  retailPrice: Number(ppRetailPrice) || 0,
                  bulkOfferDetails: ppBulkOffer.trim(),
                  imageUrl: ppImageUrl,
                  description: ppDescription.trim() || 'Promoted via India Post Bulk Customer Showcase.',
                  isFeatured: true,
                });
                setShowPromoProdModal(false);
                setPpTitle('');
                setPpDescription('');
                showSuccessNotice(`Published "${saved.title}" to Storefront.`);
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product / Package Title *</label>
                <input
                  required
                  value={ppTitle}
                  onChange={(e) => setPpTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bulk Customer *</label>
                  <select
                    value={ppBulkCustId}
                    onChange={(e) => setPpBulkCustId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                  >
                    {bulkCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.businessName} ({c.pincode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Showcase Image</label>
                  <select
                    value={ppImageUrl}
                    onChange={(e) => setPpImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                  >
                    {SHOWCASE_ASSET_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.url}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Price</label>
                  <input
                    value={ppPriceDisplay}
                    onChange={(e) => setPpPriceDisplay(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Numeric Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={ppRetailPrice}
                    onChange={(e) => setPpRetailPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bulk / BNPL Offer</label>
                <input
                  value={ppBulkOffer}
                  onChange={(e) => setPpBulkOffer(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={ppDescription}
                  onChange={(e) => setPpDescription(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPromoProdModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#991B1B] text-white rounded-xl font-bold cursor-pointer"
                >
                  Publish to Storefront
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT OFFERING MODAL */}
      {editingOffering && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 bg-slate-950 text-white flex items-center justify-between">
              <h3 className="text-base font-black">Edit {editingOffering.name}</h3>
              <button
                type="button"
                onClick={() => setEditingOffering(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveEditedOffering} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Offering Name</label>
                <input
                  required
                  value={editingOffering.name}
                  onChange={(e) =>
                    setEditingOffering({ ...editingOffering, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingOffering.description}
                  onChange={(e) =>
                    setEditingOffering({ ...editingOffering, description: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Commission Rate</label>
                  <input
                    value={editingOffering.commissionRate}
                    onChange={(e) =>
                      setEditingOffering({ ...editingOffering, commissionRate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Numeric Amount (₹)</label>
                  <input
                    type="number"
                    value={editingOffering.commissionNumeric}
                    onChange={(e) =>
                      setEditingOffering({
                        ...editingOffering,
                        commissionNumeric: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOffering(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#991B1B] text-white rounded-xl font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
