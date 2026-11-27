import React, { useRef } from 'react';
import {
  Flame,
  ShoppingCart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { SupportedLanguage, translate } from '../../utils/localization';
import { CategoryAvailability, getPincodeHub } from '../../services/pincodeOperationsService';

export interface TopSellingItem {
  id: string;
  sku: string;
  title: string;
  brand: string;
  categoryTag: string;
  mrpPrice: number;
  retailPrice: number;
  beatNo: string;
  pincode: string;
  imageSrc: string;
  badge: string;
}

interface ExclusiveTopSellersProps {
  lang: SupportedLanguage;
  activePincode: string;
  availability?: CategoryAvailability;
  onAddToCart: (item: {
    id: string;
    sku: string;
    title: string;
    price: number;
    imageSrc: string;
    vendorName: string;
    beatNo: string;
  }) => void;
  onViewMore?: () => void;
}

export const EXCLUSIVE_TOP_SELLING_ITEMS: TopSellingItem[] = [
  {
    id: 'top-inp-study-bundle',
    sku: 'INP-BULK-STUDY-1299',
    title: 'Competitive Exam Printed Module Bundle (5 kg Business Parcel)',
    brand: 'Kota Academic Study Material Dispatch Hub',
    categoryTag: 'Books & Study Material',
    mrpPrice: 1650,
    retailPrice: 1299,
    beatNo: 'Beat 14',
    pincode: '324005',
    imageSrc: '/src/assets/images/prod_b2b_stationery_coaching_1794734844056.jpg',
    badge: 'BNPL Bulk Dispatch',
  },
  {
    id: 'top-inp-kota-doria',
    sku: 'INP-BULK-DORIA-2450',
    title: 'Authentic GI-Tagged Kota Doria Handloom Gift Box',
    brand: 'Kaithoon Kota Doria Weavers Guild',
    categoryTag: 'Handloom & Textiles',
    mrpPrice: 3100,
    retailPrice: 2450,
    beatNo: 'Beat 1',
    pincode: '325001',
    imageSrc: '/src/assets/images/store_kota_handloom_1794731364865.jpg',
    badge: 'GI Craft Verified',
  },
  {
    id: 'top-inp-medkit',
    sku: 'INP-BULK-MEDKIT-1499',
    title: 'Clinic & Home First-Aid + Digital BP Monitoring Pack',
    brand: 'Dadabari Surgical & Pharmacy Distributors',
    categoryTag: 'Medical & Diagnostics',
    mrpPrice: 1990,
    retailPrice: 1499,
    beatNo: 'Beat 2',
    pincode: '324009',
    imageSrc: '/src/assets/images/prod_b2b_pharma_wellness_1794734843342.jpg',
    badge: 'Beat 2 Fast Dispatch',
  },
  {
    id: 'top-inp-hadoti-agro',
    sku: 'INP-BULK-AGRO-890',
    title: 'Hadoti Whole Spices & Cold-Pressed Mustard Oil 5kg Box',
    brand: 'Hadoti Spice & Agro Producers Collective',
    categoryTag: 'Agro & Regional Goods',
    mrpPrice: 1150,
    retailPrice: 890,
    beatNo: 'Beat 1',
    pincode: '325205',
    imageSrc: '/src/assets/images/prod_b2b_kirana_wholesale_1794734842973.jpg',
    badge: 'Direct FPO Origin',
  },
  {
    id: 'top-inp-mailers',
    sku: 'INP-BULK-MAILER-1750',
    title: 'India Post Pre-Printed Tamper-Proof Courier Pouches (250 Pack)',
    brand: 'Indraprastha Packaging & Industrial Mailers',
    categoryTag: 'Industrial & Packaging',
    mrpPrice: 2350,
    retailPrice: 1750,
    beatNo: 'Beat 1',
    pincode: '324003',
    imageSrc: '/src/assets/images/prod_b2b_cod_logistics_1794734840043.jpg',
    badge: '70-Micron Seal',
  },
  {
    id: 'top-inp-mystamp',
    sku: 'INP-BULK-MYSTAMP-300',
    title: 'Personalized India Post My Stamp Sheet (12 Official Stamps)',
    brand: 'Kota GPO Philately & Corporate MyStamp Desk',
    categoryTag: 'Philately & Official',
    mrpPrice: 300,
    retailPrice: 300,
    beatNo: 'Beat 1',
    pincode: '324001',
    imageSrc: '/src/assets/images/prod_mystamp_philately_1794734841690.jpg',
    badge: 'Official Postage',
  },
  {
    id: 'top-inp-gangajal',
    sku: 'INP-BULK-GANGAJAL-60',
    title: 'India Post Gangotri Sacred Gangajal Pack (250 ml × 2)',
    brand: 'India Post Official Counter',
    categoryTag: 'Postal Counter Item',
    mrpPrice: 70,
    retailPrice: 60,
    beatNo: 'Beat 2',
    pincode: '324009',
    imageSrc: '/src/assets/images/prod_gangajal_sacred_1794734840915.jpg',
    badge: 'Bottled at Gangotri',
  },
  {
    id: 'top-inp-dlc',
    sku: 'INP-CITIZEN-DLC-70',
    title: 'Jeevan Pramaan Digital Life Certificate (Doorstep Biometric)',
    brand: 'India Post & IPPB Pensioner Desk',
    categoryTag: 'Citizen Banking',
    mrpPrice: 70,
    retailPrice: 70,
    beatNo: 'Beat 2',
    pincode: '324009',
    imageSrc: '/src/assets/images/prod_jeevan_pramaan_dlc_1794734841567.jpg',
    badge: 'Doorstep Service',
  },
];

export default function ExclusiveTopSellers({
  lang,
  activePincode,
  availability = { open: true, stockStatus: 'IN_STOCK' },
  onAddToCart,
  onViewMore,
}: ExclusiveTopSellersProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hub = getPincodeHub(activePincode);
  const isClosedOrOut = !availability.open || availability.stockStatus === 'OUT_OF_STOCK';

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const amount = direction === 'left' ? -340 : 340;
    scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const handleTriggerViewMore = () => {
    if (onViewMore) {
      onViewMore();
    } else {
      const el = document.getElementById('bulk-customer-showcase');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-zinc-800" id="exclusive-top-sellers">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex flex-wrap items-center gap-1.5">
            <Flame size={14} className="text-red-600 shrink-0" />
            <span>{translate('sec_top_sellers', lang)} · PIN {activePincode}</span>
            {!availability.open ? (
              <span className="text-rose-600 dark:text-rose-400">· Hub Closed</span>
            ) : availability.stockStatus === 'OUT_OF_STOCK' ? (
              <span className="text-rose-600 dark:text-rose-400">· Out of Stock</span>
            ) : availability.stockStatus === 'LOW_STOCK' ? (
              <span className="text-amber-600 dark:text-amber-400">· Limited Stock</span>
            ) : null}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Featured Bulk Customer &amp; India Post Offerings
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
            Speed Post COD &amp; Business Parcel Dispatch
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
        className={`flex overflow-x-auto gap-3.5 pb-4 pt-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          isClosedOrOut ? 'opacity-65' : ''
        }`}
      >
        {EXCLUSIVE_TOP_SELLING_ITEMS.map((item) => {
          const mrp = Number(item.mrpPrice) || 0;
          const retail = Number(item.retailPrice) || 0;
          const discountPct = Math.max(0, Math.round(((mrp - retail) / Math.max(1, mrp)) * 100));
          const displayPin = activePincode || item.pincode;

          const waText = encodeURIComponent(
            `Namaste India Post Hub Desk (${hub.officeName} · PIN ${displayPin}),\nBooking / Bulk Inquiry for:\n*${item.title}* (${item.brand} · ${item.sku})\nMRP: ₹${mrp.toLocaleString('en-IN')} | Tariff / Offer: ₹${retail.toLocaleString('en-IN')}\nSpeed Post Dispatch`
          );

          return (
            <article
              key={item.id}
              className="w-[270px] sm:w-[285px] shrink-0 snap-start group bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-400 hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden shadow-2xs"
            >
              <div>
                <div className="relative aspect-[4/3] bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <img
                    src={item.imageSrc}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-xs">
                    {item.badge}
                  </div>
                  {isClosedOrOut && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs">
                      <Lock size={10} />
                      <span>{!availability.open ? 'Closed' : 'Out of Stock'}</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between gap-2 text-[11px] text-white">
                    <span className="font-bold text-amber-300 uppercase tracking-wide truncate">
                      {item.brand}
                    </span>
                    {discountPct > 0 && (
                      <span className="font-mono font-black text-emerald-300 shrink-0 tabular-nums">
                        {discountPct}% OFF
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 space-y-1.5">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between gap-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {item.categoryTag}
                    </span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold shrink-0 tabular-nums">
                      PIN {displayPin} · Speed Post
                    </span>
                  </div>

                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-amber-400 transition leading-snug line-clamp-2 min-h-[2.25rem]">
                    {item.title}
                  </h4>

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {hub.officeName} · {item.beatNo} · Speed Post COD
                  </div>

                  <div className="pt-1.5 border-t border-slate-100 dark:border-zinc-800 flex items-baseline justify-between gap-1.5">
                    <div className="flex items-baseline gap-1.5 tabular-nums min-w-0">
                      <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        ₹{(Number(retail) || 0).toLocaleString('en-IN')}
                      </span>
                      {mrp > retail && (
                        <span className="text-[11px] text-slate-400 line-through">
                          ₹{(Number(mrp) || 0).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                      {hub.slaMinutes} min
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 space-y-1.5 text-[11px]">
                <button
                  type="button"
                  disabled={isClosedOrOut}
                  onClick={() =>
                    onAddToCart({
                      id: item.id,
                      sku: item.sku,
                      title: item.title,
                      price: item.retailPrice,
                      imageSrc: item.imageSrc,
                      vendorName: item.brand,
                      beatNo: item.beatNo,
                    })
                  }
                  className="w-full py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-slate-950 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={12} className="text-amber-300 dark:text-slate-950" />
                  <span>{isClosedOrOut ? 'Unavailable in Hub' : translate('add_to_cart', lang)}</span>
                </button>

                <a
                  href={`https://api.whatsapp.com/send?phone=${hub.whatsappPhone}&text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition whitespace-nowrap text-[11px]"
                >
                  <MessageCircle size={12} />
                  <span>{translate('whatsapp_desk', lang)}</span>
                </a>
              </div>
            </article>
          );
        })}

        {/* View More Card */}
        <div
          onClick={handleTriggerViewMore}
          className="w-[200px] sm:w-[220px] shrink-0 snap-start flex flex-col items-center justify-center text-center p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/40 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:border-red-500 dark:hover:border-amber-400 transition cursor-pointer group shadow-2xs"
          role="button"
          tabIndex={0}
          aria-label="View More Promoted Items"
        >
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 flex items-center justify-center group-hover:scale-110 transition duration-200 mb-3 shadow-xs">
            <ArrowRight size={20} />
          </div>
          <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-amber-400 transition">
            Explore Bulk Showcase
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
            Browse verified India Post Bulk Customers &amp; promoted products
          </p>
          <span className="mt-3 px-3 py-1 rounded-lg bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 text-[10px] font-bold group-hover:bg-red-700 dark:group-hover:bg-amber-300 transition">
            See All Products
          </span>
        </div>
      </div>
    </section>
  );
}
