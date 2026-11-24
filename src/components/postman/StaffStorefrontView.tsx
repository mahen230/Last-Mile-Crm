import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  ShieldCheck,
  Plus,
  MapPin,
  Phone,
  MessageCircle,
  Truck,
  CheckCircle2,
  Building2,
  Tag,
  FileText,
  AlertCircle,
  User,
  Calendar,
  Search,
  Package,
  ArrowRight,
  Sparkles,
  Award,
  Check,
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import {
  CommercialStoreCategory,
  CommercialStoreRecord,
  StoreEntityType,
  FourFactorVerificationResult,
} from '../../types/models';
import {
  commercialPropertyService,
  KOTA_PINCODE_ZONES,
} from '../../services/commercialPropertyService';
import { aiCommercialVerificationService } from '../../services/aiCommercialVerificationService';
import { staffProductService } from '../../services/staffProductService';

export default function StaffStorefrontView() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const currentBeat = userProfile?.beat || 'Beat 2';
  const staffName = userProfile?.name || 'Mahendra Kumar Meena';
  const staffId = userProfile?.employeeId || userProfile?.id || 'EMP-324009';
  const assignedPincode = userProfile?.officePincode || '324009';
  const assignedColonies = userProfile?.assignedColonies || ['Keshavpura Sector 7', 'Keshavpura Sector 6', 'Patel Nagar', 'Dadabari Extension'];

  const [stores, setStores] = useState<CommercialStoreRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'register' | 'my-stores' | 'delivery-pipeline'>('register');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CommercialStoreCategory>('Retail');

  // Registration Form State
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [colony, setColony] = useState(assignedColonies[0] || 'Keshavpura Sector 7');
  const [blockSector, setBlockSector] = useState('Sector 7');
  const [pincode, setPincode] = useState(assignedPincode);
  const [fullAddress, setFullAddress] = useState('');
  const [storeType, setStoreType] = useState<StoreEntityType>('LOCAL_MERCHANT');
  const [brandName, setBrandName] = useState('');
  
  // Product catalog onboarding items
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('299');
  const [productMargin, setProductMargin] = useState('45');
  const [addedProducts, setAddedProducts] = useState<Array<{ name: string; price: number; margin: number }>>([
    { name: 'Daily Essential Pack / Grocery Combo', price: 499, margin: 60 },
    { name: 'Speed Post Priority Parcel Box', price: 150, margin: 35 },
  ]);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setStores(commercialPropertyService.getAllStores());
    const unsub = commercialPropertyService.subscribe(() => {
      setStores(commercialPropertyService.getAllStores());
    });
    return () => unsub();
  }, []);

  // Filter stores belonging to this beat or pincode
  const beatStores = useMemo(() => {
    return stores.filter((s) => {
      const matchBeat = s.beatNo === currentBeat || s.serviceableBeats?.includes(currentBeat) || s.serviceableBeats?.includes('All Beats');
      const matchPin = s.pincode === assignedPincode;
      const matchSearch =
        !searchQuery ||
        s.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.colony.toLowerCase().includes(searchQuery.toLowerCase());
      return (matchBeat || matchPin) && matchSearch;
    });
  }, [stores, currentBeat, assignedPincode, searchQuery]);

  const handleAddProductDraft = () => {
    if (!productName.trim()) return;
    setAddedProducts((prev) => [
      ...prev,
      {
        name: productName.trim(),
        price: parseFloat(productPrice) || 199,
        margin: parseFloat(productMargin) || 30,
      },
    ]);
    setProductName('');
  };

  const handleRemoveProductDraft = (index: number) => {
    setAddedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRegisterStore = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!storeName.trim() || !ownerName.trim() || !phone.trim()) {
      setErrorMessage('Please provide Store Name, Owner Name, and Contact Number.');
      return;
    }

    try {
      const result = commercialPropertyService.registerB2BVendorStore({
        storeName: storeName.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        category: selectedCategory,
        colony: colony.trim(),
        blockSector: blockSector.trim(),
        pincode: pincode.trim(),
        beatNo: currentBeat,
        fullAddress: fullAddress.trim() || `${colony}, Dadabari, Kota PIN ${pincode}`,
        storeType: storeType,
        brandName: storeType === 'BRAND_FRANCHISE' ? (brandName.trim() || storeName.trim()) : undefined,
        serviceablePincodes: [assignedPincode, '324005', '324007'],
        serviceableBeats: [currentBeat, 'All Beats'],
        deliveryRadiusKm: 5,
        dispatchCutoffTime: '18:00 IST',
      });

      // Also register initial products if any
      for (const p of addedProducts) {
        staffProductService.addProduct({
          sku: `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          title: p.name,
          vertical: 'Custom Staff / Partner Products',
          vendorCategory: selectedCategory,
          pricingModel: 'Fixed Price',
          productType: 'Physical Item',
          price: p.price,
          wholesalePrice: Math.round(p.price * 0.8),
          sellingMarginAmount: p.margin,
          sellingMarginPercent: p.price > 0 ? Math.round((p.margin / p.price) * 100) : 25,
          commissionRate: '15%',
          codEligible: true,
          storeType: storeType,
          brandName: storeType === 'BRAND_FRANCHISE' ? (brandName.trim() || storeName.trim()) : undefined,
          vendorName: storeName.trim(),
          serviceablePincodes: [assignedPincode, '324005'],
          serviceableBeats: [currentBeat, 'All Beats'],
          deliveryRadiusKm: 5,
          beatManagerId: staffId,
          beatManagerName: staffName,
          staffId: staffId,
          staffName: staffName,
          staffMobile: userProfile?.mobile || '9829012345',
          whatsappNumber: userProfile?.mobile || '9829012345',
          beatNumber: currentBeat,
          subOffice: 'Dadabari S.O.',
          pincode: assignedPincode,
          status: 'ACTIVE',
          thumbnailUrl: '',
          features: ['Sovereign Guarantee', 'Beat Postman Verified', 'Fast Local Delivery'],
          description: `Directly verified and onboarded by Beat Postman ${staffName} (${currentBeat}, PIN ${assignedPincode}).`,
        });
      }

      setSuccessMessage(
        `Successfully registered "${storeName}" under ${currentBeat} (PIN ${assignedPincode}) with 4-Factor Field Verification & Sovereign Guarantee stamp!`
      );
      // Reset form
      setStoreName('');
      setOwnerName('');
      setPhone('');
      setFullAddress('');
      setAddedProducts([
        { name: 'Daily Essential Pack / Grocery Combo', price: 499, margin: 60 },
        { name: 'Speed Post Priority Parcel Box', price: 150, margin: 35 },
      ]);
      setActiveTab('my-stores');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to register store.');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-800 via-rose-700 to-amber-700 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-amber-200 text-xs font-bold border border-white/30">
            <ShieldCheck size={14} /> India Post Field Operations &middot; Dadabari S.O. ({assignedPincode})
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Beat Storefront & Business Registration Workbench
          </h1>
          <p className="text-xs sm:text-sm text-rose-100 max-w-2xl">
            Assigned Rider: <strong className="text-white">{staffName}</strong> ({currentBeat}) &bull; Onboard local merchants, execute 4-factor compliance audits, and bind last-mile delivery routes instantly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md ${
              activeTab === 'register' ? 'bg-amber-400 text-slate-950' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <Plus size={15} /> Register New Store
          </button>
          <button
            onClick={() => setActiveTab('my-stores')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md ${
              activeTab === 'my-stores' ? 'bg-amber-400 text-slate-950' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <Store size={15} /> My Beat Stores ({beatStores.length})
          </button>
          <button
            onClick={() => setActiveTab('delivery-pipeline')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md ${
              activeTab === 'delivery-pipeline' ? 'bg-amber-400 text-slate-950' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <Truck size={15} /> Delivery Pipeline
          </button>
        </div>
      </div>

      {/* Success / Error Banners */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-emerald-900 text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900 font-black">
            &times;
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-2xl flex items-center justify-between text-red-900 text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-700 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-red-700 hover:text-red-900 font-black">
            &times;
          </button>
        </div>
      )}

      {/* TAB 1: REGISTER NEW STORE & 4-FACTOR ONBOARDING FORM */}
      {activeTab === 'register' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Store size={20} className="text-red-700" />
                <span>On-Ground Business Registration &amp; 4-Factor Audit</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Record store details, upload initial inventory items, and automatically bind to {currentBeat} (PIN {assignedPincode}).
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold">
              <Award size={14} className="text-amber-700" /> Postman Verified Stamp Ready
            </div>
          </div>

          <form onSubmit={handleRegisterStore} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store / Outlet Type</label>
                <select
                  value={storeType}
                  onChange={(e) => setStoreType(e.target.value as StoreEntityType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="LOCAL_MERCHANT">Local Merchant / Kirana / Stall</option>
                  <option value="BRAND_FRANCHISE">National / Regional Brand Store</option>
                  <option value="CIVIC_UTILITY">Civic Utility / Government Kiosk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as CommercialStoreCategory)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="Retail">Retail Store & Kirana</option>
                  <option value="Wholesale">Wholesale & Distributor</option>
                  <option value="Services">Services & Saloon / Cafe</option>
                  <option value="eMitra/CSC">eMitra & Digital CSC Kiosk</option>
                  <option value="Healthcare & Education">Healthcare & Pharmacy</option>
                  <option value="Events & Hospitality Venues">Events & Hospitality</option>
                  <option value="Postal & Government Services">Postal & Govt Counter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Beat &amp; Jurisdiction</label>
                <input
                  type="text"
                  disabled
                  value={`${currentBeat} • Dadabari S.O. (${assignedPincode})`}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            {storeType === 'BRAND_FRANCHISE' && (
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-indigo-900">Brand Franchise Name / Outlet Title</label>
                <input
                  type="text"
                  placeholder="e.g. Domino's Pizza Dadabari, Reliance Smart Bazaar"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-indigo-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Name / Business Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Balaji General Store & Dairy"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Proprietor / Owner Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9829012345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Colony / Locality</label>
                <select
                  value={colony}
                  onChange={(e) => setColony(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-none"
                >
                  {assignedColonies.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                  <option value="Dadabari Main Road">Dadabari Main Road</option>
                  <option value="Mahaveer Nagar Extension">Mahaveer Nagar Extension</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sector / Block No.</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 7, Block B"
                  value={blockSector}
                  onChange={(e) => setBlockSector(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Exact Full Address &amp; GPS Landmark</label>
              <input
                type="text"
                placeholder="e.g. Near Hanuman Temple, Keshavpura Sector 7, Kota"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            {/* Product Catalog Items Onboarding */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Package size={16} className="text-red-700" />
                    <span>Catalog Items &amp; Beat Margin Highlights ({addedProducts.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500">Add products to instantly populate this merchant's storefront catalog.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="sm:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Organic Cow Milk 1L / Special Combo"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Retail Price (₹)</label>
                  <input
                    type="number"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Beat Margin (₹)</label>
                  <input
                    type="number"
                    value={productMargin}
                    onChange={(e) => setProductMargin(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddProductDraft}
                    className="w-full py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition shadow-xs"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>
              </div>

              {addedProducts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {addedProducts.map((p, idx) => (
                    <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-slate-500 font-medium">₹{p.price} • Margin: <strong className="text-emerald-700">₹{p.margin}</strong></div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProductDraft(idx)}
                        className="text-red-600 hover:text-red-800 font-bold px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white rounded-2xl text-xs font-black shadow-lg flex items-center gap-2 cursor-pointer transition"
              >
                <ShieldCheck size={16} /> Submit &amp; Verify Store for {currentBeat}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: MY BEAT STORES */}
      {activeTab === 'my-stores' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <Store size={18} className="text-red-700" />
              <h2 className="text-sm font-black text-slate-900">
                Registered Stores in {currentBeat} ({beatStores.length})
              </h2>
            </div>
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search store, owner or colony..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {beatStores.map((store) => {
              const evalResult = aiCommercialVerificationService.evaluateStoreFourFactor(store);
              return (
                <div
                  key={store.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-red-300 transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
                        {store.category}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <Check size={10} /> Verified by Postman
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-slate-900">{store.storeName}</h3>
                      <p className="text-xs text-slate-600">Proprietor: <strong className="text-slate-900">{store.ownerName}</strong></p>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-red-700 shrink-0" />
                        <span>{store.colony} • PIN {store.pincode} ({store.beatNo || currentBeat})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={13} className="text-emerald-700 shrink-0" />
                        <span className="font-mono">{store.primaryPhone}</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-semibold">4-Factor Score</span>
                      <span className="font-black text-emerald-700">{evalResult.score}/100 • {evalResult.freshnessStatus}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigate('/storefront')}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition"
                    >
                      <span>View Storefront</span>
                      <ArrowRight size={12} />
                    </button>
                    {store.primaryPhone && (
                      <a
                        href={`https://wa.me/91${store.primaryPhone.replace(/\D/g, '')}?text=Namaste%20from%20India%20Post%20(${currentBeat},%20Dadabari%20S.O.%20324009)%20regarding%20your%20storefront%20listing.`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 transition"
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            {beatStores.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <Store size={36} className="mx-auto text-slate-300" />
                <h3 className="text-sm font-black text-slate-800">No stores registered in {currentBeat} yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click the "Register New Store" tab above to onboard local Kirana stores, tea stalls, dairies, and brand outlets on the spot.
                </p>
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Register Store Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DELIVERY PIPELINE */}
      {activeTab === 'delivery-pipeline' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Truck size={18} className="text-red-700" />
                <span>Last-Mile Delivery &amp; Speed Post Fulfillment Pipeline ({currentBeat})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Orders and COD bookings originating from registered stores in your beat route directly to your rider dashboard.
              </p>
            </div>
            <div className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
              Active Fulfillment SLA: &lt; 2 Hours
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'ORD-94821',
                store: 'Balaji General Store (Keshavpura S-7)',
                customer: 'Amit Sharma (House #445)',
                amount: '₹649 (Speed Post COD)',
                status: 'Ready for Rider Pickup',
                time: '10 mins ago',
              },
              {
                id: 'ORD-94820',
                store: 'Shri Ram Dairy & Milk Booth',
                customer: 'Priya Verma (Sector 6)',
                amount: '₹320 (Online Paid)',
                status: 'Dispatched by Postman',
                time: '45 mins ago',
              },
              {
                id: 'ORD-94819',
                store: 'Domino\'s Pizza Dadabari',
                customer: 'Dr. R. K. Mehta (Patel Nagar)',
                amount: '₹899 (Express Priority)',
                status: 'Delivered Successfully',
                time: '2 hours ago',
              },
            ].map((ord) => (
              <div key={ord.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">{ord.id}</span>
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-800 rounded-md text-[10px] font-bold border border-rose-200">
                      {ord.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 font-semibold">Store: {ord.store}</div>
                  <div className="text-[11px] text-slate-500">Customer: {ord.customer} &bull; {ord.time}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-900">{ord.amount}</span>
                  <button
                    onClick={() => alert(`Fulfillment action initiated for order ${ord.id} in ${currentBeat}.`)}
                    className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs"
                  >
                    Process Delivery
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
