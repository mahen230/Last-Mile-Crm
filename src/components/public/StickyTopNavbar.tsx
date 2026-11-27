import React, { useState } from 'react';
import {
  Menu,
  Search,
  X,
  MapPin,
  Globe,
  ShoppingCart,
  Truck,
  CalendarCheck,
  Navigation,
  ChevronDown,
} from 'lucide-react';
import { SupportedLanguage, LANGUAGE_OPTIONS, translate } from '../../utils/localization';
import { PINCODE_OFFICE_HUBS } from '../../services/pincodeOperationsService';

interface StickyTopNavbarProps {
  lang: SupportedLanguage;
  onSelectLang: (lang: SupportedLanguage) => void;
  activePincode: string;
  onSelectPincodeValue: (pincode: string) => void;
  onAutoDetectPincode: () => void;
  isDetectingPincode?: boolean;
  onOpenPincodeModal: () => void;
  onOpenDrawer: () => void;
  onOpenCart: () => void;
  onOpenTracker: () => void;
  onOpenCitizenModal: () => void;
  cartCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function StickyTopNavbar({
  lang,
  onSelectLang,
  activePincode,
  onSelectPincodeValue,
  onAutoDetectPincode,
  isDetectingPincode = false,
  onOpenPincodeModal,
  onOpenDrawer,
  onOpenCart,
  onOpenTracker,
  onOpenCitizenModal,
  cartCount,
  searchQuery,
  onSearchChange,
}: StickyTopNavbarProps) {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const scrollToAnchor = (anchorId: string) => {
    const el = document.getElementById(anchorId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-zinc-900/90 border-b border-slate-200/80 dark:border-zinc-800 transition-all shadow-xs">
      {/* Main Single-Row Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Left Zone: Hamburger Drawer Button + Brand Wordmark + 13-Pincode Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenDrawer}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            aria-label={translate('nav_menu', lang)}
            title={translate('nav_menu', lang)}
            id="sticky-top-drawer-btn"
          >
            <Menu size={20} />
          </button>

          <button
            type="button"
            onClick={() => scrollToAnchor('hero-auto-slider')}
            className="flex items-center gap-2 text-left cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-red-700 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
              📮
            </div>
            <div>
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-red-700 transition">
                INDIA POST
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight hidden sm:block">
                Postal &amp; Bulk Customer Hub
              </div>
            </div>
          </button>

          {/* Direct 13-Pincode Selector + Auto GPS Detect */}
          <div className="hidden md:flex items-center rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200/70 dark:border-zinc-700 overflow-hidden shrink-0">
            <button
              type="button"
              onClick={onOpenPincodeModal}
              className="pl-2.5 pr-1 py-1.5 text-red-600 dark:text-red-400 hover:text-red-700 cursor-pointer"
              title="Open 13 Pincode Hub Directory"
              id="sticky-pincode-trigger-btn"
            >
              <MapPin size={13} />
            </button>
            <select
              value={activePincode}
              onChange={(e) => onSelectPincodeValue(e.target.value)}
              aria-label="Select Delivery Pincode"
              id="sticky-pincode-select"
              className="bg-transparent text-xs font-mono font-bold text-slate-800 dark:text-slate-100 py-1.5 pr-1 focus:outline-none cursor-pointer tabular-nums"
            >
              {PINCODE_OFFICE_HUBS.map((hub) => (
                <option key={hub.pincode} value={hub.pincode} className="bg-white dark:bg-zinc-900">
                  PIN {hub.pincode} · {hub.officeName.replace(' Sub Post Office', ' S.O.').replace(' Head Post Office', ' H.O.')}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onAutoDetectPincode}
              disabled={isDetectingPincode}
              title="Auto-detect nearest pincode via GPS"
              className="px-2 py-1.5 bg-emerald-600/10 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1 border-l border-slate-200/70 dark:border-zinc-700 transition cursor-pointer disabled:opacity-60"
            >
              <Navigation size={11} className={isDetectingPincode ? 'animate-spin' : ''} />
              <span>{isDetectingPincode ? '...' : 'Auto'}</span>
            </button>
          </div>
        </div>

        {/* Center Zone: Clean Single-Line Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <button
            type="button"
            onClick={() => scrollToAnchor('hero-auto-slider')}
            className="hover:text-red-700 dark:hover:text-amber-400 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            {translate('nav_home', lang)}
          </button>
          <button
            type="button"
            onClick={() => scrollToAnchor('top-trending-categories')}
            className="hover:text-red-700 dark:hover:text-amber-400 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            {translate('nav_categories', lang)}
          </button>
          <button
            type="button"
            onClick={() => scrollToAnchor('post-office-banking-store')}
            className="hover:text-red-700 dark:hover:text-amber-400 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            {translate('nav_post_office', lang)}
          </button>
          <button
            type="button"
            onClick={() => scrollToAnchor('exclusive-top-sellers')}
            className="hover:text-red-700 dark:hover:text-amber-400 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            {translate('nav_top_sellers', lang)}
          </button>
          <button
            type="button"
            onClick={onOpenTracker}
            className="hover:text-red-700 dark:hover:text-amber-400 transition cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1"
          >
            <Truck size={13} className="text-red-600 dark:text-red-400" />
            <span>{translate('nav_track_order', lang)}</span>
          </button>
        </nav>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-xs hidden sm:block">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={translate('search_placeholder', lang)}
            className="w-full pl-8 pr-7 py-1.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
            id="sticky-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Right Zone: Mobile PIN Trigger, Language Switcher, Cart & Book Visit */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenPincodeModal}
            className="md:hidden flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-slate-100 text-[11px] font-mono font-bold border border-slate-200 dark:border-zinc-700 cursor-pointer"
            aria-label="Select Pincode"
          >
            <MapPin size={12} className="text-red-600" />
            <span>{activePincode}</span>
          </button>

          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-200/60 dark:border-zinc-700"
              title="Change Language"
            >
              <Globe size={13} className="text-amber-500 shrink-0" />
              <span className="font-mono">{lang.toUpperCase()}</span>
              <ChevronDown size={11} className="text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => {
                      onSelectLang(opt.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                      lang === opt.code
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{opt.flag}</span>
                      <span>{opt.nativeName}</span>
                    </span>
                    {lang === opt.code && <span className="text-[10px] text-amber-600 font-mono">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenCart}
            className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-700 hover:bg-emerald-800 text-white transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
            id="sticky-cart-btn"
          >
            <ShoppingCart size={14} />
            <span className="hidden xs:inline">{translate('nav_cart', lang)}</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white text-emerald-900 font-mono text-[10px] font-black tabular-nums">
              {cartCount}
            </span>
          </button>

          {/* Primary CTA: Book Visit */}
          <button
            type="button"
            onClick={onOpenCitizenModal}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-700 hover:bg-red-800 text-white transition flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
            id="sticky-book-visit-btn"
          >
            <CalendarCheck size={12} />
            <span className="hidden xs:inline">{translate('nav_book_visit', lang)}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
