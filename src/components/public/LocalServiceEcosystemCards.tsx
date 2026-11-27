import React, { useState, useRef } from 'react';
import {
  Landmark,
  BookOpen,
  Package,
  Award,
  HeartPulse,
  Sprout,
  MapPin,
  Clock,
  MessageCircle,
  X,
  ShoppingCart,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Building2,
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
    categoryTitle: 'Sovereign Banking, SSY, PLI & Beat 2 Delivery',
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
    id: 'eco-study-dispatch',
    name: 'Vigyan Nagar S.O. · Academic Bulk Dispatch',
    categoryTitle: 'Printed Study Modules, Books & BNPL Tariffs',
    badge: 'Bulk Customer · 324005',
    imageSrc: '/src/assets/images/prod_b2b_stationery_coaching_1794734844056.jpg',
    gradient: 'from-blue-950 via-indigo-900 to-slate-900',
    icon: BookOpen,
    address: 'Vigyan Nagar Sub Post Office, Kota PIN 324005',
    landmark: 'Academic & Coaching Parcel Counter',
    geoCoords: '25.1460° N, 75.8470° E',
    workingHours: '09:00 AM – 06:00 PM (Mon - Sat)',
    managerName: 'Academic Fulfillment Desk',
    phone: '9460020640',
    beatNo: 'Beat 14',
    catalog: [
      { sku: 'INP-BULK-STUDY-1299', title: 'Competitive Exam Printed Module Bundle (5 kg)', price: 1299, mrp: 1650, tag: 'BNPL Tariff Ready' },
      { sku: 'INP-BOOK-POST-45', title: 'Registered Printed Book Parcel Booking', price: 45, mrp: 60, tag: 'Pan-India Tracking' },
    ],
  },
  {
    id: 'eco-kota-doria',
    name: 'Kaithoon S.O. · Kota Doria Weavers Guild',
    categoryTitle: 'GI-Tagged Kota Doria Sarees & Handloom Parcels',
    badge: 'Bulk Customer · 325001',
    imageSrc: '/src/assets/images/store_kota_handloom_1794731364865.jpg',
    gradient: 'from-amber-950 via-red-900 to-stone-900',
    icon: Award,
    address: 'Kaithoon Sub Post Office, Kota Division PIN 325001',
    landmark: 'Heritage Handloom Cooperative Dispatch',
    geoCoords: '25.1180° N, 75.9570° E',
    workingHours: '09:30 AM – 05:30 PM (Mon - Sat)',
    managerName: 'Heritage Loom Cooperative',
    phone: '9460020640',
    beatNo: 'Beat 1',
    catalog: [
      { sku: 'INP-BULK-DORIA-2450', title: 'Authentic GI-Tagged Kota Doria Handloom Gift Box', price: 2450, mrp: 3100, tag: 'GI Craft Verified' },
      { sku: 'INP-HANDLOOM-COD', title: 'Insured Business Parcel COD Handloom Pack', price: 1850, mrp: 2200, tag: 'Speed Post Insured' },
    ],
  },
  {
    id: 'eco-kota-ho',
    name: 'Kota H.O. · Philately & Corporate MyStamp',
    categoryTitle: 'My Stamp Sheets, Gangajal & Institutional Mailers',
    badge: 'Head Post Office · 324001',
    imageSrc: '/src/assets/images/prod_mystamp_philately_1794734841690.jpg',
    gradient: 'from-red-950 via-amber-900 to-slate-900',
    icon: Landmark,
    address: 'Kota Head Post Office, Civil Lines, PIN 324001',
    landmark: 'Philately & Bulk Customer Counter',
    geoCoords: '25.1820° N, 75.8450° E',
    workingHours: '09:00 AM – 05:30 PM (Mon - Sat)',
    managerName: 'Philately & Bulk Mail Counter',
    phone: '9460020640',
    beatNo: 'Beat 1',
    catalog: [
      { sku: 'INP-BULK-MYSTAMP-300', title: 'Personalized India Post My Stamp Sheet (12 Stamps)', price: 300, mrp: 300, tag: 'Official Postage' },
      { sku: 'INP-BULK-GANGAJAL-60', title: 'Gangotri Sacred Gangajal Pack (250 ml × 2)', price: 60, mrp: 70, tag: 'Counter & Beat Stock' },
    ],
  },
  {
    id: 'eco-dadabari-med',
    name: 'Dadabari S.O. · Surgical & Pharma Dispatch',
    categoryTitle: 'Tamper-Evident Medical Kits & Clinic Supply',
    badge: 'Bulk Customer · 324009',
    imageSrc: '/src/assets/images/prod_b2b_pharma_wellness_1794734843342.jpg',
    gradient: 'from-emerald-950 via-teal-900 to-slate-900',
    icon: HeartPulse,
    address: 'Dadabari S.O. Beat 2 Commercial Cluster, PIN 324009',
    landmark: 'Moisture-Sealed Medical Dispatch Node',
    geoCoords: '25.1588° N, 75.8305° E',
    workingHours: '09:00 AM – 06:30 PM (Mon - Sat)',
    managerName: 'Mahendra Kumar Meena (Beat 2)',
    phone: '8769706002',
    beatNo: 'Beat 2',
    catalog: [
      { sku: 'INP-BULK-MEDKIT-1499', title: 'Clinic & Home First-Aid + Digital BP Pack', price: 1499, mrp: 1990, tag: 'Beat 2 Fast Dispatch' },
      { sku: 'INP-BULK-MAILER-1750', title: 'India Post Tamper-Proof Mailers (250 Pack)', price: 1750, mrp: 2350, tag: '70-Micron Seal' },
    ],
  },
  {
    id: 'eco-baran-agro',
    name: 'Baran H.O. · Hadoti Agro & FPO Dispatch',
    categoryTitle: 'Coriander, Spices & Cold-Pressed Mustard Parcels',
    badge: 'Baran Division · 325205',
    imageSrc: '/src/assets/images/prod_b2b_kirana_wholesale_1794734842973.jpg',
    gradient: 'from-lime-950 via-emerald-900 to-slate-900',
    icon: Sprout,
    address: 'Baran Head Post Office, Baran Division PIN 325205',
    landmark: 'FPO Agro Bulk Parcel Terminal',
    geoCoords: '25.1011° N, 76.5132° E',
    workingHours: '09:00 AM – 05:30 PM (Mon - Sat)',
    managerName: 'FPO Agro Dispatch',
    phone: '9460020640',
    beatNo: 'Beat 1',
    catalog: [
      { sku: 'INP-BULK-AGRO-890', title: 'Hadoti Whole Spices & Mustard Oil 5kg Box', price: 890, mrp: 1150, tag: 'Direct FPO Origin' },
      { sku: 'INP-BULK-MAILER-1750', title: 'Indraprastha RIICO Corrugated Shipping Carton', price: 1750, mrp: 2350, tag: 'Bulk Slab Discount' },
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
            <Building2 size={14} />
            <span>{translate('sec_service_ecosystems', lang)} · PIN {activePincode}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            India Post Divisional Hubs &amp; Bulk Dispatch Nodes
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
            Slide to inspect postal counters &amp; bulk dispatch desks
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

      {/* Horizontal Scrolling Row */}
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
                    {store.catalog.length} Offerings
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
                  <span>Inspect</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>
          );
        })}

        {/* View All Hubs Card */}
        <div
          onClick={() => {
            const el = document.getElementById('bulk-customer-showcase');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="w-[200px] sm:w-[220px] shrink-0 snap-start flex flex-col items-center justify-center text-center p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/40 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:border-red-500 dark:hover:border-amber-400 transition cursor-pointer group shadow-2xs"
          role="button"
          tabIndex={0}
          aria-label="View All Bulk Customer Hubs"
        >
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 flex items-center justify-center group-hover:scale-110 transition duration-200 mb-3 shadow-xs">
            <Package size={20} />
          </div>
          <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-amber-400 transition">
            All Bulk Showcase Hubs
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
            13 Pincode Post Office &amp; Bulk Dispatch Network
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
            aria-label={`${selectedStore.name} Hub`}
          >
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

            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="text-slate-400 flex items-center gap-1 font-semibold text-[11px]">
                  <MapPin size={12} className="text-red-600" />
                  <span>Office Address &amp; GPS</span>
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200">{selectedStore.address}</div>
                <div className="text-slate-500 text-[11px]">{selectedStore.landmark}</div>
                <div className="font-mono text-[10px] text-amber-600 dark:text-amber-400">GPS: {selectedStore.geoCoords}</div>
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-200 sm:dark:border-zinc-800 sm:pl-3">
                <div className="text-slate-400 flex items-center gap-1 font-semibold text-[11px]">
                  <Clock size={12} className="text-emerald-600" />
                  <span>Counter Hours &amp; Assigned Desk</span>
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200">{selectedStore.workingHours}</div>
                <div className="text-slate-500 text-[11px]">Lead: {selectedStore.managerName}</div>
                <div className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">Speed Post COD &amp; BNPL Ready</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Available Services &amp; Promoted Products
              </div>

              <div className="space-y-2">
                {selectedStore.catalog.map((item) => {
                  const mrp = Number(item.mrp) || 0;
                  const price = Number(item.price) || 0;
                  const itemWaText = encodeURIComponent(
                    `Namaste ${selectedStore.name} (PIN ${activePincode}),\nI want to book / inquire:\n*${item.title}* (${item.sku})\nPrice / Tariff: ₹${price.toLocaleString('en-IN')}`
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

            <div className="p-4 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs">
              <a
                href={`https://api.whatsapp.com/send?phone=91${selectedStore.phone}&text=${encodeURIComponent(
                  `Namaste ${selectedStore.name} (PIN ${activePincode}), I need doorstep postal or bulk dispatch assistance.`
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
                Close Hub View
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
