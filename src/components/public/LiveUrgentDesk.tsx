import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  Clock,
  MessageCircle,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SupportedLanguage, translate } from '../../utils/localization';
import { getPincodeHub } from '../../services/pincodeOperationsService';

export interface UrgentLiveDeal {
  id: string;
  sku: string;
  categoryTag: string;
  fullTitle: string;
  vendorName: string;
  beatNo: string;
  mrpPrice: number;
  flashPrice: number;
  deliveryFee: number;
  expiresInMinutes: number;
  urgencyLabel: string;
  imageSrc: string;
  details: string;
}

interface LiveUrgentDeskProps {
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

export const URGENT_LIVE_DEALS: UrgentLiveDeal[] = [
  {
    id: 'deal-ippb-cover',
    sku: 'IPPB-ACCIDENT-COVER-399',
    categoryTag: 'SOVEREIGN BANKING',
    fullTitle: 'IPPB Sovereign ₹10 Lakh Group Accidental Insurance Policy (1 Year)',
    vendorName: 'Dadabari S.O. & IPPB Desk',
    beatNo: 'Beat 2',
    mrpPrice: 549,
    flashPrice: 399,
    deliveryFee: 0,
    expiresInMinutes: 320,
    urgencyLabel: 'Same-Day Digital Cert',
    imageSrc: '/src/assets/images/prod_ippb_merchant_qr_1794734841471.jpg',
    details: '₹10,00,000 accidental cover + ₹1,00,000 OPD education benefit. Doorstep biometric enrollment.',
  },
  {
    id: 'deal-study-parcel',
    sku: 'INP-BULK-STUDY-1299',
    categoryTag: 'BULK CUSTOMER · BOOKS',
    fullTitle: 'Competitive Exam Printed Module Bundle (5 kg Speed Post Parcel)',
    vendorName: 'Kota Academic Study Material Dispatch Hub',
    beatNo: 'Beat 14',
    mrpPrice: 1650,
    flashPrice: 1299,
    deliveryFee: 15,
    expiresInMinutes: 215,
    urgencyLabel: 'BNPL Tariff Ready',
    imageSrc: '/src/assets/images/prod_b2b_stationery_coaching_1794734844056.jpg',
    details: 'Printed academic study set packaged with tamper-proof wrap & India Post barcode tracking.',
  },
  {
    id: 'deal-kota-doria',
    sku: 'INP-BULK-DORIA-2450',
    categoryTag: 'BULK CUSTOMER · GI CRAFT',
    fullTitle: 'Kaithoon GI-Tagged Kota Doria Handloom Gift Box (Insured COD)',
    vendorName: 'Kaithoon Kota Doria Weavers Guild',
    beatNo: 'Beat 1',
    mrpPrice: 3100,
    flashPrice: 2450,
    deliveryFee: 15,
    expiresInMinutes: 260,
    urgencyLabel: '12% Bulk Rebate (10+)',
    imageSrc: '/src/assets/images/store_kota_handloom_1794731364865.jpg',
    details: 'Handwoven pure cotton-silk Kota Doria saree packed directly at Kaithoon loom cooperative.',
  },
  {
    id: 'deal-mystamp-sheet',
    sku: 'INP-BULK-MYSTAMP-300',
    categoryTag: 'PHILATELY & CORPORATE',
    fullTitle: 'Official India Post Personalized My Stamp Sheet (12 Stamps)',
    vendorName: 'Kota H.O. Philately & Bulk Mail Desk',
    beatNo: 'Beat 1',
    mrpPrice: 350,
    flashPrice: 300,
    deliveryFee: 15,
    expiresInMinutes: 290,
    urgencyLabel: 'Valid Domestic Postage',
    imageSrc: '/src/assets/images/prod_mystamp_philately_1794734841690.jpg',
    details: 'Official commemorative postage sheet issued via Kota Head Post Office for events & institutions.',
  },
  {
    id: 'deal-courier-pouches',
    sku: 'INP-BULK-MAILER-1750',
    categoryTag: 'BULK PACKAGING · RIICO',
    fullTitle: 'India Post Tamper-Proof Courier Pouches (Pack of 250 · BNPL Ready)',
    vendorName: 'Indraprastha Packaging & Industrial Mailers',
    beatNo: 'Beat 1',
    mrpPrice: 2350,
    flashPrice: 1750,
    deliveryFee: 15,
    expiresInMinutes: 185,
    urgencyLabel: 'POD Jacket Included',
    imageSrc: '/src/assets/images/prod_b2b_cod_logistics_1794734840043.jpg',
    details: '70-micron tamper-evident shipping mailers engineered for Speed Post COD and BNPL shippers.',
  },
];

export default function LiveUrgentDesk({
  lang,
  activePincode,
  onAddToCart,
}: LiveUrgentDeskProps) {
  const [activeDealIndex, setActiveDealIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [timeLefts, setTimeLefts] = useState<number[]>(() =>
    URGENT_LIVE_DEALS.map((d) => d.expiresInMinutes * 60)
  );
  const hub = getPincodeHub(activePincode);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLefts((prev) => prev.map((sec) => (sec > 0 ? sec - 1 : 0)));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cycle = setInterval(() => {
      setActiveDealIndex((prev) => (prev + 1) % URGENT_LIVE_DEALS.length);
    }, 5000);
    return () => clearInterval(cycle);
  }, []);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const amount = direction === 'left' ? -320 : 320;
    scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const activeDeal = URGENT_LIVE_DEALS[activeDealIndex];

