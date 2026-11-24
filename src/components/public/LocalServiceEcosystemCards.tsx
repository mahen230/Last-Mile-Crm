import React, { useState, useRef } from 'react';
import {
  Landmark,
  Zap,
  Shirt,
  Coffee,
  Sparkles,
  Store,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  X,
  ShoppingCart,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SupportedLanguage, translate } from '../../utils/localization';

export interface EcosystemStoreItem {
  sku: string;
  title: string;
  price: number;
  mrp: number;
  tag: string;
}

export interface EcosystemStore {
  id: string;
  name: string;
  categoryTitle: string;
  badge: string;
  imageSrc: string;
  gradient: string;
  icon: any;
  address: string;
  landmark: string;
  geoCoords: string;
  workingHours: string;
  managerName: string;
  phone: string;
  beatNo: string;
  catalog: EcosystemStoreItem[];
}

export const SERVICE_ECOSYSTEM_STORES: EcosystemStore[] = [
  {
    id: 'eco-banking',
    name: 'Dadabari Sub Post Office & IPPB Banking Hub',
    categoryTitle: 'Sovereign Banking, SSY & Insurance',
    badge: 'Official India Post Desk',
    imageSrc: '/src/assets/images/store_banking_finance_1794731363192.jpg',
    gradient: 'from-red-950 via-rose-900 to-slate-900',
    icon: Landmark,
    address: 'Near Shastri Park, Dadabari S.O., PIN 324009',
    landmark: 'Adjacent to Community Center & Shastri Circle',
    geoCoords: '25.1582° N, 75.8274° E',
    workingHours: '09:00 AM – 05:00 PM (Mon - Sat)',
    managerName: 'Mahendra Kumar Meena (Beat 2)',
    phone: '9460020640',
    beatNo: 'Beat 2',
    catalog: [
      { sku: 'SSA-8.2-PASSBOOK', title: 'Sukanya Samriddhi (SSY 8.2% Tax-Free)', price: 250, mrp: 250, tag: '8.2% Govt Yield' },
      { sku: 'SCSS-8.2-SENIOR', title: 'Senior Citizen Savings Scheme (SCSS 8.2%)', price: 1000, mrp: 1000, tag: 'Quarterly Interest' },
      { sku: 'IPPB-DIGI-ZERO', title: 'IPPB Zero-Balance Digital Savings Account', price: 0, mrp: 0, tag: 'Instant Doorstep KYC' },
      { sku: 'IPPB-ACCIDENT-399', title: 'IPPB ₹10 Lakh Sovereign Accidental Insurance', price: 399, mrp: 549, tag: '1-Year Coverage' },
      { sku: 'PLI-SURAKSHA-WHOLE', title: 'Postal Life Insurance (PLI Suraksha)', price: 1250, mrp: 1450, tag: 'Peak Sovereign Bonus' },
    ],
  },
  {
    id: 'eco-ev',
    name: 'XPEEDO EV & Green Mobility Regional Hub',
    categoryTitle: 'Electric Scooters, 60V Batteries & Chargers',
    badge: 'Authorized Hub',
    imageSrc: '/src/assets/images/ev_scooter_mobility_1794822882283.jpg',
    gradient: 'from-emerald-950 via-teal-900 to-cyan-950',
    icon: Zap,
    address: 'Plot 14, Dadabari Main Commercial Road, PIN 324009',
    landmark: 'Opposite Sector 2 Commercial Complex',
    geoCoords: '25.1595° N, 75.8291° E',
    workingHours: '08:30 AM – 08:30 PM (Daily)',
    managerName: 'Mahendra Kumar Meena',
    phone: '8769706002',
    beatNo: 'Beat 2',
    catalog: [
      { sku: 'XPEEDO-EV-X1PRO-54999', title: 'XPEEDO EV X1 Pro Electric Cargo Scooter', price: 54999, mrp: 68999, tag: '90km Range/Charge' },
      { sku: 'XPEEDO-BATTERY-60V-21999', title: '60V 30Ah LiFePO4 Smart Swappable Battery', price: 21999, mrp: 26500, tag: '3-Year Warranty' },
      { sku: 'XPEEDO-CHARGER-10A', title: '60V 10A Intelligent Auto-Cut Fast Charger', price: 2899, mrp: 3899, tag: 'Fast 3h Charge' },
      { sku: 'XPEEDO-GPS-SMART', title: 'Live Vehicle Barcode GPS Anti-Theft Kit', price: 1499, mrp: 2199, tag: 'Speed Post COD' },
    ],
  },
  {
    id: 'eco-bakery',
    name: 'Dadabari Fresh Artisanal Bakery & Dairy',
    categoryTitle: 'A2 Buffalo Milk, Paneer & Fresh Cakes',
    badge: 'Morning Cold-Chain',
    imageSrc: '/src/assets/images/local_bakery_dairy_1794822884061.jpg',
    gradient: 'from-amber-950 via-yellow-900 to-stone-900',
    icon: Coffee,
    address: 'Dadabari Chauraha, Sector 3 Corner, PIN 324009',
    landmark: 'Next to Government Senior Secondary School',
    geoCoords: '25.1575° N, 75.8280° E',
    workingHours: '06:00 AM – 10:00 PM (Daily)',
    managerName: 'Dadabari Dairy Master',
    phone: '8769706002',
    beatNo: 'Beat 2',
    catalog: [
      { sku: 'DAIRY-A2-MILK-2L', title: 'Fresh Desi Buffalo A2 Raw Milk (2 Litres)', price: 140, mrp: 160, tag: 'Morning 7 AM Del' },
      { sku: 'DAIRY-PANEER-500G', title: 'Fresh Malai Paneer 500g Vacuum Pack', price: 190, mrp: 220, tag: '100% Pure Buffalo' },
      { sku: 'BAKERY-TRUFFLE-CAKE', title: 'Belgian Dark Truffle Celebration Cake 1kg', price: 549, mrp: 699, tag: 'Same-Evening COD' },
    ],
  },
  {
    id: 'eco-qsr',
    name: "Domino's Pizza & Local QSR Food Junction",
    categoryTitle: 'Hot Pizza Combos, Garlic Bread & Burgers',
    badge: '35-Min Express COD',
    imageSrc: '/src/assets/images/brand_qsr_pizza_1794743632250.jpg',
    gradient: 'from-red-950 via-orange-950 to-slate-900',
    icon: Store,
    address: 'Dadabari Circle, Shopping Arcade, PIN 324009',
    landmark: 'Main Highway Link Junction',
    geoCoords: '25.1588° N, 75.8305° E',
    workingHours: '11:00 AM – 11:30 PM (Daily)',
    managerName: 'QSR Delivery Dispatch',
    phone: '9460020640',
    beatNo: 'Beat 3',
    catalog: [
      { sku: 'DOM-MEAL-COMBO', title: '2 Medium Cheese Burst Pizzas + Garlic Bread', price: 499, mrp: 650, tag: 'Hot Delivery 35m' },
      { sku: 'DOM-PEPPY-PANEER', title: 'Peppy Paneer Medium Pizza + Choco Lava Cake', price: 349, mrp: 440, tag: 'Student Favorite' },
    ],
  },
  {
    id: 'eco-fashion',
    name: "Allen Solly & Levi's Showroom Hub",
    categoryTitle: 'Polos, Denims, Blazers & Festive Ethnic',
    badge: 'Showroom Sealed Stock',
    imageSrc: '/src/assets/images/brand_apparel_fashion_1794743634256.jpg',
    gradient: 'from-slate-950 via-purple-950 to-indigo-950',
    icon: Shirt,
    address: 'Dadabari Commercial Main Road, PIN 324009',
    landmark: 'Near State Bank of India Dadabari Branch',
    geoCoords: '25.1579° N, 75.8268° E',
    workingHours: '10:30 AM – 09:30 PM (Mon - Sun)',
    managerName: 'Showroom Manager',
    phone: '9460020640',
    beatNo: 'Beat 2',
    catalog: [
      { sku: 'BRAND-SOLLY-POLO-1799', title: 'Allen Solly Pique Cotton Classic Polo', price: 999, mrp: 1499, tag: '100% Combed Cotton' },
      { sku: 'LEVI-511-DENIM', title: "Levi's 511 Slim Fit Stretch Denim Jeans", price: 2199, mrp: 3199, tag: 'Showroom Sealed' },
      { sku: 'FAB-KURTA-SILK', title: 'Fabindia Cotton-Silk Kurta & Pajama Set', price: 1799, mrp: 2499, tag: 'Festive Ready' },
    ],
  },
  {
    id: 'eco-laundry',
    name: 'Dadabari Express Steam Laundry & Hostel Wash',
    categoryTitle: '24-Hr Steam Dry Cleaning & Ironing',
    badge: 'Hostel & Family Care',
    imageSrc: '/src/assets/images/laundry_event_kit_1794822884997.jpg',
    gradient: 'from-violet-950 via-purple-900 to-fuchsia-950',
    icon: Sparkles,
    address: 'Sector 4 Service Lane, Dadabari, PIN 324009',
    landmark: 'Near Allen Coaching Student Enclave',
    geoCoords: '25.1568° N, 75.8256° E',
    workingHours: '07:30 AM – 09:30 PM (Daily)',
    managerName: 'Dadabari Laundry Lead',
    phone: '9460020640',
    beatNo: 'Beat 4',
    catalog: [
      { sku: 'LAU-STEAM-10PC', title: '10-Garment Express Steam Press & Sanitization', price: 249, mrp: 350, tag: 'Same-Day Return' },
      { sku: 'LAU-HOSTEL-MONTHLY', title: 'Kota Student Monthly Laundry Plan (24kg)', price: 899, mrp: 1200, tag: 'Weekly Doorstep Pickup' },
      { sku: 'LAU-DRYCLEAN-SUIT', title: '2-Piece Formal Blazer / Suit Dry Clean', price: 299, mrp: 450, tag: 'Sealed Kraft Pack' },
    ],
  },
];

