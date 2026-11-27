import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calculator,
  CheckCircle2,
  Edit2,
  ExternalLink,
  Eye,
  EyeOff,
  Landmark,
  Layers,
  LayoutGrid,
  List,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Store,
  TrendingUp,
  UserCheck,
  Wallet,
  X,
} from 'lucide-react';
import {
  BusinessServiceCategory,
  CommercialStoreCategory,
  CommercialStoreRecord,
  ProductListingStatus,
  ProductSourceType,
  StaffProductItem,
  StoreEntityType,
} from '../../types/models';
import {
  commercialPropertyService,
  KOTA_PINCODE_ZONES,
} from '../../services/commercialPropertyService';
import {
  staffProductService,
  ALL_PRODUCT_VERTICALS,
  inferServiceCategory,
  inferSourceOwnership,
} from '../../services/staffProductService';
import {
  staffPermissionService,
  BUSINESS_SERVICE_CATEGORIES,
} from '../../services/staffPermissionService';
import { featureVisibilityService } from '../../services/featureVisibilityService';
import { aiCommercialVerificationService } from '../../services/aiCommercialVerificationService';
import { POSTAL_PRODUCTS } from '../../data/productsData';
import DynamicProductPageView, { resolveDynamicCategoryMode } from '../common/DynamicProductPageView';
import { useAuth } from '../auth/FirebaseAuthProvider';
import imgPostalCod from '../../assets/images/prod_b2b_cod_logistics_1794734840043.jpg';
import imgPostalHandloom from '../../assets/images/store_kota_handloom_1794731364865.jpg';
import imgPostalPharma from '../../assets/images/prod_b2b_pharma_wellness_1794734843342.jpg';
import imgPostalStationery from '../../assets/images/prod_b2b_stationery_coaching_1794734844056.jpg';

type EcosystemTab = 'VENDORS' | 'CATALOGS' | 'CATEGORIES' | 'COMMISSIONS';