  return (
    <section
      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs transition-all space-y-3 p-3 sm:p-4"
      id="live-urgent-desk"
    >
      {/* Sleek Compact Header Bar with Ticker & Carousel Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-xs">
            <Flame size={12} className="animate-pulse text-amber-300" />
            <span>{translate('urgent_deal', lang)}</span>
          </span>

          <div className="text-xs truncate">
            <span className="font-bold text-slate-900 dark:text-white truncate">
              {activeDeal.fullTitle}
            </span>
            <span className="text-slate-400 mx-1.5 hidden sm:inline">·</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-mono font-black hidden sm:inline tabular-nums">
              ₹{(Number(activeDeal.flashPrice) || 0).toLocaleString('en-IN')}
              <span className="text-slate-400 line-through text-[10px] ml-1">
                ₹{(Number(activeDeal.mrpPrice) || 0).toLocaleString('en-IN')}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800 tabular-nums">
            <Clock size={12} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{formatTimer(timeLefts[activeDealIndex] || 0)}</span>
          </div>

          <div className="flex items-center gap-1 pl-1">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrolling Row */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-3 pb-1 pt-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {URGENT_LIVE_DEALS.map((deal, idx) => {
          const dealSavings = (Number(deal.mrpPrice) || 0) - (Number(deal.flashPrice) || 0);
          const dealPct = Math.round(
            (dealSavings / Math.max(1, Number(deal.mrpPrice) || 0)) * 100
          );
          const waText = encodeURIComponent(
            `Namaste India Post Hub Desk (${hub.officeName} · PIN ${activePincode}),\nI want to book / inquire about:\n*${deal.fullTitle}*\nTariff / Offer: ₹${(Number(deal.flashPrice) || 0).toLocaleString('en-IN')} (MRP: ₹${(Number(deal.mrpPrice) || 0).toLocaleString('en-IN')})\nBulk Partner / Desk: ${deal.vendorName} · ${deal.beatNo}`
          );

          return (
            <article
              key={deal.id}
              className="w-[270px] sm:w-[290px] shrink-0 snap-start bg-slate-50/70 dark:bg-zinc-950/60 rounded-xl border border-slate-200 dark:border-zinc-800 p-3 flex flex-col justify-between gap-2.5 hover:border-amber-400 dark:hover:border-amber-400 transition shadow-2xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">
                    {deal.categoryTag}
                  </span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                    <Clock size={10} />
                    <span>{formatTimer(timeLefts[idx] || 0)}</span>
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-slate-200 dark:border-zinc-700">
                    <img
                      src={deal.imageSrc}
                      alt={deal.fullTitle}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-xs text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {deal.fullTitle}
                    </h4>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {deal.vendorName}
                    </div>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-slate-200/80 dark:border-zinc-800 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5 tabular-nums">
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono">
                      ₹{(Number(deal.flashPrice) || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 line-through">
                      ₹{(Number(deal.mrpPrice) || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 font-mono">
                    Save ₹{dealSavings.toLocaleString('en-IN')} ({dealPct}%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-200/80 dark:border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    onAddToCart({
                      id: deal.id,
                      sku: deal.sku,
                      title: deal.fullTitle,
                      price: deal.flashPrice,
                      imageSrc: deal.imageSrc,
                      vendorName: deal.vendorName,
                      beatNo: deal.beatNo,
                    })
                  }
                  className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-slate-950 text-white font-bold flex items-center justify-center gap-1 transition text-[11px] cursor-pointer"
                >
                  <ShoppingCart size={11} className="text-amber-400 dark:text-slate-950" />
                  <span>Book · COD</span>
                </button>

                <a
                  href={`https://api.whatsapp.com/send?phone=${hub.whatsappPhone}&text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1 transition text-[11px]"
                >
                  <MessageCircle size={11} />
                  <span>WhatsApp</span>
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