interface LocalServiceEcosystemCardsProps {
  lang: SupportedLanguage;
  activePincode: string;
  onAddToCart: (item: {
    id: string;
    sku: string;
    title: string;
    price: number;
    imageSrc: string;
    vendorName: string;
    beatNo: string;
  }) => void;
}

export default function LocalServiceEcosystemCards({
  lang,
  activePincode,
  onAddToCart,
}: LocalServiceEcosystemCardsProps) {
  const [selectedStore, setSelectedStore] = useState<EcosystemStore | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const amount = direction === 'left' ? -350 : 350;
    scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-zinc-800" id="local-service-ecosystem-cards">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
            <Store size={14} />
            <span>{translate('sec_service_ecosystems', lang)} · PIN {activePincode}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Local Service Ecosystem Hubs
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
            Slide to view verified local centers &amp; full catalogs
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-slate-200 transition cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-slate-200 transition cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrolling Row of 6 Ecosystem Hub Cards ("scroll-x" pattern) */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-4 pb-4 pt-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {SERVICE_ECOSYSTEM_STORES.map((store) => {
          const IconComp = store.icon;
          return (
            <div
              key={store.id}
              onClick={() => setSelectedStore(store)}
              className="w-[280px] sm:w-[320px] shrink-0 snap-start group bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-red-400 dark:hover:border-amber-400 p-4 sm:p-5 flex flex-col justify-between gap-4 cursor-pointer shadow-2xs hover:shadow-lg transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${store.gradient} text-white shadow-md group-hover:scale-105 transition`}>
                    <IconComp size={22} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200 text-[11px] font-mono font-bold">
                    {store.catalog.length} SKUs Listed
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-red-700 dark:text-red-400 tracking-wider">
                    {store.badge}
                  </span>
                  <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-amber-400 transition leading-snug line-clamp-1">
                    {store.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {store.categoryTitle}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 truncate flex items-center gap-1 min-w-0">
                  <MapPin size={12} className="text-red-600 shrink-0" />
                  <span className="truncate">{store.landmark}</span>
                </span>
                <span className="font-bold text-red-700 dark:text-amber-400 group-hover:translate-x-0.5 transition flex items-center gap-1 shrink-0 ml-2">
                  <span>Explore</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>
          );
        })}

        {/* View All Centers Card */}
        <div
          onClick={() => {
            const el = document.getElementById('vendor-carousels-hub');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="w-[200px] sm:w-[220px] shrink-0 snap-start flex flex-col items-center justify-center text-center p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/40 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:border-red-500 dark:hover:border-amber-400 transition cursor-pointer group shadow-2xs"
          role="button"
          tabIndex={0}
          aria-label="View All Ecosystem Centers"
        >
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 flex items-center justify-center group-hover:scale-110 transition duration-200 mb-3 shadow-xs">
            <Store size={20} />
          </div>
          <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-amber-400 transition">
            View All Centers
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
            13 Pincode Hubs authorized merchant network
          </p>
          <span className="mt-3 px-3 py-1 rounded-lg bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 text-[10px] font-bold group-hover:bg-red-700 dark:group-hover:bg-amber-300 transition">
            Browse Directory
          </span>
        </div>
      </div>

      {/* Detailed Storefront Inspection Modal */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div
            className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedStore.name} Storefront`}
          >
            {/* Modal Header */}
            <div className={`p-5 bg-gradient-to-r ${selectedStore.gradient} text-white flex items-center justify-between`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <selectedStore.icon size={22} className="text-amber-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                    {selectedStore.badge} · PIN {activePincode}
                  </div>
                  <h3 className="font-black text-lg text-white truncate">
                    {selectedStore.name}
                  </h3>
                  <p className="text-xs text-slate-200 truncate">{selectedStore.categoryTitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStore(null)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer transition shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Storefront Verification & Routing Details */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="text-slate-400 flex items-center gap-1 font-semibold text-[11px]">
                  <MapPin size={12} className="text-red-600" />
                  <span>Physical Address &amp; GPS</span>
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200">{selectedStore.address}</div>
                <div className="text-slate-500 text-[11px]">{selectedStore.landmark}</div>
                <div className="font-mono text-[10px] text-amber-600 dark:text-amber-400">GPS: {selectedStore.geoCoords}</div>
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-200 sm:dark:border-zinc-800 sm:pl-3">
                <div className="text-slate-400 flex items-center gap-1 font-semibold text-[11px]">
                  <Clock size={12} className="text-emerald-600" />
                  <span>Hours &amp; Beat Contact</span>
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200">{selectedStore.workingHours}</div>
                <div className="text-slate-500 text-[11px]">Lead: {selectedStore.managerName}</div>
                <div className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">₹15 Flat Speed Post COD</div>
              </div>
            </div>

            {/* Product & Service Catalog for this Store */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Available In-Store Catalog &amp; Services
              </div>

              <div className="space-y-2">
                {selectedStore.catalog.map((item) => {
                  const mrp = Number(item.mrp) || 0;
                  const price = Number(item.price) || 0;
                  const itemWaText = encodeURIComponent(
                    `Namaste ${selectedStore.name} (PIN ${activePincode}),\nI want to order:\n*${item.title}* (${item.sku})\nPrice: ₹${price.toLocaleString('en-IN')} (MRP: ₹${mrp.toLocaleString('en-IN')}) · Delivery: ₹15 Beat COD`
                  );

                  return (
                    <div
                      key={item.sku}
                      className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300">
                            {item.tag}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {item.title}
                        </h5>
                        <div className="text-xs font-mono font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                          ₹{price.toLocaleString('en-IN')}
                          {mrp > price && (
                            <span className="text-slate-400 font-normal line-through ml-1.5 text-[11px]">
                              ₹{mrp.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onAddToCart({
                              id: item.sku,
                              sku: item.sku,
                              title: item.title,
                              price: item.price,
                              imageSrc: selectedStore.imageSrc,
                              vendorName: selectedStore.name,
                              beatNo: selectedStore.beatNo,
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-slate-950 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <ShoppingCart size={12} className="text-amber-400 dark:text-slate-950" />
                          <span>Add to Cart</span>
                        </button>

                        <a
                          href={`https://api.whatsapp.com/send?phone=91${selectedStore.phone}&text=${itemWaText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1"
                        >
                          <MessageCircle size={12} />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs">
              <a
                href={`https://api.whatsapp.com/send?phone=91${selectedStore.phone}&text=${encodeURIComponent(
                  `Namaste ${selectedStore.name} (PIN ${activePincode}), I need doorstep order support.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
              >
                <MessageCircle size={14} />
                <span>WhatsApp Hub Desk</span>
              </a>
              <button
                type="button"
                onClick={() => setSelectedStore(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 dark:hover:bg-zinc-700 transition cursor-pointer"
              >
                Close Storefront
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
