import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  Eye,
  EyeOff,
  Star,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Store,
  X,
  Upload,
  Share2,
  Copy,
  Check,
  Sliders,
  MapPin,
  Lock,
  ExternalLink,
} from 'lucide-react';
import {
  StaffProductItem,
  StaffProductVertical,
  ProductPricingModel,
  ProductItemType,
  StaffSalesRights,
} from '../../types/models';
import {
  staffProductService,
  ALL_PRODUCT_VERTICALS,
  DEFAULT_VERTICAL_THUMBNAILS,
} from '../../services/staffProductService';
import { staffPermissionService } from '../../services/staffPermissionService';
import { useAuth } from '../auth/FirebaseAuthProvider';

interface StaffProductStudioViewProps {
  embeddedInProfile?: boolean;
}

export default function StaffProductStudioView({ embeddedInProfile = false }: StaffProductStudioViewProps) {
  const { userProfile } = useAuth();
  const [studioTab, setStudioTab] = useState<'CATALOG' | 'PITCH_PREVIEW' | 'ADMIN_RIGHTS'>('CATALOG');
  const [products, setProducts] = useState<StaffProductItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVertical, setSelectedVertical] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StaffProductItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffProductItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formVertical, setFormVertical] = useState<StaffProductVertical>('Logistics & Courier Services');
  const [formPricingModel, setFormPricingModel] = useState<ProductPricingModel>('Fixed Price');
  const [formProductType, setFormProductType] = useState<ProductItemType>('Service');
  const [formPrice, setFormPrice] = useState<number>(100);
  const [formCommission, setFormCommission] = useState('15% Partner Commission');
  const [formDescription, setFormDescription] = useState('');
  const [formFeatures, setFormFeatures] = useState('');
  const [formThumbnail, setFormThumbnail] = useState(
    DEFAULT_VERTICAL_THUMBNAILS['Logistics & Courier Services']
  );
  const [formWhatsapp, setFormWhatsapp] = useState(userProfile?.contact || userProfile?.mobile || '9414170563');
  const [formAssignedBeat, setFormAssignedBeat] = useState<string>('All Beats');
  const [formVendorName, setFormVendorName] = useState<string>('');
  const [formMarginPct, setFormMarginPct] = useState<number>(15);
  const [formCodEligible, setFormCodEligible] = useState<boolean>(true);

  const staffId = userProfile?.employeeId || userProfile?.id || userProfile?.email || 'MASTER-ADMIN-01';
  const staffName = userProfile?.name || 'Ekta Meena';
  const staffBeat = userProfile?.beat || 'Beat 1';
  const isSuperAdmin =
    staffPermissionService.isSuperAdmin(userProfile) ||
    userProfile?.role === 'ADMIN' ||
    userProfile?.role === 'SUPER_ADMIN' ||
    userProfile?.role === 'MASTER_ADMIN';

  const [myRights, setMyRights] = useState<StaffSalesRights>(() =>
    staffProductService.getStaffSalesRights(staffId, staffName, staffBeat)
  );

  // Admin rights management state
  const directoryStaff = useMemo(() => staffPermissionService.getDirectoryStaff(), []);
  const [selectedAdminStaffId, setSelectedAdminStaffId] = useState<string>(() => {
    const first = directoryStaff[0];
    return first?.employeeId || first?.id || '50457421';
  });
  const [adminEditedRights, setAdminEditedRights] = useState<StaffSalesRights>(() =>
    staffProductService.getStaffSalesRights(selectedAdminStaffId)
  );

  const loadData = () => {
    setProducts(staffProductService.getProductsForStaffStudio(staffId, staffBeat, isSuperAdmin));
    setMyRights(staffProductService.getStaffSalesRights(staffId, staffName, staffBeat));
  };

  useEffect(() => {
    loadData();
    const unsub = staffProductService.subscribe(loadData);
    return () => unsub();
  }, [staffId, staffBeat, isSuperAdmin]);

  useEffect(() => {
    const matched = directoryStaff.find(
      (s) => (s.employeeId || s.id) === selectedAdminStaffId
    );
    setAdminEditedRights(
      staffProductService.getStaffSalesRights(
        selectedAdminStaffId,
        matched?.name || 'Staff Partner',
        matched?.beat || 'Beat 1'
      )
    );
  }, [selectedAdminStaffId, directoryStaff]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const openCreateModal = () => {
    if (!isSuperAdmin && !myRights.canCreateCustomProducts) {
      showToast('Custom product creation is currently restricted for your Beat by Master Admin.');
      return;
    }
    setEditingProduct(null);
    setFormTitle('');
    setFormSku(`XPD-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormVertical(myRights.allowedVerticals[0] || 'Logistics & Courier Services');
    setFormPricingModel('Fixed Price');
    setFormProductType('Service');
    setFormPrice(150);
    setFormCommission('15% Partner Commission');
    setFormDescription('');
    setFormFeatures('Free Doorstep Pickup\nPriority Dispatch\nWhatsApp Tracking');
    setFormThumbnail(DEFAULT_VERTICAL_THUMBNAILS[myRights.allowedVerticals[0] || 'Logistics & Courier Services']);
    setFormWhatsapp(userProfile?.contact || userProfile?.mobile || '9414170563');
    setFormAssignedBeat(isSuperAdmin ? 'All Beats' : staffBeat);
    setFormVendorName('');
    setFormMarginPct(15);
    setFormCodEligible(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: StaffProductItem) => {
    setEditingProduct(item);
    setFormTitle(item.title);
    setFormSku(item.sku);
    setFormVertical(item.vertical);
    setFormPricingModel(item.pricingModel);
    setFormProductType(item.productType);
    setFormPrice(item.price);
    setFormCommission(item.commissionRate || '');
    setFormDescription(item.description);
    setFormFeatures(item.features.join('\n'));
    setFormThumbnail(item.thumbnailUrl);
    setFormWhatsapp(item.whatsappNumber);
    setFormAssignedBeat(item.assignedBeats?.[0] || item.beatNumber || 'All Beats');
    setFormVendorName(item.vendorName || '');
    setFormMarginPct(item.sellingMarginPercent || 15);
    setFormCodEligible(item.codEligible ?? true);
    setIsModalOpen(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      showToast('Image file should be under 1.5 MB for instant offline sync.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormThumbnail(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const featureList = formFeatures
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const normalizedWa = formWhatsapp.replace(/\D/g, '').length === 10
      ? `91${formWhatsapp.replace(/\D/g, '')}`
      : formWhatsapp.replace(/\D/g, '') || '919414170563';

    const safePrice = Number(formPrice) || 0;
    const marginPct = Math.max(0, Math.min(60, Number(formMarginPct) || 15));
    const marginAmt = Math.round((safePrice * marginPct) / 100);

    if (editingProduct) {
      staffProductService.updateProduct({
        ...editingProduct,
        title: formTitle.trim(),
        sku: formSku.trim() || `SKU-${Date.now()}`,
        vertical: formVertical,
        pricingModel: formPricingModel,
        productType: formProductType,
        price: safePrice,
        commissionRate: formCommission.trim() || `₹${marginAmt} Partner Margin (${marginPct}%)`,
        sellingMarginAmount: marginAmt,
        sellingMarginPercent: marginPct,
        codEligible: formCodEligible,
        vendorName: formVendorName.trim() || staffName,
        beatManagerId: staffId,
        beatManagerName: `${staffName} · ${formAssignedBeat}`,
        description: formDescription.trim(),
        features: featureList,
        thumbnailUrl: formThumbnail.trim(),
        whatsappNumber: normalizedWa,
        assignedBeats: [formAssignedBeat],
      });
      showToast(`Updated "${formTitle.trim()}" in storefront catalog.`);
    } else {
      staffProductService.addProduct({
        sku: formSku.trim() || `SKU-${Date.now()}`,
        title: formTitle.trim(),
        vertical: formVertical,
        pricingModel: formPricingModel,
        productType: formProductType,
        price: safePrice,
        mrpPrice: safePrice > 0 ? Math.round(safePrice * 1.15) : 0,
        commissionRate: formCommission.trim() || `₹${marginAmt} Partner Margin (${marginPct}%)`,
        sellingMarginAmount: marginAmt,
        sellingMarginPercent: marginPct,
        codEligible: formCodEligible,
        vendorName: formVendorName.trim() || staffName,
        beatManagerId: staffId,
        beatManagerName: `${staffName} · ${formAssignedBeat}`,
        description: formDescription.trim(),
        features: featureList,
        thumbnailUrl: formThumbnail.trim(),
        staffId,
        staffName,
        staffMobile: userProfile?.contact || userProfile?.mobile || '9414170563',
        whatsappNumber: normalizedWa,
        beatNumber: formAssignedBeat,
        subOffice: userProfile?.subOffice || 'Dadabari S.O.',
        pincode: '324009',
        status: 'ACTIVE',
        isGlobalAdminItem: isSuperAdmin,
        assignedBeats: [formAssignedBeat],
        logisticsServiceType: formCodEligible ? 'Speed Post COD' : 'Doorstep Service Pickup',
      });
      showToast(`Published "${formTitle.trim()}" to your Storefront & Citizen Portal!`);
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleCycleStatus = (item: StaffProductItem) => {
    if (item.isGlobalAdminItem && !isSuperAdmin) {
      const nowHidden = staffProductService.toggleGlobalProductVisibilityForStaff(
        staffId,
        item.id,
        staffName,
        staffBeat
      );
      showToast(
        nowHidden
          ? `Hidden "${item.title}" from your personal Beat pitching view.`
          : `Enabled "${item.title}" on your personal Beat pitching view.`
      );
      loadData();
      return;
    }

    const nextStatus =
      item.status === 'ACTIVE' ? 'FEATURED' : item.status === 'FEATURED' ? 'HIDDEN' : 'ACTIVE';
    staffProductService.toggleStatus(item.id, nextStatus);
    showToast(`Product visibility set to ${nextStatus}.`);
    loadData();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    staffProductService.deleteProduct(deleteTarget.id);
    showToast(`Removed "${deleteTarget.title}" from catalog.`);
    setDeleteTarget(null);
    loadData();
  };

  const handleToggleAdminVertical = (vert: StaffProductVertical) => {
    const exists = adminEditedRights.allowedVerticals.includes(vert);
    const updatedVerticals = exists
      ? adminEditedRights.allowedVerticals.filter((v) => v !== vert)
      : [...adminEditedRights.allowedVerticals, vert];
    const next = { ...adminEditedRights, allowedVerticals: updatedVerticals };
    setAdminEditedRights(next);
  };

  const handleSaveAdminRights = () => {
    staffProductService.updateStaffSalesRights({
      ...adminEditedRights,
      updatedBy: staffName,
    });
    showToast(`Saved selling rights for ${adminEditedRights.staffName} (${adminEditedRights.staffId}).`);
  };

  const personalPitchLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?partner=${encodeURIComponent(staffId)}`
      : `https://last-mile-lms.netlify.app/?partner=${encodeURIComponent(staffId)}`;

  const copyPersonalPitchLink = async () => {
    try {
      await navigator.clipboard.writeText(personalPitchLink);
    } catch {
      // ignore
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const isHiddenForMe = (item: StaffProductItem) => {
    if (item.status === 'HIDDEN') return true;
    if (item.isGlobalAdminItem && !isSuperAdmin) {
      return myRights.hiddenGlobalProductIds.includes(item.id);
    }
    return false;
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVertical = selectedVertical === 'ALL' || p.vertical === selectedVertical;
    return matchesSearch && matchesVertical;
  });

  const activePitchCatalog = useMemo(() => {
    return staffProductService.getPublicCatalog(isSuperAdmin ? undefined : staffId);
  }, [products, myRights, staffId, isSuperAdmin]);

  return (
    <div className={embeddedInProfile ? 'space-y-5' : 'p-4 sm:p-6 max-w-7xl mx-auto space-y-6'}>
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-950 text-amber-300 px-4 py-3 rounded-2xl shadow-2xl border border-amber-400/40 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-slate-950 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider">
            <Store size={14} /> Multi-Vertical E-Commerce & Partner Storefront Studio
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            {embeddedInProfile ? 'My Storefront Products & Pitching Catalog' : 'Staff & Partner Product Studio'}
          </h1>
          <p className="text-xs text-red-100/90 max-w-2xl leading-relaxed">
            List and manage your personal services & custom products across Logistics, Banking, Digital Docs, and Courses. Toggle View / Hide / Feature controls to curate your Beat pitching storefront.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={copyPersonalPitchLink}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            {copiedLink ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
            <span>{copiedLink ? 'Pitch Link Copied!' : 'Copy My Pitch URL'}</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl text-xs font-black shadow-lg transition flex items-center gap-2 cursor-pointer"
            id="add-storefront-product-btn"
          >
            <Plus size={16} />
            <span>Add Storefront Product</span>
          </button>
        </div>
      </div>

      {/* Studio Sub-Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setStudioTab('CATALOG')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              studioTab === 'CATALOG'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package size={14} />
            <span>Product Catalog & Visibility ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setStudioTab('PITCH_PREVIEW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              studioTab === 'PITCH_PREVIEW'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Eye size={14} />
            <span>Client Pitching View ({activePitchCatalog.length})</span>
          </button>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setStudioTab('ADMIN_RIGHTS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                studioTab === 'ADMIN_RIGHTS'
                  ? 'bg-slate-900 text-amber-300 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sliders size={14} />
              <span>Admin: Beat & Selling Rights</span>
            </button>
          )}
        </div>

        <div className="text-[11px] font-medium text-slate-500 px-2 flex items-center gap-2">
          <span className="font-mono font-bold text-slate-700">Partner ID: {staffId}</span>
          <span>•</span>
          <span>{staffBeat}</span>
        </div>
      </div>

      {/* TAB 1: CATALOG & VISIBILITY CONTROL */}
      {studioTab === 'CATALOG' && (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search products, SKU or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-red-600 transition"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setSelectedVertical('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedVertical === 'ALL'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Verticals ({products.length})
              </button>
              {ALL_PRODUCT_VERTICALS.map((vert) => (
                <button
                  key={vert}
                  type="button"
                  onClick={() => setSelectedVertical(vert)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedVertical === vert
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {vert}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((item) => {
              const hiddenLocally = isHiddenForMe(item);
              const canEdit = isSuperAdmin || item.staffId === staffId;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl border transition shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden ${
                    hiddenLocally
                      ? 'border-slate-200 opacity-75 bg-slate-50'
                      : item.status === 'FEATURED'
                      ? 'border-amber-400 ring-2 ring-amber-400/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="relative h-44 bg-slate-900 overflow-hidden">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className={`w-full h-full object-cover transition duration-300 ${
                          hiddenLocally ? 'grayscale opacity-50' : 'opacity-90 hover:scale-105'
                        }`}
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-black uppercase tracking-wider">
                          {item.vertical}
                        </span>
                        {item.status === 'FEATURED' && !hiddenLocally && (
                          <span className="px-2 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-sm">
                            <Star size={11} className="fill-slate-950" /> Featured
                          </span>
                        )}
                        {hiddenLocally && (
                          <span className="px-2 py-1 rounded-full bg-slate-800 text-slate-200 text-[10px] font-bold flex items-center gap-1">
                            <EyeOff size={11} /> Hidden on Pitch
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl shadow-md text-slate-900 font-mono font-black text-xs">
                        {item.price === 0 ? 'FREE' : `₹${item.price}`}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span className="font-mono text-slate-700 font-bold">SKU: {item.sku}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                          {item.productType} · {item.pricingModel}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                        {item.title}
                      </h3>

                      {item.commissionRate && (
                        <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg inline-block">
                          {item.commissionRate}
                        </div>
                      )}

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{item.description}</p>

                      <div className="space-y-1 pt-1 border-t border-slate-100">
                        {item.features.slice(0, 3).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700">
                            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions & Visibility Toggle */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-600 truncate">
                      <span className="font-bold text-slate-900">{item.staffName}</span>
                      <div className="text-[10px] text-slate-400">
                        Beat: {item.assignedBeats?.join(', ') || item.beatNumber || 'All Beats'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCycleStatus(item)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                          hiddenLocally
                            ? 'bg-slate-200 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800'
                            : item.status === 'FEATURED'
                            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                        title={
                          item.isGlobalAdminItem && !isSuperAdmin
                            ? 'Show / Hide on your personal pitching view'
                            : 'Cycle Active -> Featured -> Hidden'
                        }
                      >
                        {hiddenLocally ? (
                          <>
                            <EyeOff size={13} />
                            <span>Hidden</span>
                          </>
                        ) : item.status === 'FEATURED' ? (
                          <>
                            <Star size={13} className="fill-amber-500 text-amber-600" />
                            <span>Featured</span>
                          </>
                        ) : (
                          <>
                            <Eye size={13} />
                            <span>Visible</span>
                          </>
                        )}
                      </button>

                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}

                      {canEdit && (!item.isGlobalAdminItem || isSuperAdmin) && (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <Package size={28} />
              </div>
              <h3 className="text-lg font-black text-slate-900">No storefront products found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No products match your search query or vertical filter. Click "Add Storefront Product" to publish a service or product.
              </p>
            </div>
          )}
        </>
      )}

      {/* TAB 2: PUBLIC CLIENT PITCHING PREVIEW */}
      {studioTab === 'PITCH_PREVIEW' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span>Live Citizen Pitching Catalog for {staffName} ({staffBeat})</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Only visible & featured items allowed for your beat appear here. Share your personal pitching URL with beat residents & businesses.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyPersonalPitchLink}
                className="px-3.5 py-2 bg-white border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100 transition"
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedLink ? 'Copied!' : 'Copy Storefront Link'}</span>
              </button>
              <a
                href={`/?partner=${encodeURIComponent(staffId)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <ExternalLink size={14} />
                <span>Open Public Store</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activePitchCatalog.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between space-y-3">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-red-700 bg-red-50 px-2 py-0.5 rounded">
                      {item.vertical}
                    </span>
                    <span className="font-mono font-black text-xs text-slate-900">
                      {item.price === 0 ? 'FREE' : `₹${item.price}`}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                </div>
                <a
                  href={`https://api.whatsapp.com/send?phone=${item.whatsappNumber}&text=${encodeURIComponent(
                    `Namaste ${item.staffName}, I am interested in "${item.title}" (SKU: ${item.sku}) via India Post Showcase.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <MessageCircle size={14} />
                  <span>Test WhatsApp Inquiry (+{item.whatsappNumber})</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ADMIN BEAT & SELLING RIGHTS ASSIGNMENT */}
      {studioTab === 'ADMIN_RIGHTS' && isSuperAdmin && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-red-700" />
                <span>Admin Global Selling Rights & Beat Campaign Permissions</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign which E-Commerce verticals and custom listing permissions each Dadabari S.O. delivery partner holds on their beat.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-700 uppercase">
                Select Staff / Delivery Partner
              </label>
              <select
                value={selectedAdminStaffId}
                onChange={(e) => setSelectedAdminStaffId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                {directoryStaff.map((s) => {
                  const idVal = s.employeeId || s.id;
                  return (
                    <option key={s.id} value={idVal}>
                      {s.beat} • {s.name} ({idVal})
                    </option>
                  );
                })}
              </select>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-900">{adminEditedRights.staffName}</div>
                <div className="text-slate-600 flex items-center gap-1.5">
                  <MapPin size={13} className="text-red-600" />
                  <span>Assigned Beat: <strong>{adminEditedRights.assignedBeat}</strong></span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Hidden Global Items by Staff: {adminEditedRights.hiddenGlobalProductIds.length}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700 uppercase">
                  Authorized Sales Verticals for This Partner
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ALL_PRODUCT_VERTICALS.map((vert) => {
                    const checked = adminEditedRights.allowedVerticals.includes(vert);
                    return (
                      <label
                        key={vert}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition ${
                          checked
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <span>{vert}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleAdminVertical(vert)}
                          className="w-4 h-4 accent-emerald-600"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <label className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-black text-amber-950">
                    Allow Partner to Create Custom Beat Products
                  </div>
                  <div className="text-[11px] text-amber-800">
                    When disabled, partner can only toggle/pitch global Admin-approved offerings.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={adminEditedRights.canCreateCustomProducts}
                  onChange={(e) =>
                    setAdminEditedRights({
                      ...adminEditedRights,
                      canCreateCustomProducts: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-red-700"
                />
              </label>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAdminRights}
                  className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer"
                >
                  Save Beat Selling Rights
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* E-Commerce Product Creation / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-700 text-white flex items-center justify-center font-bold">
                  <Store size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {editingProduct ? 'Edit Storefront Product' : 'Create New Storefront Product'}
                  </h2>
                  <p className="text-xs text-slate-500">India Post • Bulk Customer &amp; Postal Product Studio</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-black text-slate-700 uppercase">Product / Service Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priority Speed Post & Heavy Parcel Express"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase">SKU / ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. XPD-PARCEL-01"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase">Category Vertical *</label>
                  <select
                    value={formVertical}
                    onChange={(e) => setFormVertical(e.target.value as StaffProductVertical)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                  >
                    {ALL_PRODUCT_VERTICALS.filter(
                      (v) => isSuperAdmin || myRights.allowedVerticals.includes(v)
                    ).map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase">Pricing & Commission Model *</label>
                  <select
                    value={formPricingModel}
                    onChange={(e) => setFormPricingModel(e.target.value as ProductPricingModel)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                  >
                    <option value="Fixed Price">Fixed Price</option>
                    <option value="Subscription">Subscription</option>
                    <option value="Commission-based">Commission-based</option>
                    <option value="Free Service">Free Service</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase">Product Type *</label>
                  <select
                    value={formProductType}
                    onChange={(e) => setFormProductType(e.target.value as ProductItemType)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                  >
                    <option value="Service">Service</option>
                    <option value="Physical Item">Physical Item</option>
                    <option value="Digital Download">Digital Download</option>
                    <option value="Subscription">Subscription</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase">Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase">Commission / Partner Margin</label>
                  <input
                    type="text"
                    placeholder="e.g. 15% Partner Commission or ₹50/Lead"
                    value={formCommission}
                    onChange={(e) => setFormCommission(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase">WhatsApp Inquiry Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="919414170563"
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase">Beat Scope Assignment</label>
                  <select
                    disabled={!isSuperAdmin}
                    value={formAssignedBeat}
                    onChange={(e) => setFormAssignedBeat(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600 disabled:opacity-60"
                  >
                    <option value="All Beats">All Beats (Global Storefront)</option>
                    {Array.from({ length: 34 }, (_, i) => `Beat ${i + 1}`).map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase">Local Vendor / Store Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Agrawal Heritage Wholesale"
                    value={formVendorName}
                    onChange={(e) => setFormVendorName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase">Partner Selling Margin (%)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={formMarginPct}
                      onChange={(e) => setFormMarginPct(Number(e.target.value))}
                      className="w-24 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                    />
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formCodEligible}
                        onChange={(e) => setFormCodEligible(e.target.checked)}
                        className="w-4 h-4 accent-red-700"
                      />
                      <span>Speed Post COD Eligible</span>
                    </label>
                  </div>
                </div>

                {/* Thumbnail URL + Upload Preview */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black text-slate-700 uppercase">
                    Thumbnail Image URL or Upload Preview *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    <div className="w-24 h-20 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden shrink-0">
                      {formThumbnail ? (
                        <img
                          src={formThumbnail}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="text"
                        required
                        value={formThumbnail}
                        onChange={(e) => setFormThumbnail(e.target.value)}
                        placeholder="Upload thumbnail or keep default vertical studio photo"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-red-600"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-[11px] font-bold text-slate-700 cursor-pointer transition">
                        <Upload size={13} />
                        <span>Upload Thumbnail Image (JPG/PNG)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-black text-slate-700 uppercase">Rich Description *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe your product or service in detail..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-black text-slate-700 uppercase">Key Features (One per line)</label>
                  <textarea
                    rows={3}
                    placeholder="Free Doorstep Pickup&#10;Priority Dispatch&#10;WhatsApp Confirmation"
                    value={formFeatures}
                    onChange={(e) => setFormFeatures(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-black transition shadow-md cursor-pointer"
                >
                  {editingProduct ? 'Update Product' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inline Delete Confirmation Modal (Zero native window.confirm) */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Delete Storefront Product?</h3>
                <p className="text-xs text-slate-500">SKU: {deleteTarget.sku}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong>{deleteTarget.title}</strong> from your storefront catalog? You can also hide products instead of deleting them.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-xs font-black text-white cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