export default function VendorProductEcosystemHub() {
  const { vendorId } = useParams<{ vendorId?: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const isCategoryManager = useMemo(
    () => staffPermissionService.isCategoryManager(userProfile),
    [userProfile]
  );
  const assignedCategories = useMemo(
    () => staffPermissionService.getAssignedCategories(userProfile),
    [userProfile]
  );
  const managedOffices = useMemo(
    () => staffPermissionService.getAutoManagedOffices(),
    []
  );

  const [visibilityTick, setVisibilityTick] = useState(0);
  const isWhiteLabel = useMemo(
    () => featureVisibilityService.isWhiteLabelPostalMode(userProfile),
    [userProfile, visibilityTick]
  );
  const strictVendorId = useMemo(
    () => featureVisibilityService.isStrictlyScopedToVendor(userProfile),
    [userProfile, visibilityTick]
  );
  const canAccessIndiaPost = useMemo(
    () => featureVisibilityService.canAccessVendorSystem(userProfile, 'INDIA_POST'),
    [userProfile, visibilityTick]
  );
  const canAccessCommercial = useMemo(
    () =>
      !isWhiteLabel &&
      strictVendorId !== 'INDIA_POST' &&
      featureVisibilityService.canAccessVendorSystem(userProfile, 'COMMERCIAL_PARTNERS'),
    [userProfile, isWhiteLabel, strictVendorId, visibilityTick]
  );
  const postalOffices = useMemo(
    () =>
      staffPermissionService
        .getDynamicOffices(userProfile)
        .filter((o) =>
          o.officeType === 'HO' ||
          o.officeType === 'SO' ||
          o.officeType === 'BO' ||
          (o.officeVariant || '').toLowerCase().includes('post')
        ),
    [userProfile, visibilityTick]
  );

  const [activeTab, setActiveTab] = useState<EcosystemTab>('VENDORS');
  const [stores, setStores] = useState<CommercialStoreRecord[]>(() =>
    commercialPropertyService.getScopedStores(userProfile)
  );
  const [products, setProducts] = useState<StaffProductItem[]>(() =>
    staffProductService.getScopedProducts(userProfile)
  );
  const [dispatches, setDispatches] = useState(() =>
    aiCommercialVerificationService.getAllDispatches()
  );

  // Drill-down selection state
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(vendorId || null);
  const [inventoryViewMode, setInventoryViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');
  const [inspectedProduct, setInspectedProduct] = useState<StaffProductItem | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [beatFilter, setBeatFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [storeTypeFilter, setStoreTypeFilter] = useState<'ALL' | StoreEntityType>('ALL');
  const [pincodeFilter, setPincodeFilter] = useState<string>('ALL');
  const [ownershipFilter, setOwnershipFilter] = useState<'ALL' | ProductSourceType>('ALL');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('ALL');
  const [listingStatusFilter, setListingStatusFilter] = useState<'ALL' | ProductListingStatus>('ALL');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Register Vendor + Brand + Product Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [vSourceOwnership, setVSourceOwnership] = useState<ProductSourceType>('VENDOR_PARTNER');
  const [vServiceCategory, setVServiceCategory] = useState<BusinessServiceCategory>('Postal & Last-Mile Logistics');
  const [vLinkedOfficeId, setVLinkedOfficeId] = useState<string>('');
  const [vListingStatus, setVListingStatus] = useState<ProductListingStatus>('Active');
  const [vStockQuantity, setVStockQuantity] = useState<number>(25);
  const [vStoreType, setVStoreType] = useState<StoreEntityType>('LOCAL_MERCHANT');
  const [vBrandName, setVBrandName] = useState('');
  const [vBrandPreset, setVBrandPreset] = useState<'QSR' | 'MART' | 'APPAREL' | 'TECH' | 'DEFAULT'>('DEFAULT');
  const [vStoreName, setVStoreName] = useState('');
  const [vOwnerName, setVOwnerName] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vCategory, setVCategory] = useState<CommercialStoreCategory>('Wholesale');
  const [vColony, setVColony] = useState('Keshavpura Sector 7');
  const [vBeatNo, setVBeatNo] = useState('Beat 2');
  const [vServiceablePincodes, setVServiceablePincodes] = useState<string[]>(['324009']);
  const [vDeliveryRadiusKm, setVDeliveryRadiusKm] = useState<number>(3);
  const [vAddress, setVAddress] = useState('');
  const [vProductTitle, setVProductTitle] = useState('');
  const [vWholesalePrice, setVWholesalePrice] = useState<number>(399);
  const [vRetailPrice, setVRetailPrice] = useState<number>(499);
  const [vCodEligible, setVCodEligible] = useState(true);

  // Quick Edit Pricing, Stock, Status & Office Modal inside Vendor / Catalog Inventory
  const [editingPriceItem, setEditingPriceItem] = useState<StaffProductItem | null>(null);
  const [editWholesale, setEditWholesale] = useState<number>(0);
  const [editRetail, setEditRetail] = useState<number>(0);
  const [editCod, setEditCod] = useState<boolean>(true);
  const [editStockQty, setEditStockQty] = useState<number>(25);
  const [editListingStatus, setEditListingStatus] = useState<ProductListingStatus>('Active');
  const [editServiceCategory, setEditServiceCategory] = useState<string>('Postal & Last-Mile Logistics');
  const [editSourceOwnership, setEditSourceOwnership] = useState<ProductSourceType>('VENDOR_PARTNER');
  const [editLinkedOfficeId, setEditLinkedOfficeId] = useState<string>('');

  // Availability Zone Editor Modal (PINcode & Beat Serviceability Matrix)
  const [editingZoneStore, setEditingZoneStore] = useState<CommercialStoreRecord | null>(null);
  const [zonePincodes, setZonePincodes] = useState<string[]>(['324009']);
  const [zoneAllBeats, setZoneAllBeats] = useState<boolean>(true);
  const [zonePrimaryBeat, setZonePrimaryBeat] = useState<string>('Beat 2');
  const [zoneRadiusKm, setZoneRadiusKm] = useState<number>(5);
  const [zoneOperationalStatus, setZoneOperationalStatus] = useState<CommercialStoreRecord['operationalStatus']>('OPERATIONAL');
  const [zoneCutoffTime, setZoneCutoffTime] = useState<string>('Same-Day Dispatch (11 AM - 8 PM)');

  // Store Monetization & Marketing Budget Editor Modal + Platform Running Cost Coverage Calculator
  const [editingMonetizationStore, setEditingMonetizationStore] = useState<CommercialStoreRecord | null>(null);
  const [monListingTier, setMonListingTier] = useState<'SPONSORED_PARTNER' | 'ACTIVE_AFFILIATE' | 'STANDARD_LISTING'>('STANDARD_LISTING');
  const [monBudgetMonthly, setMonBudgetMonthly] = useState<number>(1500);
  const [monAffiliatePct, setMonAffiliatePct] = useState<number>(15);
  const [monStorefrontEnabled, setMonStorefrontEnabled] = useState<boolean>(true);
  const [infraMonthlyCost, setInfraMonthlyCost] = useState<number>(18500);

  useEffect(() => {
    if (vendorId) {
      setSelectedVendorId(vendorId);
    }
  }, [vendorId]);

  useEffect(() => {
    const sync = () => {
      setStores(commercialPropertyService.getScopedStores(userProfile));
      setProducts(staffProductService.getScopedProducts(userProfile));
      setDispatches([...aiCommercialVerificationService.getAllDispatches()]);
      setVisibilityTick((t) => t + 1);
    };
    sync();
    const u1 = commercialPropertyService.subscribe(sync);
    const u2 = staffProductService.subscribe(sync);
    const u3 = aiCommercialVerificationService.subscribe(sync);
    const u4 = featureVisibilityService.subscribe(sync);
    return () => {
      u1();
      u2();
      u3();
      u4();
    };
  }, [userProfile]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Enrich stores with 4-factor verification, margin summary, serviceability & linked SKUs — sorted by Margin Priority
  const enrichedVendors = useMemo(() => {
    const sorted = staffProductService.sortVendorStoresByMarginPriority(stores);
    return sorted.map((store) => {
      const evalRes = aiCommercialVerificationService.evaluateStoreFourFactor(store);
      const beatMeta = commercialPropertyService.getBeatMeta(store.beatNo || 'Beat 1');
      const storeProducts = staffProductService.sortProductsByCommissionMargin(
        staffProductService.getProductsForVendorStore(store)
      );
      const marginSummary = staffProductService.getVendorCommissionSummary(store);
      const settleRef =
        store.ippbSettlementRef ||
        `IPPB-${store.pincode || '324009'}-B${beatMeta.cleanBeatNo}-${store.id.slice(-4).toUpperCase()}`;
      const serviceability = commercialPropertyService.checkStoreServiceability(
        store,
        pincodeFilter === 'ALL' ? '324009' : pincodeFilter,
        beatFilter === 'ALL' ? undefined : beatFilter
      );
      return {
        ...store,
        evaluation: evalRes,
        beatMeta,
        inventory: storeProducts,
        marginSummary,
        ippbRef: settleRef,
        serviceability,
      };
    });
  }, [stores, products, pincodeFilter, beatFilter]);

  const activeVendor = useMemo(() => {
    if (!selectedVendorId) return null;
    return enrichedVendors.find((v) => v.id === selectedVendorId) || null;
  }, [selectedVendorId, enrichedVendors]);

  const filteredVendors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enrichedVendors.filter((v) => {
      const storeOwnership = v.sourceOwnership || 'VENDOR_PARTNER';
      const matchOwnership = ownershipFilter === 'ALL' || storeOwnership === ownershipFilter;
      const storeServiceCat = v.serviceCategory || (v.category === 'eMitra/CSC' ? 'eMitra & Digital Services' : 'Retail & Partner Stores');
      const matchSvcCat =
        (serviceCategoryFilter === 'ALL' || storeServiceCat === serviceCategoryFilter) &&
        (!isCategoryManager || staffPermissionService.canManageCategory(userProfile, storeServiceCat));
      const matchType =
        storeTypeFilter === 'ALL' ||
        (storeTypeFilter === 'BRAND_FRANCHISE'
          ? v.storeType === 'BRAND_FRANCHISE'
          : storeTypeFilter === 'CIVIC_UTILITY'
          ? v.storeType === 'CIVIC_UTILITY'
          : v.storeType === 'LOCAL_MERCHANT' || !v.storeType);
      const matchBeat =
        beatFilter === 'ALL' ||
        v.beatNo === beatFilter ||
        (v.serviceableBeats || []).includes('All Beats') ||
        (v.serviceableBeats || []).includes(beatFilter);
      const matchPin =
        pincodeFilter === 'ALL' ||
        (v.serviceablePincodes && v.serviceablePincodes.length > 0
          ? v.serviceablePincodes.includes(pincodeFilter)
          : (v.pincode || '324009') === pincodeFilter);
      const matchCat = categoryFilter === 'ALL' || v.category === categoryFilter;
      const matchSearch =
        !q ||
        v.storeName.toLowerCase().includes(q) ||
        (v.brandName || '').toLowerCase().includes(q) ||
        v.ownerName.toLowerCase().includes(q) ||
        v.colony.toLowerCase().includes(q) ||
        (v.linkedOfficeName || '').toLowerCase().includes(q) ||
        v.primaryPhone.includes(q) ||
        v.beatMeta.staffName.toLowerCase().includes(q);
      return matchOwnership && matchSvcCat && matchType && matchBeat && matchPin && matchCat && matchSearch;
    });
  }, [
    enrichedVendors,
    ownershipFilter,
    serviceCategoryFilter,
    isCategoryManager,
    userProfile,
    storeTypeFilter,
    beatFilter,
    pincodeFilter,
    categoryFilter,
    searchQuery,
  ]);

  const brandStoresCount = useMemo(
    () => enrichedVendors.filter((v) => v.storeType === 'BRAND_FRANCHISE').length,
    [enrichedVendors]
  );

  const civicStoresCount = useMemo(
    () => enrichedVendors.filter((v) => v.storeType === 'CIVIC_UTILITY').length,
    [enrichedVendors]
  );

  const filteredCatalogProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const pOwnership = p.sourceOwnership || inferSourceOwnership(p);
      const pSvcCat = p.serviceCategory || inferServiceCategory(p);
      const pListingStatus: ProductListingStatus =
        p.listingStatus || (p.status === 'HIDDEN' ? 'Paused' : 'Active');

      if (ownershipFilter !== 'ALL' && pOwnership !== ownershipFilter) return false;
      if (serviceCategoryFilter !== 'ALL' && pSvcCat !== serviceCategoryFilter) return false;
      if (listingStatusFilter !== 'ALL' && pListingStatus !== listingStatusFilter) return false;
      if (isCategoryManager && !staffPermissionService.canManageCategory(userProfile, pSvcCat)) {
        return false;
      }

      const matchType =
        storeTypeFilter === 'ALL' ||
        (storeTypeFilter === 'BRAND_FRANCHISE'
          ? p.storeType === 'BRAND_FRANCHISE'
          : p.storeType !== 'BRAND_FRANCHISE');
      const matchPin =
        pincodeFilter === 'ALL' ||
        staffProductService.checkProductServiceability(p, pincodeFilter).matchedPincode;
      const matchCat = categoryFilter === 'ALL' || p.vertical === categoryFilter;
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.brandName || '').toLowerCase().includes(q) ||
        (p.vendorName || '').toLowerCase().includes(q) ||
        (p.linkedOfficeName || '').toLowerCase().includes(q);
      return matchType && matchPin && matchCat && matchSearch;
    });
  }, [
    products,
    ownershipFilter,
    serviceCategoryFilter,
    listingStatusFilter,
    isCategoryManager,
    userProfile,
    storeTypeFilter,
    pincodeFilter,
    categoryFilter,
    searchQuery,
  ]);

  // Commission, Beat Partner Payout (₹15/delivery), Affiliate (₹100/referral) & Platform Running Cost Coverage
  const commissionSummary = useMemo(() => {
    const totalDispatches = dispatches.length;
    const codTurnover = dispatches.reduce((sum, d) => sum + (d.codAmount || 0), 0);
    const beatDeliveryPayout = totalDispatches * 15; // ₹15 per successful delivery
    const estCommissionPool = dispatches.reduce((sum, d) => {
      const matchedProd = products.find((p) => p.id === d.productId || p.sku === d.productSku);
      const margin = matchedProd?.sellingMarginAmount ?? Math.round((d.codAmount || 0) * 0.18);
      return sum + margin;
    }, 0);
    const freshVendorsCount = enrichedVendors.filter(
      (v) => v.evaluation.freshnessStatus === 'FRESH_ACTIVE'
    ).length;

    const sponsoredRevenueMonthly = enrichedVendors.reduce((sum, v) => {
      if (v.isStorefrontEnabled === false) return sum;
      const tierDefault =
        v.listingTier === 'SPONSORED_PARTNER'
          ? 2500
          : v.listingTier === 'ACTIVE_AFFILIATE'
          ? 1200
          : 0;
      return sum + (v.marketingBudgetMonthly ?? tierDefault);
    }, 0);

    const estMonthlyAffiliateRevenue = enrichedVendors.reduce((sum, v) => {
      if (v.isStorefrontEnabled === false) return sum;
      const affPct = v.affiliateCommissionPercent ?? (v.listingTier === 'ACTIVE_AFFILIATE' ? 18 : 15);
      // Conservative 4 orders/month * ₹650 avg ticket per active store
      return sum + Math.round(4 * 650 * (affPct / 100));
    }, 0);

    const totalMonthlyPlatformRevenue = sponsoredRevenueMonthly + estMonthlyAffiliateRevenue;
    const coveragePct =
      infraMonthlyCost > 0 ? Math.min(250, Math.round((totalMonthlyPlatformRevenue / infraMonthlyCost) * 100)) : 100;

    return {
      totalDispatches,
      codTurnover,
      beatDeliveryPayout,
      estCommissionPool,
      freshVendorsCount,
      sponsoredRevenueMonthly,
      estMonthlyAffiliateRevenue,
      totalMonthlyPlatformRevenue,
      coveragePct,
    };
  }, [dispatches, products, enrichedVendors, infraMonthlyCost]);

  const openVendorProfile = (vendorIdToOpen: string) => {
    setSelectedVendorId(vendorIdToOpen);
    setInspectedProduct(null);
    navigate(`/vendor-ecosystem/${encodeURIComponent(vendorIdToOpen)}`);
  };

  const closeVendorProfile = () => {
    setSelectedVendorId(null);
    setInspectedProduct(null);
    navigate('/vendor-ecosystem');
  };

  const openVendorOnboardingModal = (prefillStore?: CommercialStoreRecord) => {
    const defaultCat = (assignedCategories[0] as BusinessServiceCategory) || 'Postal & Last-Mile Logistics';
    if (prefillStore) {
      setVSourceOwnership(prefillStore.sourceOwnership || 'VENDOR_PARTNER');
      setVServiceCategory((prefillStore.serviceCategory as BusinessServiceCategory) || defaultCat);
      setVLinkedOfficeId(prefillStore.linkedOfficeId || managedOffices[0]?.id || '');
      setVStoreType(prefillStore.storeType === 'BRAND_FRANCHISE' ? 'BRAND_FRANCHISE' : 'LOCAL_MERCHANT');
      setVBrandName(prefillStore.brandName || '');
      setVBrandPreset('DEFAULT');
      setVStoreName(prefillStore.storeName);
      setVOwnerName(prefillStore.ownerName);
      setVPhone(prefillStore.primaryPhone);
      setVCategory(prefillStore.category);
      setVColony(prefillStore.colony);
      setVBeatNo(prefillStore.beatNo || 'Beat 2');
      setVServiceablePincodes(
        prefillStore.serviceablePincodes && prefillStore.serviceablePincodes.length > 0
          ? prefillStore.serviceablePincodes
          : [prefillStore.pincode || '324009']
      );
      setVDeliveryRadiusKm(prefillStore.deliveryRadiusKm ?? 5);
      setVAddress(prefillStore.fullAddress);
    } else {
      setVSourceOwnership('COMPANY_HOUSE');
      setVServiceCategory(defaultCat);
      setVLinkedOfficeId(managedOffices[0]?.id || '');
      setVStoreType('LOCAL_MERCHANT');
      setVBrandName('');
      setVBrandPreset('DEFAULT');
      setVStoreName('India Post Direct Division Desk');
      setVOwnerName(userProfile?.name || 'Mahendra Kumar Meena');
      setVPhone(userProfile?.contact || '8769706002');
      setVCategory('Wholesale');
      setVColony('Dadabari');
      setVBeatNo('Beat 2');
      setVServiceablePincodes(['324009']);
      setVDeliveryRadiusKm(8);
      setVAddress('Dadabari S.O. Logistics Hub, PIN 324009');
    }
    setVListingStatus('Active');
    setVStockQuantity(25);
    setVProductTitle('');
    setVWholesalePrice(399);
    setVRetailPrice(499);
    setVCodEligible(true);
    setShowRegisterModal(true);
  };

  const toggleRegisterPincode = (pin: string) => {
    setVServiceablePincodes((prev) => {
      if (prev.includes(pin)) {
        return prev.length > 1 ? prev.filter((p) => p !== pin) : prev;
      }
      return [...prev, pin];
    });
  };

  const handleRegisterVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vProductTitle.trim()) return;
    if (vSourceOwnership === 'VENDOR_PARTNER' && !vStoreName.trim()) return;

    const safeRetail = Math.max(0, Number(vRetailPrice) || 0);
    const safeWholesale = Math.max(0, Math.min(safeRetail, Number(vWholesalePrice) || 0));
    const marginPct = safeRetail > 0 ? Math.round(((safeRetail - safeWholesale) / safeRetail) * 100) : 15;
    const presetLogoMap: Record<typeof vBrandPreset, string | undefined> = {
      QSR: imgPostalCod,
      MART: imgPostalStationery,
      APPAREL: imgPostalHandloom,
      TECH: imgPostalPharma,
      DEFAULT: undefined,
    };
    const isBrand = vStoreType === 'BRAND_FRANCHISE';
    const isHouse = vSourceOwnership === 'COMPANY_HOUSE';
    const cleanStoreName = isHouse
      ? vStoreName.trim() || 'India Post Direct Division Desk'
      : vStoreName.trim();
    const cleanBrandName = isHouse
      ? 'India Post'
      : isBrand
      ? vBrandName.trim() || cleanStoreName
      : undefined;
    const linkedOfficeObj = managedOffices.find((o) => o.id === vLinkedOfficeId);

    const result = staffProductService.registerUnifiedProductListing({
      sourceOwnership: vSourceOwnership,
      serviceCategory: vServiceCategory,
      listingStatus: vListingStatus,
      stockQuantity: Math.max(0, Number(vStockQuantity) || 0),
      linkedOfficeId: linkedOfficeObj?.id,
      linkedOfficeName: linkedOfficeObj?.officeName,
      storeName: cleanStoreName,
      ownerName: vOwnerName.trim() || (isHouse ? 'Company Catalog Operations' : 'Partner Owner'),
      phone: vPhone.trim(),
      vendorCategory: vCategory,
      colony: vColony.trim() || 'Dadabari',
      beatNo: vBeatNo,
      pincode: linkedOfficeObj?.pincode || vServiceablePincodes[0] || '324009',
      productTitle: vProductTitle.trim(),
      price: safeRetail,
      wholesalePrice: safeWholesale,
      sellingMarginPercent: marginPct,
      codEligible: vCodEligible,
      storeType: isHouse ? 'BRAND_FRANCHISE' : vStoreType,
      brandName: cleanBrandName,
      thumbnailUrl: presetLogoMap[vBrandPreset],
      serviceablePincodes: vServiceablePincodes,
      serviceableBeats: isBrand || isHouse ? ['All Beats', vBeatNo] : [vBeatNo],
      deliveryRadiusKm: vDeliveryRadiusKm,
      description: vAddress.trim()
        ? `${vProductTitle.trim()} — ${isHouse ? 'Direct House' : 'Partner'} Dispatch (${vAddress.trim()})`
        : undefined,
    });

    setShowRegisterModal(false);
    showToast(
      `Published "${vProductTitle.trim()}" (${isHouse ? 'Company House' : cleanStoreName}) under ${vServiceCategory} [${result.product.sku}].`
    );
    if (result.storeId) {
      openVendorProfile(result.storeId);
    }
  };

  const openAvailabilityEditor = (store: CommercialStoreRecord) => {
    setEditingZoneStore(store);
    setZonePincodes(
      store.serviceablePincodes && store.serviceablePincodes.length > 0
        ? store.serviceablePincodes
        : [store.pincode || '324009']
    );
    const beats = store.serviceableBeats || [];
    setZoneAllBeats(beats.length === 0 || beats.includes('All Beats'));
    setZonePrimaryBeat(store.beatNo || 'Beat 2');
    setZoneRadiusKm(store.deliveryRadiusKm ?? (store.storeType === 'BRAND_FRANCHISE' ? 5 : 3));
    setZoneOperationalStatus(store.operationalStatus || 'OPERATIONAL');
    setZoneCutoffTime(store.dispatchCutoffTime || 'Same-Day Dispatch');
  };

  const toggleZonePincode = (pin: string) => {
    setZonePincodes((prev) => {
      if (prev.includes(pin)) {
        return prev.length > 1 ? prev.filter((p) => p !== pin) : prev;
      }
      return [...prev, pin];
    });
  };

  const handleSaveZoneAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZoneStore) return;
    commercialPropertyService.updateStoreServiceability(editingZoneStore.id, {
      serviceablePincodes: zonePincodes,
      serviceableBeats: zoneAllBeats ? ['All Beats'] : [zonePrimaryBeat],
      deliveryRadiusKm: zoneRadiusKm,
      operationalStatus: zoneOperationalStatus,
      dispatchCutoffTime: zoneCutoffTime,
    });
    showToast(
      `Updated PINcode availability for ${editingZoneStore.storeName}: PINs ${zonePincodes.join(', ')} (${
        zoneAllBeats ? 'All Beats' : zonePrimaryBeat
      }).`
    );
    setEditingZoneStore(null);
  };

  const openPriceEdit = (item: StaffProductItem) => {
    setEditingPriceItem(item);
    setEditWholesale(item.wholesalePrice ?? Math.round(item.price * 0.85));
    setEditRetail(item.price);
    setEditCod(Boolean(item.codEligible));
    setEditStockQty(item.stockQuantity ?? 25);
    setEditListingStatus(item.listingStatus || (item.status === 'HIDDEN' ? 'Paused' : 'Active'));
    setEditServiceCategory(item.serviceCategory || inferServiceCategory(item));
    setEditSourceOwnership(item.sourceOwnership || inferSourceOwnership(item));
    setEditLinkedOfficeId(item.linkedOfficeId || '');
  };

  const handleSavePriceEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriceItem) return;
    const matchedOffice = managedOffices.find((o) => o.id === editLinkedOfficeId);

    if (editingPriceItem.id.startsWith('SYNTH-')) {
      const created = staffProductService.addProduct({
        ...editingPriceItem,
        price: editRetail,
        wholesalePrice: editWholesale,
        codEligible: editCod,
        stockQuantity: editStockQty,
        listingStatus: editListingStatus,
        serviceCategory: editServiceCategory,
        sourceOwnership: editSourceOwnership,
        linkedOfficeId: matchedOffice?.id,
        linkedOfficeName: matchedOffice?.officeName || editingPriceItem.linkedOfficeName,
        sellingMarginAmount: Math.max(0, editRetail - editWholesale),
        sellingMarginPercent:
          editRetail > 0 ? Math.round(((editRetail - editWholesale) / editRetail) * 100) : 0,
      });
      showToast(`Saved custom inventory SKU ${created.sku} to catalog.`);
    } else {
      staffProductService.updateProductListing(editingPriceItem.id, {
        wholesalePrice: editWholesale,
        price: editRetail,
        codEligible: editCod,
        stockQuantity: Math.max(0, Number(editStockQty) || 0),
        listingStatus: editListingStatus,
        serviceCategory: editServiceCategory,
        sourceOwnership: editSourceOwnership,
        linkedOfficeId: matchedOffice?.id || editingPriceItem.linkedOfficeId,
        linkedOfficeName: matchedOffice?.officeName || editingPriceItem.linkedOfficeName,
      });
      showToast(`Updated pricing, stock & status (${editListingStatus}) for ${editingPriceItem.title}.`);
    }
    setEditingPriceItem(null);
  };

  const handleToggleCodInline = (item: StaffProductItem) => {
    if (item.id.startsWith('SYNTH-')) {
      staffProductService.addProduct({
        ...item,
        codEligible: !item.codEligible,
      });
      showToast(`COD eligibility updated and saved for ${item.title}.`);
      return;
    }
    staffProductService.updateProductEconomics(item.id, { codEligible: !item.codEligible });
    showToast(`Speed Post COD toggled ${!item.codEligible ? 'ON' : 'OFF'} for ${item.sku}.`);
  };

  const handleToggleStorefrontListing = (store: CommercialStoreRecord) => {
    const nextEnabled = store.isStorefrontEnabled === false;
    commercialPropertyService.toggleStorefrontListing(store.id, nextEnabled);
    showToast(
      `Storefront Listing ${nextEnabled ? 'ENABLED' : 'PAUSED'} for ${store.storeName}. Live Public Marketplace synced.`
    );
  };

  const openMonetizationEditor = (store: CommercialStoreRecord) => {
    setEditingMonetizationStore(store);
    setMonListingTier(store.listingTier || (store.storeType === 'BRAND_FRANCHISE' ? 'SPONSORED_PARTNER' : 'ACTIVE_AFFILIATE'));
    setMonBudgetMonthly(store.marketingBudgetMonthly ?? (store.storeType === 'BRAND_FRANCHISE' ? 2500 : 1200));
    setMonAffiliatePct(store.affiliateCommissionPercent ?? 18);
    setMonStorefrontEnabled(store.isStorefrontEnabled !== false);
  };

  const handleSaveMonetization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMonetizationStore) return;
    commercialPropertyService.updateStoreMonetization(editingMonetizationStore.id, {
      listingTier: monListingTier,
      marketingBudgetMonthly: Math.max(0, Number(monBudgetMonthly) || 0),
      affiliateCommissionPercent: Math.max(0, Math.min(40, Number(monAffiliatePct) || 0)),
      isStorefrontEnabled: monStorefrontEnabled,
    });
    showToast(
      `Updated monetization & tier for ${editingMonetizationStore.storeName}: ₹${monBudgetMonthly}/mo · ${monAffiliatePct}% affiliate.`
    );
    setEditingMonetizationStore(null);
  };

  if (inspectedProduct) {
    return (
      <DynamicProductPageView
        storefrontProduct={inspectedProduct}
        onBack={() => setInspectedProduct(null)}
        onOpenVendorProfile={(storeId) => {
          setInspectedProduct(null);
          openVendorProfile(storeId);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 pb-10" id="vendor-product-ecosystem-hub">
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-950 text-amber-300 px-4 py-3 rounded-2xl shadow-2xl border border-amber-400/40 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP ECOSYSTEM HEADER */}
      <div className="bg-gradient-to-r from-slate-950 via-red-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
            {isWhiteLabel || strictVendorId === 'INDIA_POST'
              ? 'India Post Vendor System · White-Label Departmental Portal'
              : 'Vendor Section · Consolidated India Post & Partner Ecosystem'}
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {isWhiteLabel || strictVendorId === 'INDIA_POST'
              ? 'India Post Vendor System — Postal Operations Hub'
              : 'Vendor Section: India Post System & Partner Network'}
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {isWhiteLabel || strictVendorId === 'INDIA_POST'
              ? 'Scoped postal operations portal for Post Offices, Properties, Members, Beats, Daily Articles, Official Forms, and Departmental Learning. Zero third-party branding.'
              : 'Unified multi-vendor governance consolidating the India Post Vendor System (with strict white-label isolation) alongside commercial partner storefronts, categories, and dispatches.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {canAccessCommercial && (
            <>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <ExternalLink size={14} />
                <span>Open Public Storefront</span>
              </button>
              <button
                type="button"
                onClick={() => openVendorOnboardingModal()}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer whitespace-nowrap"
                id="ecosystem-add-vendor-btn"
              >
                <Plus size={15} />
                <span>Register Vendor &amp; SKU</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* VIBRANT COLOR-CODED GRADIENT COMMAND NAVIGATION BOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => {
            setSelectedVendorId(null);
            setActiveTab('VENDORS');
          }}
          className={`text-left rounded-2xl p-5 bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-900 text-white shadow-lg transition hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between gap-4 ${
            activeTab === 'VENDORS' && !selectedVendorId ? 'ring-2 ring-amber-300' : ''
          }`}
          id="eco-nav-vendors"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="p-2.5 rounded-xl bg-white/15 border border-white/20">
              <Store size={20} />
            </div>
            <span className="font-mono text-2xl font-black tabular-nums">{enrichedVendors.length}</span>
          </div>
          <div>
            <div className="text-sm font-black">01. Vendor &amp; Brand Roster</div>
            <p className="text-[11px] text-indigo-100 mt-0.5">
              {brandStoresCount} Brand Franchises · {commissionSummary.freshVendorsCount} 4-Factor Fresh Partners
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedVendorId(null);
            setActiveTab('CATALOGS');
          }}
          className={`text-left rounded-2xl p-5 bg-gradient-to-br from-rose-700 via-red-700 to-orange-700 text-white shadow-lg transition hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between gap-4 ${
            activeTab === 'CATALOGS' && !selectedVendorId ? 'ring-2 ring-amber-300' : ''
          }`}
          id="eco-nav-catalogs"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="p-2.5 rounded-xl bg-white/15 border border-white/20">
              <Package size={20} />
            </div>
            <span className="font-mono text-2xl font-black tabular-nums">
              {products.length + POSTAL_PRODUCTS.length}
            </span>
          </div>
          <div>
            <div className="text-sm font-black">02. Product Catalogs &amp; SKUs</div>
            <p className="text-[11px] text-rose-100 mt-0.5">
              {products.length} Storefront SKUs + {POSTAL_PRODUCTS.length} Sovereign Schemes
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedVendorId(null);
            setActiveTab('CATEGORIES');
          }}
          className={`text-left rounded-2xl p-5 bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-800 text-white shadow-lg transition hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between gap-4 ${
            activeTab === 'CATEGORIES' && !selectedVendorId ? 'ring-2 ring-amber-300' : ''
          }`}
          id="eco-nav-categories"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="p-2.5 rounded-xl bg-white/15 border border-white/20">
              <Layers size={20} />
            </div>
            <span className="font-mono text-2xl font-black tabular-nums">3 Modes</span>
          </div>
          <div>
            <div className="text-sm font-black">03. Category Manager &amp; Templates</div>
            <p className="text-[11px] text-emerald-100 mt-0.5">
              Banking Calculators · Retail Speed Post · B2B Wholesale Pages
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedVendorId(null);
            setActiveTab('COMMISSIONS');
          }}
          className={`text-left rounded-2xl p-5 bg-gradient-to-br from-amber-600 via-orange-700 to-slate-900 text-white shadow-lg transition hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between gap-4 ${
            activeTab === 'COMMISSIONS' && !selectedVendorId ? 'ring-2 ring-amber-300' : ''
          }`}
          id="eco-nav-commissions"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="p-2.5 rounded-xl bg-white/15 border border-white/20">
              <Wallet size={20} />
            </div>
            <span className="font-mono text-xl font-black tabular-nums">
              ₹{commissionSummary.estCommissionPool.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <div className="text-sm font-black">04. Commission &amp; COD Trackers</div>
            <p className="text-[11px] text-amber-100 mt-0.5">
              {commissionSummary.totalDispatches} COD Dispatches · ₹{commissionSummary.codTurnover.toLocaleString('en-IN')} Volume
            </p>
          </div>
        </button>
      </div>

      {/* =====================================================================
          VENDOR PROFILE & INVENTORY DRILL-DOWN (When a Vendor is Clicked)
         ===================================================================== */}
      {activeVendor ? (
        <section className="space-y-6" id="vendor-profile-drilldown">
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={closeVendorProfile}
                className="text-red-700 hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>All Registered Vendors</span>
              </button>
              <span aria-hidden="true">/</span>
              <span className="text-slate-900 font-black">{activeVendor.storeName}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openVendorOnboardingModal(activeVendor)}
                className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus size={14} />
                <span>Add Product to Vendor</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                {activeVendor.brandLogoUrl ? (
                  <img
                    src={activeVendor.brandLogoUrl}
                    alt={activeVendor.brandName || activeVendor.storeName}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border border-white/25 shrink-0"
                  />
                ) : activeVendor.storeType === 'BRAND_FRANCHISE' ? (
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-lg border border-white/25 shrink-0"
                    style={{ backgroundColor: activeVendor.brandAccentColor || '#b91c1c' }}
                  >
                    {activeVendor.brandMonogram || 'BR'}
                  </div>
                ) : null}

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-amber-300 font-semibold">
                    <span>
                      {activeVendor.storeType === 'BRAND_FRANCHISE'
                        ? `National / Regional Brand · ${activeVendor.brandCategoryTag || activeVendor.category}`
                        : `Local B2B Merchant · ${activeVendor.category}`}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">
                      4-Factor Score: {activeVendor.evaluation.score}/100 ({activeVendor.evaluation.freshnessStatus})
                    </span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">{activeVendor.storeName}</h2>
                  <div className="text-xs text-slate-300 flex flex-wrap items-center gap-2">
                    <span>Owner / Ops: <strong className="text-white">{activeVendor.ownerName}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Store ID: <span className="font-mono">{activeVendor.id}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => openAvailabilityEditor(activeVendor)}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <MapPin size={14} />
                  <span>Edit PIN &amp; Beat Zone</span>
                </button>
                <a
                  href={`tel:+91${activeVendor.primaryPhone || activeVendor.beatMeta.staffContact}`}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Phone size={14} className="text-amber-300" />
                  <span className="font-mono">{activeVendor.primaryPhone || activeVendor.beatMeta.staffContact}</span>
                </a>
                <a
                  href={`https://api.whatsapp.com/send?phone=91${(activeVendor.whatsappNumber || activeVendor.primaryPhone || activeVendor.beatMeta.staffContact).replace(/\D/g, '').slice(-10)}&text=${encodeURIComponent(
                    `Namaste ${activeVendor.ownerName} (${activeVendor.storeName}), connecting from India Post Dadabari S.O. (PIN 324009) regarding your ${activeVendor.beatMeta.beatNo} inventory & Speed Post COD orders.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp Vendor</span>
                </a>
                <button
                  type="button"
                  onClick={() => openMonetizationEditor(activeVendor)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <TrendingUp size={14} />
                  <span>Affiliate &amp; Tier</span>
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-50/70">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <div className="text-slate-500 font-semibold flex items-center gap-1.5">
                  <MapPin size={13} className="text-red-700" />
                  <span>Complete Store Address</span>
                </div>
                <div className="font-bold text-slate-900 leading-relaxed">
                  {activeVendor.fullAddress || `${activeVendor.blockSector}, ${activeVendor.colony}`}
                </div>
                <div className="text-slate-500">
                  Colony: {activeVendor.colony} · Sector: {activeVendor.blockSector}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <div className="text-slate-500 font-semibold flex items-center gap-1.5">
                  <UserCheck size={13} className="text-indigo-700" />
                  <span>PINcode &amp; Beat Availability Matrix</span>
                </div>
                <div className="font-mono font-black text-slate-900 text-sm">
                  PINs: {activeVendor.serviceability.serviceablePincodes.join(', ')}
                </div>
                <div className="text-slate-600">
                  Beats: <strong>{activeVendor.serviceability.serviceableBeats.join(', ')}</strong> · Radius {activeVendor.serviceability.deliveryRadiusKm} km
                </div>
                <div className="text-slate-600">
                  Manager: <strong>{activeVendor.beatMeta.staffName}</strong> ({activeVendor.beatMeta.staffContact})
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                <div className="text-slate-500 font-semibold flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-700" />
                  <span>IPPB Settlement &amp; Operational Status</span>
                </div>
                <div className="font-mono font-black text-emerald-800 text-sm tabular-nums">
                  {activeVendor.ippbRef}
                </div>
                <div className="text-slate-600">
                  Status: <strong className={activeVendor.operationalStatus === 'OPERATIONAL' ? 'text-emerald-700' : 'text-rose-700'}>{activeVendor.operationalStatus}</strong> · {activeVendor.dispatchCutoffTime || 'Same-Day Dispatch'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Vendor Product Inventory ({activeVendor.inventory.length} SKUs)
                </h3>
                <p className="text-xs text-slate-500">
                  Manage Wholesale Price, Retail Selling Price, Profit Margin, and Speed Post COD eligibility.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setInventoryViewMode('TABLE')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition ${
                      inventoryViewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    <List size={14} />
                    <span>Table View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInventoryViewMode('CARDS')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition ${
                      inventoryViewMode === 'CARDS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    <LayoutGrid size={14} />
                    <span>Card View</span>
                  </button>
                </div>
              </div>
            </div>

            {inventoryViewMode === 'TABLE' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                      <th className="py-3 pr-4">Product &amp; SKU</th>
                      <th className="py-3 px-3 text-right">Wholesale Price</th>
                      <th className="py-3 px-3 text-right">Retail Selling Price</th>
                      <th className="py-3 px-3 text-right">Profit Margin</th>
                      <th className="py-3 px-3 text-center">Speed Post COD</th>
                      <th className="py-3 pl-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeVendor.inventory.map((item) => {
                      const wholesale = item.wholesalePrice ?? Math.round(item.price * 0.85);
                      const profit = Math.max(0, item.price - wholesale);
                      const pct = item.price > 0 ? Math.round((profit / item.price) * 100) : 0;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.thumbnailUrl}
                                alt={item.title}
                                referrerPolicy="no-referrer"
                                className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900">{item.title}</div>
                                <div className="font-mono text-[11px] text-slate-500">
                                  {item.sku} · {item.vertical}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-700 tabular-nums">
                            ₹{wholesale.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900 tabular-nums">
                            ₹{item.price.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-700 tabular-nums">
                            +₹{profit.toLocaleString('en-IN')} ({pct}%)
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleCodInline(item)}
                              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer whitespace-nowrap ${
                                item.codEligible
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              {item.codEligible ? 'COD Eligible' : 'Prepaid / Pickup'}
                            </button>
                          </td>
                          <td className="py-3.5 pl-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openPriceEdit(item)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 size={12} />
                                <span>Pricing</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setInspectedProduct(item)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                              >
                                <span>Product Page</span>
                                <ArrowRight size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeVendor.inventory.map((item) => {
                  const wholesale = item.wholesalePrice ?? Math.round(item.price * 0.85);
                  const profit = Math.max(0, item.price - wholesale);
                  const pct = item.price > 0 ? Math.round((profit / item.price) * 100) : 0;

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between shadow-2xs"
                    >
                      <div>
                        <div className="aspect-[16/9] bg-slate-900 relative overflow-hidden">
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                            <span className="font-mono text-amber-300 font-bold">{item.sku}</span>
                            <span className="font-bold">
                              {item.codEligible ? 'Speed Post COD' : 'Prepaid'}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <h4 className="font-black text-sm text-slate-900 leading-snug">{item.title}</h4>
                          <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-100">
                            <div>
                              <div className="text-slate-500 text-[10px]">Wholesale</div>
                              <div className="font-mono font-bold text-slate-800 tabular-nums">₹{wholesale}</div>
                            </div>
                            <div>
                              <div className="text-slate-500 text-[10px]">Retail</div>
                              <div className="font-mono font-black text-slate-900 tabular-nums">₹{item.price}</div>
                            </div>
                            <div>
                              <div className="text-slate-500 text-[10px]">Margin</div>
                              <div className="font-mono font-black text-emerald-700 tabular-nums">
                                +₹{profit} ({pct}%)
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openPriceEdit(item)}
                          className="flex-1 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-800 cursor-pointer"
                        >
                          Edit Pricing
                        </button>
                        <button
                          type="button"
                          onClick={() => setInspectedProduct(item)}
                          className="flex-1 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-xs font-bold text-white cursor-pointer"
                        >
                          Open Page
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brands, vendors, SKU, office..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Source Ownership Toggle: Self (Company House) vs Partner / Vendor */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl font-bold">
                {[
                  { id: 'ALL', label: 'All Sources' },
                  { id: 'COMPANY_HOUSE', label: 'India Post Direct (Self)' },
                  { id: 'VENDOR_PARTNER', label: 'Partners & Vendors' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setOwnershipFilter(opt.id as any)}
                    className={`px-2.5 py-1.5 rounded-lg cursor-pointer transition ${
                      ownershipFilter === opt.id
                        ? opt.id === 'COMPANY_HOUSE'
                          ? 'bg-slate-900 text-amber-300 shadow-2xs'
                          : 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl font-bold">
                <button
                  type="button"
                  onClick={() => setStoreTypeFilter('ALL')}
                  className={`px-2.5 py-1.5 rounded-lg cursor-pointer transition ${
                    storeTypeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  All Entities
                </button>
                <button
                  type="button"
                  onClick={() => setStoreTypeFilter('BRAND_FRANCHISE')}
                  className={`px-2.5 py-1.5 rounded-lg cursor-pointer transition flex items-center gap-1 ${
                    storeTypeFilter === 'BRAND_FRANCHISE' ? 'bg-red-700 text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  <Building2 size={12} />
                  <span>Brands ({brandStoresCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStoreTypeFilter('LOCAL_MERCHANT')}
                  className={`px-2.5 py-1.5 rounded-lg cursor-pointer transition ${
                    storeTypeFilter === 'LOCAL_MERCHANT' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Local B2B
                </button>
                <button
                  type="button"
                  onClick={() => setStoreTypeFilter('CIVIC_UTILITY')}
                  className={`px-2.5 py-1.5 rounded-lg cursor-pointer transition flex items-center gap-1 ${
                    storeTypeFilter === 'CIVIC_UTILITY' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  <Landmark size={12} />
                  <span>Civic ({civicStoresCount})</span>
                </button>
              </div>

              {/* Business Service Category Filter */}
              <select
                value={serviceCategoryFilter}
                onChange={(e) => setServiceCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-indigo-50/70 border border-indigo-200 rounded-xl font-bold text-indigo-950"
              >
                <option value="ALL">
                  {isCategoryManager ? `Assigned Categories (${assignedCategories.length})` : 'All Service Categories'}
                </option>
                {(isCategoryManager ? assignedCategories : BUSINESS_SERVICE_CATEGORIES).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {activeTab === 'CATALOGS' && (
                <select
                  value={listingStatusFilter}
                  onChange={(e) => setListingStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Paused">Paused</option>
                </select>
              )}

              <select
                value={pincodeFilter}
                onChange={(e) => setPincodeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="ALL">All Kota PINcodes</option>
                {KOTA_PINCODE_ZONES.map((z) => (
                  <option key={z.pincode} value={z.pincode}>
                    PIN {z.pincode} · {z.label}
                  </option>
                ))}
              </select>

              {activeTab === 'VENDORS' && (
                <select
                  value={beatFilter}
                  onChange={(e) => setBeatFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="ALL">All 34 Beats</option>
                  {commercialPropertyService.beatDirectory.map((b) => (
                    <option key={b.beatNo} value={b.beatNo}>
                      {b.beatNo} · {b.staffName}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="ALL">All Verticals</option>
                {activeTab === 'VENDORS' ? (
                  <>
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Services">Services</option>
                    <option value="eMitra/CSC">eMitra/CSC</option>
                  </>
                ) : (
                  ALL_PRODUCT_VERTICALS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {activeTab === 'VENDORS' && (
            <div className="space-y-6">
              {/* ===================================================================== */}
              {/* CONSOLIDATED VENDOR 01: INDIA POST VENDOR SYSTEM (WHITE-LABEL)        */}
              {/* ===================================================================== */}
              {canAccessIndiaPost && (
                <section
                  id="india-post-vendor-system-card"
                  className="bg-white rounded-3xl border-2 border-red-800/30 shadow-md overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-red-900 via-red-800 to-slate-900 text-white p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <Landmark size={14} />
                        <span>Consolidated Vendor System · Strictly White-Labeled</span>
                      </div>
                      <h2 className="text-xl font-black text-white">
                        India Post Vendor System ({postalOffices.length} Post Offices · Rajasthan Circle)
                      </h2>
                      <p className="text-xs text-red-100 max-w-2xl">
                        Dedicated postal operations container housing Office Master, Beat Allocation, Property &amp; Members Registry, Daily Articles, Official Documents, Postal Schemes, and Departmental LMS—isolated from third-party commercial branding.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {featureVisibilityService.isFeatureVisible(userProfile, 'property') && (
                        <button
                          type="button"
                          onClick={() => navigate('/properties')}
                          className="px-3.5 py-2 rounded-xl bg-white text-slate-950 hover:bg-slate-100 text-xs font-black cursor-pointer"
                        >
                          Property Registry →
                        </button>
                      )}
                      {featureVisibilityService.isFeatureVisible(userProfile, 'members') && (
                        <button
                          type="button"
                          onClick={() => navigate('/customers')}
                          className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs font-black cursor-pointer"
                        >
                          Members Directory →
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs bg-slate-50/70">
                    {[
                      { label: 'Post Offices', path: '/office-master', feature: 'property' as const, meta: `${postalOffices.length} HO/SO/BO` },
                      { label: 'Beat Territory Map', path: '/beats-map', feature: 'beats' as const, meta: 'Beats & Colonies' },
                      { label: 'Daily Articles', path: '/postman-articles', feature: 'dailyOperations' as const, meta: 'Mail & DSS Logs' },
                      { label: 'Official Forms', path: '/official-documents', feature: 'officialDocuments' as const, meta: 'Charge & ACG-61' },
                      { label: 'Postal Schemes', path: '/services', feature: 'leadsAndSchemes' as const, meta: 'PLI / SSA / IPPB' },
                      { label: 'Postal LMS', path: '/postal-lms', feature: 'lms' as const, meta: 'Exam Prep' },
                    ]
                      .filter((mod) => featureVisibilityService.isFeatureVisible(userProfile, mod.feature))
                      .map((mod) => (
                        <button
                          key={mod.path}
                          type="button"
                          onClick={() => navigate(mod.path)}
                          className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-red-300 text-left transition cursor-pointer shadow-2xs"
                        >
                          <div className="font-black text-slate-900">{mod.label}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{mod.meta}</div>
                        </button>
                      ))}
                  </div>
                </section>
              )}

              {/* Platform Running Cost Coverage & Monetization Control Calculator (Hidden in White-Label / Strict INDIA_POST Mode) */}
              {canAccessCommercial && (
              <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                <div className="lg:col-span-5 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Calculator size={14} />
                    <span>Platform Running Cost Coverage Calculator</span>
                  </div>
                  <h2 className="text-lg font-black text-white">
                    Sponsored + Affiliate Revenue vs. Hosting &amp; Ops Cost
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Manage per-store visibility and monthly marketing budgets so vendor sponsorships &amp; 15%–25% affiliate margins cover cloud, API, and 34-beat dispatch infrastructure.
                  </p>
                </div>

                <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-slate-400 font-semibold">Sponsored Pool</div>
                    <div className="font-mono font-black text-amber-300 text-base tabular-nums mt-0.5">
                      ₹{commissionSummary.sponsoredRevenueMonthly.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Monthly vendor budgets</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-slate-400 font-semibold">Est. Affiliate Pool</div>
                    <div className="font-mono font-black text-emerald-400 text-base tabular-nums mt-0.5">
                      ₹{commissionSummary.estMonthlyAffiliateRevenue.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">15–25% order margin</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <label className="text-[10px] text-slate-400 font-semibold block">
                      Monthly Ops Cost (₹)
                    </label>
                    <input
                      type="number"
                      min={1000}
                      step={500}
                      value={infraMonthlyCost}
                      onChange={(e) => setInfraMonthlyCost(Math.max(1000, Number(e.target.value) || 0))}
                      className="w-full mt-1 px-2 py-1 rounded-lg bg-slate-900 border border-white/20 font-mono font-bold text-white text-xs tabular-nums"
                    />
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40">
                    <div className="text-[10px] text-emerald-300 font-semibold">Cost Coverage</div>
                    <div className="font-mono font-black text-white text-base tabular-nums mt-0.5">
                      {commissionSummary.coveragePct}%
                    </div>
                    <div className="text-[10px] text-emerald-300 mt-0.5">
                      {commissionSummary.totalMonthlyPlatformRevenue >= infraMonthlyCost ? 'Surplus Active' : 'Scaling Up'}
                    </div>
                  </div>
                </div>
              </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredVendors.map((vendor) => {
                  const phoneNumber = vendor.primaryPhone || vendor.beatMeta.staffContact;
                  const waDigits = (vendor.whatsappNumber || phoneNumber).replace(/\D/g, '').slice(-10);
                  const categoryList = vendor.marginSummary.categories.length
                    ? vendor.marginSummary.categories.join(' · ')
                    : vendor.category;
                  const isBrand = vendor.storeType === 'BRAND_FRANCHISE';
                  const isCivic = vendor.storeType === 'CIVIC_UTILITY';
                  const isListingEnabled = vendor.isStorefrontEnabled !== false;
                  const tier = vendor.listingTier || (isBrand ? 'SPONSORED_PARTNER' : 'ACTIVE_AFFILIATE');
                  const tierLabel =
                    tier === 'SPONSORED_PARTNER'
                      ? 'Sponsored Partner'
                      : tier === 'ACTIVE_AFFILIATE'
                      ? 'Active Affiliate'
                      : 'Standard Listing';
                  const budget = vendor.marketingBudgetMonthly ?? (tier === 'SPONSORED_PARTNER' ? 2500 : tier === 'ACTIVE_AFFILIATE' ? 1200 : 0);
                  const affPct = vendor.affiliateCommissionPercent ?? 18;

                  return (
                    <article
                      key={vendor.id}
                      className={`bg-white rounded-2xl border p-5 flex flex-col justify-between gap-4 shadow-2xs transition hover:shadow-lg ${
                        !isListingEnabled
                          ? 'border-slate-300 opacity-75'
                          : isBrand
                          ? 'border-red-200 hover:border-red-400'
                          : isCivic
                          ? 'border-emerald-200 hover:border-emerald-400'
                          : 'border-slate-200 hover:border-indigo-400'
                      }`}
                      id={`vendor-card-${vendor.id}`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className={`font-bold flex items-center gap-1 ${isBrand ? 'text-red-700' : isCivic ? 'text-emerald-700' : 'text-indigo-700'}`}>
                            {isCivic && <Landmark size={13} className="shrink-0" />}
                            <span>{tierLabel} · {vendor.category}</span>
                          </span>
                          <span
                            className={`font-mono font-bold tabular-nums ${
                              vendor.evaluation.freshnessStatus === 'FRESH_ACTIVE'
                                ? 'text-emerald-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {vendor.evaluation.score}/100 ·{' '}
                            {isListingEnabled ? 'Live' : 'Paused'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {vendor.brandLogoUrl ? (
                            <img
                              src={vendor.brandLogoUrl}
                              alt={vendor.brandName || vendor.storeName}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : isBrand ? (
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
                              style={{ backgroundColor: vendor.brandAccentColor || '#b91c1c' }}
                            >
                              {vendor.brandMonogram || 'BR'}
                            </div>
                          ) : null}

                          <div className="min-w-0">
                            <h3 className="text-base font-black text-slate-900 leading-snug truncate">
                              {vendor.storeName}
                            </h3>
                            <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                              {vendor.brandCategoryTag || `Categories: ${categoryList}`}
                            </div>
                          </div>
                        </div>

                        {/* Storefront Visibility Toggle & Monthly Marketing Budget */}
                        <div className="px-3 py-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-[11px] space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-indigo-950">
                              Storefront Visibility:
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleStorefrontListing(vendor)}
                              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition ${
                                isListingEnabled
                                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                                  : 'bg-slate-300 text-slate-800 hover:bg-slate-400'
                              }`}
                            >
                              {isListingEnabled ? <Eye size={12} /> : <EyeOff size={12} />}
                              <span>{isListingEnabled ? 'Enabled (Public)' : 'Disabled'}</span>
                            </button>
                          </div>
                          <div className="flex items-center justify-between gap-2 text-indigo-900">
                            <span>
                              Budget: <strong className="font-mono">₹{budget.toLocaleString('en-IN')}/mo</strong> · Aff:{' '}
                              <strong className="font-mono">{affPct}%</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => openMonetizationEditor(vendor)}
                              className="text-red-700 font-bold hover:underline cursor-pointer"
                            >
                              Edit Tier &amp; Budget
                            </button>
                          </div>
                        </div>

                        <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-700">Serviceable PINs</span>
                            <span className="font-mono font-black text-slate-900">
                              {vendor.serviceability.serviceablePincodes.join(', ')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 text-slate-600">
                            <span>Beats: {vendor.serviceability.serviceableBeats.join(', ')}</span>
                            <button
                              type="button"
                              onClick={() => openAvailabilityEditor(vendor)}
                              className="text-red-700 font-bold hover:underline cursor-pointer"
                            >
                              Edit Zone
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between gap-2">
                            <span>
                              Ops / Owner: <strong className="text-slate-900">{vendor.ownerName}</strong>
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={`tel:+91${phoneNumber}`}
                                className="font-mono font-bold text-slate-800 hover:text-red-700 underline tabular-nums"
                              >
                                {phoneNumber}
                              </a>
                              <a
                                href={`https://api.whatsapp.com/send?phone=91${waDigits}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-emerald-700 hover:underline"
                              >
                                WhatsApp
                              </a>
                            </div>
                          </div>

                          <div className="line-clamp-1 text-slate-600">
                            Address: <span className="text-slate-800">{vendor.fullAddress || `${vendor.blockSector}, ${vendor.colony}`}</span>
                          </div>

                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <span>
                              Manager: <strong className="text-red-700 font-mono">{vendor.beatMeta.beatNo}</strong> ({vendor.beatMeta.staffName})
                            </span>
                          </div>
                        </div>

                        {vendor.marginSummary.hasActiveMargin && (
                          <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                            <span className="font-bold text-emerald-900">B2B Margin + ₹15 Beat Fee</span>
                            <span className="font-mono font-black text-emerald-800 tabular-nums">
                              +{vendor.marginSummary.topMarginPercent}% (+₹{vendor.marginSummary.topMarginAmount})
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                        <div className="text-[11px] text-slate-500 font-mono truncate">
                          {vendor.inventory.length} SKU{vendor.inventory.length === 1 ? '' : 's'} · {vendor.ippbRef}
                        </div>
                        <button
                          type="button"
                          onClick={() => openVendorProfile(vendor.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-red-800 text-amber-300 font-black flex items-center gap-1 shrink-0 cursor-pointer transition whitespace-nowrap"
                        >
                          <span>Open Inventory</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'CATALOGS' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
                    <th className="py-3 pr-4">Product, SKU &amp; Source Ownership</th>
                    <th className="py-3 px-3">Service Category &amp; Linked Hub</th>
                    <th className="py-3 px-3 text-right">Stock</th>
                    <th className="py-3 px-3 text-right">Wholesale</th>
                    <th className="py-3 px-3 text-right">Retail</th>
                    <th className="py-3 px-3 text-center">Status / COD</th>
                    <th className="py-3 pl-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCatalogProducts.map((item) => {
                    const ownership = item.sourceOwnership || inferSourceOwnership(item);
                    const svcCat = item.serviceCategory || inferServiceCategory(item);
                    const statusLabel: ProductListingStatus =
                      item.listingStatus || (item.status === 'HIDDEN' ? 'Paused' : 'Active');
                    const wholesale = item.wholesalePrice ?? Math.round(item.price * 0.85);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-900">{item.title}</span>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                    ownership === 'COMPANY_HOUSE'
                                      ? 'bg-slate-900 text-amber-300'
                                      : 'bg-indigo-100 text-indigo-800'
                                  }`}
                                >
                                  {ownership === 'COMPANY_HOUSE' ? 'Direct House' : 'Partner'}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {item.vendorName || item.staffName} · <span className="font-mono">{item.sku}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{svcCat}</div>
                          <div className="text-[11px] text-slate-500">
                            Hub: {item.linkedOfficeName || item.subOffice || 'Dadabari S.O.'} (PIN {item.pincode || '324009'})
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-700">
                          {item.stockQuantity ?? 25}
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                          ₹{wholesale}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black tabular-nums text-slate-900">
                          {item.price === 0 ? 'FREE' : `₹${item.price}`}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                statusLabel === 'Active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : statusLabel === 'Out of Stock'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {statusLabel}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {item.codEligible ? 'COD Eligible' : 'Prepaid / Digital'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pl-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openPriceEdit(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 cursor-pointer"
                            >
                              Edit / Stock
                            </button>
                            <button
                              type="button"
                              onClick={() => setInspectedProduct(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold cursor-pointer"
                            >
                              Dynamic View
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

          {activeTab === 'CATEGORIES' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="rounded-3xl border border-emerald-200 bg-white p-6 space-y-4 shadow-2xs">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Template 01 · Banking &amp; Financial Services
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Sovereign Schemes, IPPB &amp; Insurance
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Adapts product pages automatically with Sovereign Guarantee notes, live Interest Rate Calculators (SSY 8.2%, SCSS 8.2%, PPF 7.1%, PLI ₹76 bonus), Section 80C EEE tax notes, and Doorstep KYC hooks.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  {POSTAL_PRODUCTS.slice(0, 4).map((sch) => (
                    <button
                      key={sch.code}
                      type="button"
                      onClick={() => navigate(`/product/${encodeURIComponent(sch.code)}`)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold cursor-pointer"
                    >
                      Preview {sch.code} →
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-rose-200 bg-white p-6 space-y-4 shadow-2xs">
                <div className="text-xs font-bold uppercase tracking-wider text-red-700">
                  Template 02 · Retail &amp; Merchandise
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  MyStamp, Gangajal, DNK &amp; Parcels
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Adapts product pages with high-resolution showcase photography, Official Counter Retail Pricing, quantity selectors, and live Speed Post tracking barcode generation.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  {['MY_STAMP', 'GANGAJAL', 'DNK_PARCEL'].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => navigate(`/product/${encodeURIComponent(code)}`)}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-900 text-xs font-bold cursor-pointer"
                    >
                      Preview {code} →
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-amber-200 bg-white p-6 space-y-4 shadow-2xs">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Template 03 · Local B2B Vendor Products
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Neighborhood Wholesalers &amp; Merchants
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Adapts product pages with verified Merchant Attribution, 3-Tier Bulk Wholesale Pricing Calculators (Retail / Mini B2B -8% / Bulk Crate -15%), and Beat-Wise Delivery Manager assignment.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  {['PROD-B2B-KIRANA-01', 'PROD-B2B-PHARMA-02', 'PROD-B2B-COACHING-03'].map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => navigate(`/product/${encodeURIComponent(id)}`)}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold cursor-pointer"
                    >
                      Preview {id.split('-')[2]} →
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'COMMISSIONS' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    India Post Bulk &amp; Beat Commission Ledger · ₹15/Delivery + ₹100/Referral + B2B Margins
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time partner commission earned per dispatch synced with Dadabari S.O. IPPB Merchant settlements.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                  <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold">
                    Beat Delivery Pool (₹15 × {commissionSummary.totalDispatches}): ₹{commissionSummary.beatDeliveryPayout.toLocaleString('en-IN')}
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-black">
                    B2B Margin Pool: ₹{commissionSummary.estCommissionPool.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
                      <th className="py-3 pr-4">Order / Tracking Ref</th>
                      <th className="py-3 px-3">Vendor &amp; Product</th>
                      <th className="py-3 px-3">Beat Manager</th>
                      <th className="py-3 px-3 text-right">COD Amount</th>
                      <th className="py-3 px-3 text-right">Beat Fee (₹15) + Margin</th>
                      <th className="py-3 pl-3">Status &amp; IPPB Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dispatches.map((d) => {
                      const matched = products.find((p) => p.id === d.productId || p.sku === d.productSku);
                      const margin = matched?.sellingMarginAmount ?? Math.round((d.codAmount || 0) * 0.18);
                      return (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="py-3 pr-4 font-mono">
                            <div className="font-bold text-slate-900">{d.id}</div>
                            <div className="text-[11px] text-red-700">{d.speedPostBarcode || 'ED324009IN'}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{d.productTitle}</div>
                            <div className="text-[11px] text-slate-500">{d.storeName}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-800">{d.pincodeManagerName}</div>
                            <div className="text-[11px] text-slate-500">{d.beatNo} · PIN {d.pincode}</div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                            ₹{(d.codAmount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-black text-emerald-700 tabular-nums">
                            ₹15 + ₹{margin.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 pl-3 font-mono text-[11px]">
                            <div className="font-bold text-slate-800">{d.status}</div>
                            <div className="text-slate-500">{d.ippbQrSettlementRef || `IPPB-${d.pincode}`}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* REGISTER VENDOR / BRAND FRANCHISE & INVENTORY SKU MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
            <div className="p-5 bg-gradient-to-r from-indigo-950 to-slate-900 text-white flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-amber-300 uppercase">
                  Master Admin Ecosystem · Store &amp; Brand Registration
                </div>
                <h3 className="text-base font-black mt-0.5">
                  Onboard Local Vendor or Brand Franchise &amp; Publish SKU
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRegisterVendorSubmit} className="p-5 space-y-3.5 text-xs max-h-[82vh] overflow-y-auto">
              {/* Ownership Mode: Direct Company House vs Partner / Vendor */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl font-black">
                <button
                  type="button"
                  onClick={() => {
                    setVSourceOwnership('COMPANY_HOUSE');
                    setVStoreName('India Post Direct Division Desk');
                    setVOwnerName(userProfile?.name || 'Mahendra Kumar Meena');
                  }}
                  className={`py-2 rounded-lg cursor-pointer transition ${
                    vSourceOwnership === 'COMPANY_HOUSE' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  India Post Direct (Departmental)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVSourceOwnership('VENDOR_PARTNER');
                    if (vStoreName === 'India Post Direct Division Desk') setVStoreName('');
                  }}
                  className={`py-2 rounded-lg cursor-pointer transition ${
                    vSourceOwnership === 'VENDOR_PARTNER' ? 'bg-red-700 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Partner / Vendor Listing
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200">
                <div>
                  <label className="block font-bold text-indigo-950 mb-1">Business Service Category *</label>
                  <select
                    value={vServiceCategory}
                    onChange={(e) => setVServiceCategory(e.target.value as BusinessServiceCategory)}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl font-bold text-slate-900"
                  >
                    {(isCategoryManager ? assignedCategories : BUSINESS_SERVICE_CATEGORIES).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-indigo-950 mb-1">Linked Dispatch Office / Hub *</label>
                  <select
                    value={vLinkedOfficeId}
                    onChange={(e) => setVLinkedOfficeId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl font-bold text-slate-900"
                  >
                    {managedOffices.slice(0, 60).map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.officeName} ({o.pincode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {vSourceOwnership === 'VENDOR_PARTNER' && (
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setVStoreType('LOCAL_MERCHANT');
                      setVDeliveryRadiusKm(3);
                    }}
                    className={`py-2 rounded-lg cursor-pointer transition ${
                      vStoreType === 'LOCAL_MERCHANT' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Local B2B Merchant
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVStoreType('BRAND_FRANCHISE');
                      setVDeliveryRadiusKm(5);
                    }}
                    className={`py-2 rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5 ${
                      vStoreType === 'BRAND_FRANCHISE' ? 'bg-red-700 text-white shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    <Building2 size={13} />
                    <span>National Brand Franchise</span>
                  </button>
                </div>
              )}

              {vStoreType === 'BRAND_FRANCHISE' && (
                <div className="p-3 rounded-2xl bg-red-50/70 border border-red-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-red-950 mb-1">Official Brand Name *</label>
                    <input
                      type="text"
                      required
                      value={vBrandName}
                      onChange={(e) => setVBrandName(e.target.value)}
                      placeholder="e.g. Kota Academic Hub / Kaithoon Weavers Guild"
                      className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-red-950 mb-1">Showcase Category Artwork</label>
                    <select
                      value={vBrandPreset}
                      onChange={(e) =>
                        setVBrandPreset(e.target.value as 'QSR' | 'MART' | 'APPAREL' | 'TECH' | 'DEFAULT')
                      }
                      className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl font-semibold text-slate-900"
                    >
                      <option value="QSR">Speed Post &amp; BNPL Parcel Hub</option>
                      <option value="MART">Study Material &amp; Institutional Bulk</option>
                      <option value="APPAREL">Kota Doria &amp; GI Handloom</option>
                      <option value="TECH">Medical &amp; Diagnostic Dispatch</option>
                      <option value="DEFAULT">Standard Showcase Cover</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {vStoreType === 'BRAND_FRANCHISE' ? 'Bulk Customer / Institutional Unit *' : 'Bulk Customer / Partner Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={vStoreName}
                    onChange={(e) => setVStoreName(e.target.value)}
                    placeholder={vStoreType === 'BRAND_FRANCHISE' ? 'e.g. Dadabari Surgical & Pharmacy Hub' : 'e.g. Hadoti Agro Collective'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Owner / Manager Name *</label>
                  <input
                    type="text"
                    required
                    value={vOwnerName}
                    onChange={(e) => setVOwnerName(e.target.value)}
                    placeholder="e.g. Ramesh Agrawal"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={vPhone}
                    onChange={(e) => setVPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vendor Category</label>
                  <select
                    value={vCategory}
                    onChange={(e) => setVCategory(e.target.value as CommercialStoreCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                  >
                    <option value="Wholesale">Wholesale</option>
                    <option value="Retail">Retail</option>
                    <option value="Services">Services</option>
                    <option value="eMitra/CSC">eMitra/CSC</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Beat &amp; Manager</label>
                  <select
                    value={vBeatNo}
                    onChange={(e) => setVBeatNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                  >
                    {commercialPropertyService.beatDirectory.map((b) => (
                      <option key={b.beatNo} value={b.beatNo}>
                        {b.beatNo} · {b.staffName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Colony / Sector</label>
                  <input
                    type="text"
                    value={vColony}
                    onChange={(e) => setVColony(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Serviceable Kota PINcodes</span>
                  <span className="text-[11px] font-mono text-slate-600">Radius: {vDeliveryRadiusKm} km</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {KOTA_PINCODE_ZONES.map((z) => {
                    const active = vServiceablePincodes.includes(z.pincode);
                    return (
                      <button
                        key={z.pincode}
                        type="button"
                        onClick={() => toggleRegisterPincode(z.pincode)}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border cursor-pointer transition ${
                          active
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {z.pincode} · {z.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Store Address</label>
                <input
                  type="text"
                  value={vAddress}
                  onChange={(e) => setVAddress(e.target.value)}
                  placeholder="Shop No, Market Complex, Dadabari S.O. 324009"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Inventory Product Title *</label>
                  <input
                    type="text"
                    required
                    value={vProductTitle}
                    onChange={(e) => setVProductTitle(e.target.value)}
                    placeholder="e.g. Monthly Dry Ration & Spice Combo Pack"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Wholesale (₹) *</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={vWholesalePrice}
                      onChange={(e) => setVWholesalePrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Retail (₹) *</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={vRetailPrice}
                      onChange={(e) => setVRetailPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Stock Qty *</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={vStockQuantity}
                      onChange={(e) => setVStockQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status *</label>
                    <select
                      value={vListingStatus}
                      onChange={(e) => setVListingStatus(e.target.value as ProductListingStatus)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                    >
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Out of Stock">Out of Stock</option>
                      <option value="Paused">Paused</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vCodEligible}
                    onChange={(e) => setVCodEligible(e.target.checked)}
                    className="w-4 h-4 accent-red-700"
                  />
                  <span>Speed Post COD Eligible (with IPPB Merchant QR Settlement)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Save Store &amp; Publish SKU</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PINCODE & BEAT AVAILABILITY ZONE EDITOR MODAL */}
      {editingZoneStore && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-amber-300 uppercase">
                  PINcode &amp; Beat Serviceability Matrix
                </div>
                <h3 className="text-sm font-black mt-0.5">{editingZoneStore.storeName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingZoneStore(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveZoneAvailability} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Active Delivery PINcodes</label>
                <div className="flex flex-wrap gap-1.5">
                  {KOTA_PINCODE_ZONES.map((z) => {
                    const active = zonePincodes.includes(z.pincode);
                    return (
                      <button
                        key={z.pincode}
                        type="button"
                        onClick={() => toggleZonePincode(z.pincode)}
                        className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-bold border cursor-pointer transition ${
                          active
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {z.pincode} · {z.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={zoneAllBeats}
                    onChange={(e) => setZoneAllBeats(e.target.checked)}
                    className="w-4 h-4 accent-red-700"
                  />
                  <span>Deliverable Across All 34 Beats in Active PINcodes</span>
                </label>

                {!zoneAllBeats && (
                  <select
                    value={zonePrimaryBeat}
                    onChange={(e) => setZonePrimaryBeat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                  >
                    {commercialPropertyService.beatDirectory.map((b) => (
                      <option key={b.beatNo} value={b.beatNo}>
                        {b.beatNo} · {b.staffName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Radius (km)</label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={zoneRadiusKm}
                    onChange={(e) => setZoneRadiusKm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operational Status</label>
                  <select
                    value={zoneOperationalStatus}
                    onChange={(e) =>
                      setZoneOperationalStatus(e.target.value as CommercialStoreRecord['operationalStatus'])
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    <option value="OPERATIONAL">OPERATIONAL</option>
                    <option value="CLOSED_TEMPORARILY">CLOSED_TEMPORARILY</option>
                    <option value="CLOSED_PERMANENTLY">CLOSED_PERMANENTLY</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dispatch Window / Cutoff</label>
                <input
                  type="text"
                  value={zoneCutoffTime}
                  onChange={(e) => setZoneCutoffTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingZoneStore(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black cursor-pointer"
                >
                  Save Zone Matrix
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRICING & COD ELIGIBILITY MODAL */}
      {editingPriceItem && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-amber-300 uppercase">
                  Update Vendor Pricing &amp; Margin
                </div>
                <h3 className="text-sm font-black mt-0.5">{editingPriceItem.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPriceItem(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSavePriceEdit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Source Ownership</label>
                  <select
                    value={editSourceOwnership}
                    onChange={(e) => setEditSourceOwnership(e.target.value as ProductSourceType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    <option value="COMPANY_HOUSE">India Post Direct (Departmental)</option>
                    <option value="VENDOR_PARTNER">Partner / Vendor Listing</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Category</label>
                  <select
                    value={editServiceCategory}
                    onChange={(e) => setEditServiceCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    {BUSINESS_SERVICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Wholesale Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={editWholesale}
                    onChange={(e) => setEditWholesale(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Retail Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={editRetail}
                    onChange={(e) => setEditRetail(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Available Stock Qty</label>
                  <input
                    type="number"
                    min={0}
                    value={editStockQty}
                    onChange={(e) => setEditStockQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Listing Status</label>
                  <select
                    value={editListingStatus}
                    onChange={(e) => setEditListingStatus(e.target.value as ProductListingStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Linked Dispatch Office / Hub</label>
                <select
                  value={editLinkedOfficeId}
                  onChange={(e) => setEditLinkedOfficeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                >
                  <option value="">Keep Existing ({editingPriceItem.linkedOfficeName || editingPriceItem.subOffice || 'Dadabari S.O.'})</option>
                  {managedOffices.slice(0, 60).map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.officeName} ({o.pincode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between font-mono">
                <span className="font-sans font-bold text-emerald-900">Computed Partner Margin</span>
                <strong className="text-emerald-800 tabular-nums">
                  +₹{Math.max(0, editRetail - editWholesale)} (
                  {editRetail > 0
                    ? Math.round((Math.max(0, editRetail - editWholesale) / editRetail) * 100)
                    : 0}
                  %)
                </strong>
              </div>
              <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editCod}
                  onChange={(e) => setEditCod(e.target.checked)}
                  className="w-4 h-4 accent-red-700"
                />
                <span>Eligible for Speed Post COD Dispatch</span>
              </label>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPriceItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black cursor-pointer"
                >
                  Save SKU Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* STORE MONETIZATION, AFFILIATE & MARKETING BUDGET MODAL */}
      {editingMonetizationStore && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-indigo-950 to-slate-900 text-white flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-amber-300 uppercase">
                  India Post Bulk Partner &amp; Showcase Controls
                </div>
                <h3 className="text-sm font-black mt-0.5">{editingMonetizationStore.storeName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingMonetizationStore(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveMonetization} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Storefront Listing Tier</label>
                <select
                  value={monListingTier}
                  onChange={(e) =>
                    setMonListingTier(
                      e.target.value as 'SPONSORED_PARTNER' | 'ACTIVE_AFFILIATE' | 'STANDARD_LISTING'
                    )
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                >
                  <option value="SPONSORED_PARTNER">Sponsored Partner (Priority Top Placement)</option>
                  <option value="ACTIVE_AFFILIATE">Active Affiliate (15%–25% Margin Tier)</option>
                  <option value="STANDARD_LISTING">Standard Listing</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Marketing Budget (₹)</label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={monBudgetMonthly}
                    onChange={(e) => setMonBudgetMonthly(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Affiliate Commission (%)</label>
                  <input
                    type="number"
                    min={5}
                    max={40}
                    value={monAffiliatePct}
                    onChange={(e) => setMonAffiliatePct(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={monStorefrontEnabled}
                  onChange={(e) => setMonStorefrontEnabled(e.target.checked)}
                  className="w-4 h-4 accent-emerald-700"
                />
                <span>Enable Storefront Listing (Visible on India Post Public Showcase)</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMonetizationStore(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-black cursor-pointer"
                >
                  Save Monetization Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
