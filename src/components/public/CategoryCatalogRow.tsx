import React, { useRef } from 'react';
import {
  ShoppingCart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { SupportedLanguage, translate } from '../../utils/localization';
import { CategoryAvailability, getPincodeHub } from '../../services/pincodeOperationsService';

export interface CatalogRowItem {
  id: string;
  sku: string;
  title: string;
  brand: string;
  categoryTag: string;
  mrpPrice: number;
  retailPrice: number;
  imageSrc: string;
  description?: string;
  beatNo?: string;
  beatManager?: string;
  pincode?: string;
  badge?: string;
}

interface CategoryCatalogRowProps {
  rowId: string;
  kicker: string;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  accentColor?: 'red' | 'emerald' | 'amber' | 'indigo' | 'purple';
  items: CatalogRowItem[];
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
  onViewMore: () => void;
  viewMoreTitle?: string;
  viewMoreSubtitle?: string;
}

export default function CategoryCatalogRow({
  rowId,
  kicker,
  title,
  subtitle,
  icon: IconComp,
  accentColor = 'red',
  items,
  lang,
  activePincode,
  availability = { open: true, stockStatus: 'IN_STOCK' },
  onAddToCart,
  onViewMore,
  viewMoreTitle = 'View Entire Catalog',
  viewMoreSubtitle = 'Explore all verified SKUs across 13 Pincode Hubs',
}: CategoryCatalogRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hub = getPincodeHub(activePincode);
  const isClosedOrOut = !availability.open || availability.stockStatus === 'OUT_OF_STOCK';

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const getAccentBadgeClass = () => {
    switch (accentColor) {
      case 'emerald':
        return 'text-emerald-700 dark:text-emerald-400';
      case 'amber':
        return 'text-amber-700 dark:text-amber-400';
      case 'indigo':
        return 'text-indigo-700 dark:text-indigo-400';
      case 'purple':
        return 'text-purple-700 dark:text-purple-400';
      default:
        return 'text-red-700 dark:text-red-400';
    }
  };

  return (
    <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-zinc-800" id={rowId}>
      {/* Header with Title, Availability Indicator & Scroll Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <div className={`text-xs font-bold uppercase tracking-wider flex flex-wrap items-center gap-2 ${getAccentBadgeClass()}`}>
            <span className="inline-flex items-center gap-1.5">
              {IconComp && <IconComp size={14} />}
              <span>{kicker}</span>
            </span>
            {!availability.open ? (
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                · Store Closed (PIN {activePincode})
              </span>
            ) : availability.stockStatus === 'OUT_OF_STOCK' ? (
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                · Temporarily Out of Stock
              </span>
            ) : availability.stockStatus === 'LOW_STOCK' ? (
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                · Limited Stock in PIN {activePincode}
              </span>
            ) : null}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight" style={{ textWrap: 'balance' }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Scroll Controls & Counter */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-xs font-mono text-slate-400 hidden sm:inline tabular-nums">
            {items.length} SKUs
          </span>
          <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-900 hover:text-white dark:hover:bg-amber-400 dark:hover:text-slate-950 text-slate-800 dark:text-slate-200 transition cursor-pointer"
              aria-label={`Scroll ${title} left`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-900 hover:text-white dark:hover:bg-amber-400 dark:hover:text-slate-950 text-slate-800 dark:text-slate-200 transition cursor-pointer"
              aria-label={`Scroll ${title} right`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrolling Track ("scroll-x" pattern) */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className={`flex gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
            isClosedOrOut ? 'opacity-65' : ''
          }`}
        >
          {items.map((item) => {
            const mrp = Number(item.mrpPrice) || 0;
            const retail = Number(item.retailPrice) || 0;
            const discountPct = Math.max(0, Math.round(((mrp - retail) / Math.max(1, mrp)) * 100));
            const beatNo = item.beatNo || 'Beat 2';
            const pincode = activePincode || item.pincode || '324009';

            const waText = encodeURIComponent(
              `Namaste India Post Hub Desk (PIN ${pincode}),\n1-Click Order for *${item.title}* (${item.brand} · ${item.sku}).\nMRP: ₹${mrp.toLocaleString('en-IN')} | Offer Price: ₹${retail.toLocaleString('en-IN')} (${discountPct}% Off)\nSpeed Post Beat Dispatch: ₹15 Flat Fee`
            );

            return (
              <article
                key={item.id}
                className="w-[270px] sm:w-[285px] shrink-0 snap-start group bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-red-400 dark:hover:border-amber-400 hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden shadow-2xs"
              >
                <div>
                  {/* 4:3 Image Container */}
                  <div className="relative aspect-[4/3] bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                    <img
                      src={item.imageSrc}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    {item.badge && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-xs">
                        {item.badge}
                      </div>
                    )}
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

                  {/* Card Content Area */}
                  <div className="p-3 space-y-1.5">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between gap-1.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {item.categoryTag}
                      </span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold shrink-0 tabular-nums">
                        PIN {pincode} · ₹15 Del
                      </span>
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-amber-400 transition leading-snug line-clamp-2 min-h-[2.25rem]">
                      {item.title}
                    </h4>

                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {hub.officeName} · {beatNo} · Speed Post COD
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

                {/* Action Buttons */}
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
                        beatNo: beatNo,
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

          {/* Prominent "View More" Card at the end of the row */}
          <div
            onClick={onViewMore}
            className="w-[200px] sm:w-[220px] shrink-0 snap-start flex flex-col items-center justify-center text-center p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/40 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:border-red-500 dark:hover:border-amber-400 transition cursor-pointer group shadow-2xs"
            role="button"
            tabIndex={0}
            aria-label={viewMoreTitle}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 flex items-center justify-center group-hover:scale-110 transition duration-200 mb-3 shadow-xs">
              <ArrowRight size={20} />
            </div>
            <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-amber-400 transition">
              {viewMoreTitle}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              {viewMoreSubtitle}
            </p>
            <span className="mt-3 px-3 py-1 rounded-lg bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 text-[10px] font-bold group-hover:bg-red-700 dark:group-hover:bg-amber-300 transition">
              See All SKUs
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
