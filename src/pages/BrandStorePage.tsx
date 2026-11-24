import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Navigation,
  ShoppingCart,
  MessageCircle,
  Truck,
  Store,
  CheckCircle2,
  X,
  Plus,
  Minus,
  Trash2,
  Package,
} from 'lucide-react';
import {
  OFFICIAL_BRAND_STORES,
  getConsolidatedProductsForBrand,
  UnifiedBrandProduct,
} from '../services/brandDirectoryService';
import {
  PINCODE_OFFICE_HUBS,
  pincodeOperationsService,
  detectNearestPincodeHub,
  getPincodeHub,
} from '../services/pincodeOperationsService';
import { cartRecoveryService } from '../services/cartRecoveryService';
import { aiCommercialVerificationService } from '../services/aiCommercialVerificationService';
import { customerService } from '../services/customerService';

interface SharedCartItem {
  id: string;
  sku: string;
  title: string;
  price: number;
  quantity: number;
  imageSrc?: string;
  vendorName: string;
  beatNo?: string;
}

export default function BrandStorePage() {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const navigate = useNavigate();

  const [activePincode, setActivePincode] = useState<string>(() =>
    pincodeOperationsService.getActivePincode()
  );
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cartItems, setCartItems] = useState<SharedCartItem[]>(() =>
    cartRecoveryService.getSharedCart<SharedCartItem>()
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Centralized Checkout Form State
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutMobile, setCheckoutMobile] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [confirmedOrderBarcodes, setConfirmedOrderBarcodes] = useState<string[]>([]);

  useEffect(() => {
    const unsubPin = pincodeOperationsService.subscribe(() => {
      setActivePincode(pincodeOperationsService.getActivePincode());
    });
    const unsubCart = cartRecoveryService.subscribe(() => {
      setCartItems(cartRecoveryService.getSharedCart<SharedCartItem>());
    });
    return () => {
      unsubPin();
      unsubCart();
    };
  }, []);

  useEffect(() => {
    setSelectedCategory('ALL');
  }, [brandSlug]);

  const { brand, hub, productsByCategory, allProducts } = useMemo(
    () => getConsolidatedProductsForBrand(brandSlug || 'dominos-pizza', activePincode),
    [brandSlug, activePincode]
  );

  const categoryKeys = useMemo(() => Object.keys(productsByCategory), [productsByCategory]);

  const visibleCategoryEntries = useMemo(() => {
    if (selectedCategory === 'ALL') return Object.entries(productsByCategory);
    return Object.entries(productsByCategory).filter(([cat]) => cat === selectedCategory);
  }, [productsByCategory, selectedCategory]);

  const totalCartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );
  const totalCartAmount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const handlePincodeChange = (pin: string) => {
    const selectedHub = pincodeOperationsService.setActivePincode(pin, true);
    setActivePincode(selectedHub.pincode);
    setToastMsg(
      `Routed to PIN ${selectedHub.pincode} · ${selectedHub.officeName} (${selectedHub.localStockingPartner})`
    );
  };

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    try {
      const { hub: detected, source } = await detectNearestPincodeHub();
      pincodeOperationsService.setActivePincode(detected.pincode, true);
      setActivePincode(detected.pincode);
      setToastMsg(
        source === 'gps'
          ? `GPS routed to PIN ${detected.pincode} · ${detected.officeName}`
          : `Active regional hub: PIN ${detected.pincode} · ${detected.officeName}`
      );
    } finally {
      setIsDetecting(false);
    }
  };

  const handleAddToCentralCart = (product: UnifiedBrandProduct) => {
    const current = cartRecoveryService.getSharedCart<SharedCartItem>();
    const existing = current.find((i) => i.id === product.id || i.sku === product.sku);
    const next: SharedCartItem[] = existing
      ? current.map((i) => (i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i))
      : [
          ...current,
          {
            id: product.id,
            sku: product.sku,
            title: product.title,
            price: product.retailPrice,
            quantity: 1,
            imageSrc: product.imageSrc,
            vendorName: `${brand.brandName} (via ${hub.localStockingPartner})`,
            beatNo: hub.beatManager.split('(')[0].trim(),
          },
        ];

    cartRecoveryService.saveSharedCart(next);
    cartRecoveryService.captureActivity({
      items: next,
      pincode: activePincode,
      stage: 'CART_ADDED',
    });
    setToastMsg(`Added "${product.title}" to XPOKART Centralized Speed Post COD Cart.`);
  };

  const handleQtyUpdate = (id: string, delta: number) => {
    const next = cartItems
      .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
      .filter((item) => item.quantity > 0);
    cartRecoveryService.saveSharedCart(next);
    cartRecoveryService.captureActivity({
      items: next,
      pincode: activePincode,
      stage: next.length > 0 ? 'CART_ADDED' : 'CONVERTED',
    });
  };

  const handleRemoveItem = (id: string) => {
    const next = cartItems.filter((item) => item.id !== id);
    cartRecoveryService.saveSharedCart(next);
    cartRecoveryService.captureActivity({
      items: next,
      pincode: activePincode,
      stage: next.length > 0 ? 'CART_ADDED' : 'CONVERTED',
    });
  };

  const handleCloseCartDrawer = () => {
    if (cartItems.length > 0 && confirmedOrderBarcodes.length === 0) {
      cartRecoveryService.markAbandoned(activePincode, cartItems);
    }
    setIsCartOpen(false);
  };

  const handleCentralizedCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    const cleanName = checkoutName.trim();
    const cleanMobile = checkoutMobile.replace(/\D/g, '').slice(-10);
    if (cleanName.length < 2) {
      setCheckoutError('Please enter recipient full name.');
      return;
    }
    if (cleanMobile.length !== 10) {
      setCheckoutError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (cartItems.length === 0) {
      setCheckoutError('Your cart is empty.');
      return;
    }

    const activeHub = getPincodeHub(activePincode);
    const createdOrders = cartItems.map((item) =>
      aiCommercialVerificationService.createLogisticsDispatch({
        storeId: item.id,
        storeName: item.vendorName,
        productId: item.id,
        productTitle: `${item.title} (x${item.quantity})`,
        productSku: item.sku,
        productPrice: item.price * item.quantity,
        customerName: cleanName,
        customerMobile: cleanMobile,
        deliveryAddress:
          checkoutAddress.trim() || `${activeHub.landmarks[0]}, PIN ${activeHub.pincode}`,
        colony: activeHub.name,
        pincode: activeHub.pincode,
        beatNo: item.beatNo || 'Beat 2',
        pincodeManagerId: 'STAFF-50457421',
        pincodeManagerName: activeHub.beatManager,
        pincodeManagerContact: activeHub.whatsappPhone,
        serviceType: 'Speed Post COD',
        status: 'PENDING_PICKUP',
        codAmount: item.price * item.quantity,
        remarks: `Centralized XPOKART Checkout · ${activeHub.officeName} · ${activeHub.localStockingPartner}`,
      })
    );

    customerService.submitCustomerInquiry({
      customerName: cleanName,
      mobile: cleanMobile,
      productInterested: `XPOKART Official Brand Order (${cartItems.length} item${cartItems.length > 1 ? 's' : ''})`,
      requirement: `Speed Post COD Total ₹${totalCartAmount} | Barcodes: ${createdOrders.map((o) => o.speedPostBarcode).join(', ')}`,
      preferredContact: 'Doorstep Visit',
      address: checkoutAddress.trim() || `${activeHub.officeName} PIN ${activeHub.pincode}`,
      beatNo: 'Beat 2',
    });

    cartRecoveryService.markConverted(activeHub.pincode);
    cartRecoveryService.saveSharedCart([]);
    setConfirmedOrderBarcodes(createdOrders.map((o) => o.speedPostBarcode));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Clean Single-Row Top Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition"
            >
              <ArrowLeft size={14} />
              <span>Storefront</span>
            </button>
            <div className="text-sm sm:text-base font-black tracking-tight text-slate-900 whitespace-nowrap shrink-0">
              XPOKART <span className="text-red-700">Official Brands</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center rounded-xl bg-slate-100 border border-slate-200 overflow-hidden">
              <span className="pl-2.5 pr-1 text-red-700">
                <MapPin size={13} />
              </span>
              <select
                value={activePincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                aria-label="Select Regional Hub Pincode"
                className="bg-transparent text-xs font-mono font-bold text-slate-800 py-1.5 pr-2 focus:outline-none cursor-pointer tabular-nums"
              >
                {PINCODE_OFFICE_HUBS.map((h) => (
                  <option key={h.pincode} value={h.pincode}>
                    PIN {h.pincode} · {h.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAutoDetect}
                disabled={isDetecting}
                className="px-2.5 py-1.5 bg-emerald-600/10 hover:bg-emerald-600 hover:text-white text-emerald-700 text-[11px] font-bold flex items-center gap-1 border-l border-slate-200 transition cursor-pointer"
              >
                <Navigation size={11} className={isDetecting ? 'animate-spin' : ''} />
                <span>{isDetecting ? '...' : 'GPS'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setConfirmedOrderBarcodes([]);
                setIsCartOpen(true);
                if (cartItems.length > 0) {
                  cartRecoveryService.captureActivity({
                    items: cartItems,
                    pincode: activePincode,
                    stage: 'CHECKOUT_OPENED',
                  });
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
            >
              <ShoppingCart size={14} />
              <span>Checkout</span>
              <span className="px-1.5 rounded bg-white text-emerald-900 font-mono text-[10px] tabular-nums">
                {totalCartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {toastMsg && (
          <div className="bg-emerald-950 text-white rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{toastMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMsg(null)}
              className="text-emerald-300 hover:text-white cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Consolidated Brand Switcher Strip (1 Card per Official Brand — Zero Duplicates) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {OFFICIAL_BRAND_STORES.map((b) => {
            const active = b.slug === brand.slug;
            return (
              <Link
                key={b.slug}
                to={`/brand/${b.slug}`}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition border ${
                  active
                    ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {b.brandName}
              </Link>
            );
          })}
        </div>

        {/* Official Consolidated Brand Storefront Hero */}
        <section
          className={`relative rounded-3xl overflow-hidden text-white border border-slate-800 bg-gradient-to-r ${brand.accentGradient} shadow-xl`}
        >
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <img
              src={brand.coverImage}
              alt={brand.brandName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-amber-300 font-semibold">
                <ShieldCheck size={15} />
                <span>{brand.trustAssurance}</span>
                <span aria-hidden="true">·</span>
                <span>{brand.categoryLabel}</span>
              </div>

              <h1
                className="text-2xl sm:text-4xl font-black tracking-tight text-white"
                style={{ textWrap: 'balance' }}
              >
                {brand.brandName} · Official Store
              </h1>

              <p className="text-sm text-slate-200 max-w-2xl leading-relaxed">
                {brand.shortTagline}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Truck size={14} />
                  <span>{brand.deliveryGuarantee}</span>
                </span>
                <span aria-hidden="true" className="text-slate-400">
                  ·
                </span>
                <a
                  href={`https://api.whatsapp.com/send?phone=${hub.whatsappPhone}&text=${encodeURIComponent(
                    `Namaste XPOKART Support Desk (PIN ${hub.pincode}), I want assistance ordering from the ${brand.brandName} Official Store.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp Brand Concierge</span>
                </a>
              </div>
            </div>

            {/* Dynamic Regional Office & Local Stocking Partner Card */}
            <div className="lg:col-span-4 bg-black/50 backdrop-blur-md border border-white/15 rounded-2xl p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between text-amber-300 font-bold">
                <span>Routed Regional Delivery Hub</span>
                <span className="font-mono tabular-nums">PIN {hub.pincode}</span>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-black text-white">{hub.officeName}</div>
                <div className="text-slate-300">{hub.division} · {hub.slaMinutes} Min Express SLA</div>
              </div>
              <div className="pt-2.5 border-t border-white/15 space-y-1">
                <div className="text-slate-400">Assigned Local Stocking Partner</div>
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Store size={13} className="shrink-0" />
                  <span>{hub.localStockingPartner}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter Tabs inside Brand Store */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer whitespace-nowrap ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Categories ({allProducts.length})
            </button>
            {categoryKeys.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-red-700 text-white border-red-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat} ({productsByCategory[cat].length})
              </button>
            ))}
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Centralized XPOKART Speed Post COD Checkout · Flat ₹15 Beat Fee
          </div>
        </div>

        {/* Category-Grouped Product Sections */}
        <div className="space-y-8">
          {visibleCategoryEntries.map(([categoryTitle, items]) => (
            <section key={categoryTitle} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {categoryTitle}
                </h2>
                <span className="text-xs font-mono font-semibold text-slate-500 tabular-nums">
                  {items.length} {items.length === 1 ? 'Product' : 'Products'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => {
                  const discountPct = Math.max(
                    0,
                    Math.round(((item.mrpPrice - item.retailPrice) / Math.max(1, item.mrpPrice)) * 100)
                  );
                  return (
                    <article
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 hover:border-red-400 hover:shadow-md transition flex flex-col justify-between overflow-hidden"
                    >
                      <div>
                        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                          <img
                            src={item.imageSrc}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                          <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-xs text-white">
                            <span className="font-bold text-amber-300">{item.brandName}</span>
                            {discountPct > 0 && (
                              <span className="font-mono font-black text-emerald-300 tabular-nums">
                                {discountPct}% OFF
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <div className="text-xs text-slate-500 flex items-center justify-between">
                            <span>{item.badgeTag}</span>
                            <span className="font-mono text-emerald-700 font-semibold tabular-nums">
                              PIN {hub.pincode}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                            <div className="flex items-baseline gap-2 tabular-nums">
                              <span className="text-lg font-black text-slate-900">
                                ₹{item.retailPrice.toLocaleString('en-IN')}
                              </span>
                              {item.mrpPrice > item.retailPrice && (
                                <span className="text-xs text-slate-400 line-through">
                                  ₹{item.mrpPrice.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-semibold text-emerald-700">
                              Flat ₹15 COD
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/70 grid grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => handleAddToCentralCart(item)}
                          className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition whitespace-nowrap"
                        >
                          <ShoppingCart size={13} className="text-amber-300" />
                          <span>Add to Cart</span>
                        </button>
                        <a
                          href={`https://api.whatsapp.com/send?phone=${hub.whatsappPhone}&text=${encodeURIComponent(
                            `Namaste XPOKART Desk (PIN ${hub.pincode}), 1-Click Order for *${item.title}* (${item.sku}) @ ₹${item.retailPrice} via ${hub.localStockingPartner}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition whitespace-nowrap"
                        >
                          <MessageCircle size={13} />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Centralized Speed Post COD Checkout Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-slate-200">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingCart size={18} className="text-amber-400" />
                <div>
                  <div className="font-black text-sm">XPOKART Centralized COD Checkout</div>
                  <div className="text-[11px] text-slate-300">
                    PIN {hub.pincode} · {hub.officeName}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseCartDrawer}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {confirmedOrderBarcodes.length > 0 ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                    <CheckCircle2 size={18} />
                    <span>Order Dispatched via {hub.officeName}</span>
                  </div>
                  <p className="text-slate-700">
                    Stocking Partner: <strong>{hub.localStockingPartner}</strong>
                  </p>
                  <div className="space-y-1.5 font-mono font-bold text-emerald-800">
                    {confirmedOrderBarcodes.map((code) => (
                      <div key={code} className="p-2 bg-white rounded-lg border border-emerald-200">
                        {code}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold cursor-pointer"
                  >
                    Return to Storefront
                  </button>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="text-center py-12 space-y-3 text-xs text-slate-500">
                  <Package size={36} className="mx-auto text-slate-300" />
                  <div className="font-bold text-slate-800 text-sm">Your centralized cart is empty</div>
                  <p>Add official brand items to check out via Speed Post COD.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2.5">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 truncate">{item.title}</div>
                          <div className="text-[11px] text-slate-500">
                            {item.vendorName} · ₹{item.price}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleQtyUpdate(item.id, -1)}
                            className="p-1 rounded bg-white border border-slate-200 cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center font-mono font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyUpdate(item.id, 1)}
                            className="p-1 rounded bg-white border border-slate-200 cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-red-600 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleCentralizedCheckout} className="space-y-3 pt-4 border-t border-slate-200 text-xs">
                    {checkoutError && (
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold">
                        {checkoutError}
                      </div>
                    )}
                    <input
                      type="text"
                      required
                      value={checkoutName}
                      onChange={(e) => {
                        setCheckoutName(e.target.value);
                        cartRecoveryService.captureActivity({
                          items: cartItems,
                          pincode: activePincode,
                          stage: 'DETAILS_TYPED',
                          customerName: e.target.value,
                          customerMobile: checkoutMobile,
                          deliveryAddress: checkoutAddress,
                        });
                      }}
                      placeholder="Recipient Full Name *"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={checkoutMobile}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setCheckoutMobile(clean);
                        cartRecoveryService.captureActivity({
                          items: cartItems,
                          pincode: activePincode,
                          stage: 'DETAILS_TYPED',
                          customerName: checkoutName,
                          customerMobile: clean,
                          deliveryAddress: checkoutAddress,
                        });
                      }}
                      placeholder="10-Digit Mobile *"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                    />
                    <input
                      type="text"
                      required
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      placeholder={`Doorstep Address in PIN ${hub.pincode} *`}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                    <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-1">
                      <div className="flex justify-between text-slate-300">
                        <span>Subtotal ({totalCartCount} items)</span>
                        <span className="font-mono font-bold tabular-nums">
                          ₹{totalCartAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-amber-300 font-black pt-1 border-t border-white/15">
                        <span>Speed Post COD Payable</span>
                        <span className="font-mono tabular-nums">
                          ₹{totalCartAmount.toLocaleString('en-IN')} (+₹15 Beat Fee)
                        </span>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-black cursor-pointer transition"
                    >
                      Confirm Centralized COD Order
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
