import React from 'react';
import imgSsy from '../../assets/images/scheme_ssy_sukanya_1794734839476.jpg';
import imgPli from '../../assets/images/scheme_pli_protection_1794734838755.jpg';
import imgScss from '../../assets/images/scheme_scss_senior_1794734838931.jpg';
import imgPpfWealth from '../../assets/images/scheme_ppf_nsc_wealth_1794734840742.jpg';
import imgIppbBanking from '../../assets/images/hero_postal_banking_1791904267944.jpg';
import imgMyStamp from '../../assets/images/prod_mystamp_philately_1794734841690.jpg';
import imgGangajal from '../../assets/images/prod_gangajal_sacred_1794734840915.jpg';
import imgDnkParcel from '../../assets/images/prod_b2b_cod_logistics_1794734840043.jpg';
import imgJeevanPramaan from '../../assets/images/prod_jeevan_pramaan_dlc_1794734841567.jpg';

interface SchemePosterArtworkProps {
  code: string;
  name: string;
  rateHighlight: string;
  categoryLabel: string;
}

interface SchemeVisualStyle {
  photoSrc?: string;
  gradient: string;
  accentHex: string;
  motifBgHex: string;
  sealLabel: string;
  renderUniqueMotif?: () => React.ReactNode;
}

const SCHEME_VISUAL_CONFIG: Record<string, SchemeVisualStyle> = {
  SSA: {
    photoSrc: imgSsy,
    gradient: 'from-rose-950/95 via-red-900/75 to-transparent',
    accentHex: '#FBBF24',
    motifBgHex: '#881337',
    sealLabel: 'Girl Child Wealth · 8.2% p.a.',
  },
  SCSS: {
    photoSrc: imgScss,
    gradient: 'from-amber-950/95 via-orange-950/70 to-transparent',
    accentHex: '#FCD34D',
    motifBgHex: '#78350F',
    sealLabel: 'Quarterly Pension · 8.2% p.a.',
  },
  PPF: {
    photoSrc: imgPpfWealth,
    gradient: 'from-slate-950/95 via-slate-900/75 to-transparent',
    accentHex: '#FBBF24',
    motifBgHex: '#1E293B',
    sealLabel: 'EEE Sovereign Bond · 7.1% p.a.',
  },
  PLI_SURAKSHA: {
    photoSrc: imgPli,
    gradient: 'from-indigo-950/95 via-slate-900/70 to-transparent',
    accentHex: '#93C5FD',
    motifBgHex: '#1E1B4B',
    sealLabel: 'Est. 1884 · ₹76 Bonus / 1K',
  },
  IPPB_BANKING: {
    photoSrc: imgIppbBanking,
    gradient: 'from-emerald-950/95 via-teal-900/70 to-transparent',
    accentHex: '#6EE7B7',
    motifBgHex: '#064E3B',
    sealLabel: 'Zero Balance · Instant e-KYC',
  },
  IPPB_DOORSTEP: {
    photoSrc: imgJeevanPramaan,
    gradient: 'from-teal-950/95 via-cyan-950/75 to-transparent',
    accentHex: '#5EEAD4',
    motifBgHex: '#134E4A',
    sealLabel: 'Biometric Micro-ATM & DLC',
  },
  MY_STAMP: {
    photoSrc: imgMyStamp,
    gradient: 'from-purple-950/95 via-fuchsia-950/75 to-transparent',
    accentHex: '#F5D0FE',
    motifBgHex: '#4A044E',
    sealLabel: 'Philately Heritage · ₹300 Sheet',
  },
  GANGAJAL: {
    photoSrc: imgGangajal,
    gradient: 'from-amber-950/95 via-stone-900/70 to-transparent',
    accentHex: '#FDE68A',
    motifBgHex: '#451A03',
    sealLabel: 'Gangotri Source · ₹30 Bottle',
  },
  DNK_PARCEL: {
    photoSrc: imgDnkParcel,
    gradient: 'from-red-950/95 via-stone-900/75 to-transparent',
    accentHex: '#FDBA74',
    motifBgHex: '#431407',
    sealLabel: '190+ Countries · Speed Post COD',
  },
  MIS: {
    gradient: 'from-rose-950 via-red-900 to-amber-950',
    accentHex: '#FBBF24',
    motifBgHex: '#7F1D1D',
    sealLabel: 'Monthly Income · 7.4% p.a.',
    renderUniqueMotif: () => (
      <svg viewBox="0 0 320 180" className="w-full h-full opacity-35" aria-hidden="true">
        <defs>
          <pattern id="mis-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1.2" fill="#FDE68A" />
          </pattern>
        </defs>
        <rect width="320" height="180" fill="url(#mis-grid)" />
        {/* Stylized monthly calendar coin bars ascending */}
        <rect x="36" y="102" width="22" height="44" rx="4" fill="#FBBF24" fillOpacity="0.45" />
        <rect x="68" y="88" width="22" height="58" rx="4" fill="#FBBF24" fillOpacity="0.55" />
        <rect x="100" y="74" width="22" height="72" rx="4" fill="#FBBF24" fillOpacity="0.65" />
        <rect x="132" y="60" width="22" height="86" rx="4" fill="#FDE68A" fillOpacity="0.8" />
        <circle cx="242" cy="82" r="46" stroke="#FCD34D" strokeWidth="2.5" strokeDasharray="6 4" fill="none" />
        <circle cx="242" cy="82" r="28" stroke="#FBBF24" strokeWidth="1.5" fill="#FBBF24" fillOpacity="0.12" />
      </svg>
    ),
  },
  RD: {
    gradient: 'from-amber-950 via-orange-900 to-slate-950',
    accentHex: '#FDBA74',
    motifBgHex: '#7C2D12',
    sealLabel: '5-Yr Systematic · 6.7% p.a.',
    renderUniqueMotif: () => (
      <svg viewBox="0 0 320 180" className="w-full h-full opacity-35" aria-hidden="true">
        {/* Concentric compounding orbit arcs */}
        <path d="M 20 150 Q 120 130 190 70 T 300 28" stroke="#FDBA74" strokeWidth="3" fill="none" />
        <path d="M 20 165 Q 130 148 205 94 T 305 58" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
        <circle cx="95" cy="126" r="6" fill="#FDBA74" />
        <circle cx="155" cy="95" r="7" fill="#FBBF24" />
        <circle cx="220" cy="60" r="8" fill="#FDE68A" />
        <circle cx="278" cy="36" r="10" fill="#FEF3C7" />
      </svg>
    ),
  },
  TD: {
    gradient: 'from-slate-950 via-zinc-900 to-amber-950',
    accentHex: '#FDE047',
    motifBgHex: '#27272A',
    sealLabel: '1–5 Yr Fixed Term · Up to 7.5%',
    renderUniqueMotif: () => (
      <svg viewBox="0 0 320 180" className="w-full h-full opacity-30" aria-hidden="true">
        {/* Vault dial geometric lock rings */}
        <circle cx="240" cy="90" r="64" stroke="#FDE047" strokeWidth="2" fill="none" />
        <circle cx="240" cy="90" r="46" stroke="#FACC15" strokeWidth="1.5" strokeDasharray="10 5" fill="none" />
        <rect x="30" y="42" width="110" height="96" rx="12" stroke="#FDE047" strokeWidth="1.5" fill="none" />
        <line x1="48" y1="68" x2="122" y2="68" stroke="#FDE047" strokeWidth="2" />
        <line x1="48" y1="90" x2="105" y2="90" stroke="#FACC15" strokeWidth="2" />
        <line x1="48" y1="112" x2="115" y2="112" stroke="#FDE047" strokeWidth="2" />
      </svg>
    ),
  },
  NSC: {
    gradient: 'from-emerald-950 via-slate-900 to-teal-950',
    accentHex: '#34D399',
    motifBgHex: '#064E3B',
    sealLabel: '5-Yr Sovereign Certificate · 7.7%',
    renderUniqueMotif: () => (
      <svg viewBox="0 0 320 180" className="w-full h-full opacity-35" aria-hidden="true">
        {/* Guilloche certificate rosette */}
        <polygon
          points="240,26 258,64 300,70 270,98 278,140 240,120 202,140 210,98 180,70 222,64"
          stroke="#34D399"
          strokeWidth="2"
          fill="#10B981"
          fillOpacity="0.16"
        />
        <rect x="28" y="34" width="134" height="112" rx="8" stroke="#6EE7B7" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
        <path d="M44 114 L78 88 L108 102 L144 62" stroke="#6EE7B7" strokeWidth="3" fill="none" />
      </svg>
    ),
  },
  KVP: {
    gradient: 'from-lime-950 via-emerald-950 to-slate-950',
    accentHex: '#A3E635',
    motifBgHex: '#1A2E05',
    sealLabel: 'Doubles Principal · 115 Months',
    renderUniqueMotif: () => (
      <svg viewBox="0 0 320 180" className="w-full h-full opacity-35" aria-hidden="true">
        {/* Twin 2X diamond multiplication prism */}
        <polygon points="90,34 142,90 90,146 38,90" stroke="#A3E635" strokeWidth="2" fill="#84CC16" fillOpacity="0.15" />
        <polygon points="154,34 206,90 154,146 102,90" stroke="#BEF264" strokeWidth="2" fill="#A3E635" fillOpacity="0.22" />
        <line x1="224" y1="138" x2="292" y2="42" stroke="#D9F99D" strokeWidth="3" />
        <polyline points="262,42 292,42 292,72" stroke="#D9F99D" strokeWidth="3" fill="none" />
      </svg>
    ),
  },
  PLI_SANTOSH: {
    gradient: 'from-blue-950 via-indigo-950 to-slate-950',
    accentHex: '#60A5FA',
    motifBgHex: '#172554',
    sealLabel: 'Endowment Bonus · ₹52 / 1K',
    renderUniqueMotif: () => (
      <svg viewBox="0 0 320 180" className="w-full h-full opacity-35" aria-hidden="true">
        {/* Protective dome shield wireframe */}
        <path d="M235 28 L292 50 V98 C292 132 264 152 235 162 C206 152 178 132 178 98 V50 Z" stroke="#60A5FA" strokeWidth="2.5" fill="#3B82F6" fillOpacity="0.16" />
        <path d="M235 46 L274 62 V96 C274 120 255 135 235 143 C215 135 196 120 196 96 V62 Z" stroke="#93C5FD" strokeWidth="1.5" fill="none" />
        <circle cx="76" cy="90" r="44" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
      </svg>
    ),
  },
  RPLI_GRAM_SANTOSH: {
    gradient: 'from-cyan-950 via-teal-950 to-slate-950',
    accentHex: '#22D3EE',
    motifBgHex: '#083344',
    sealLabel: 'Rural & Semi-Urban · ₹65 Bonus',
    renderUniqueMotif: () => (
      <svg viewBox="0 0 320 180" className="w-full h-full opacity-35" aria-hidden="true">
        {/* Rising sun rays over horizon arcs */}
        <circle cx="245" cy="128" r="36" fill="#22D3EE" fillOpacity="0.25" stroke="#67E8F9" strokeWidth="2" />
        <path d="M20 132 Q 120 100 220 132 T 310 128" stroke="#67E8F9" strokeWidth="2" fill="none" />
        <line x1="245" y1="30" x2="245" y2="74" stroke="#A5F3FC" strokeWidth="2" />
        <line x1="186" y1="62" x2="212" y2="88" stroke="#A5F3FC" strokeWidth="2" />
        <line x1="304" y1="62" x2="278" y2="88" stroke="#A5F3FC" strokeWidth="2" />
      </svg>
    ),
  },
  CELC_AADHAAR: {
    gradient: 'from-sky-950 via-blue-950 to-indigo-950',
    accentHex: '#38BDF8',
    motifBgHex: '#0C4A6E',
    sealLabel: 'Free Child Aadhaar (0–5 Yrs)',
    renderUniqueMotif: () => (
      <svg viewBox="0 0 320 180" className="w-full h-full opacity-35" aria-hidden="true">
        {/* Biometric fingerprint arcs */}
        <ellipse cx="242" cy="92" rx="44" ry="58" stroke="#38BDF8" strokeWidth="2" strokeDasharray="16 6" fill="none" />
        <ellipse cx="242" cy="92" rx="30" ry="42" stroke="#7DD3FC" strokeWidth="2" strokeDasharray="12 5" fill="none" />
        <ellipse cx="242" cy="92" rx="16" ry="24" stroke="#BAE6FD" strokeWidth="2" fill="none" />
        <rect x="28" y="46" width="118" height="80" rx="10" stroke="#7DD3FC" strokeWidth="1.5" fill="none" />
        <circle cx="56" cy="76" r="12" stroke="#BAE6FD" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  IPPB_GPA: {
    gradient: 'from-fuchsia-950 via-rose-950 to-slate-950',
    accentHex: '#F472B6',
    motifBgHex: '#500724',
    sealLabel: '₹10L Accident Cover · ₹399/Yr',
    renderUniqueMotif: () => (
      <svg viewBox="0 0 320 180" className="w-full h-full opacity-35" aria-hidden="true">
        {/* Medical heartbeat pulse + cross emblem */}
        <polyline points="20,104 86,104 106,62 126,136 146,84 164,104 300,104" stroke="#F472B6" strokeWidth="3" fill="none" />
        <rect x="234" y="40" width="16" height="54" rx="3" fill="#F9A8D4" fillOpacity="0.45" />
        <rect x="215" y="59" width="54" height="16" rx="3" fill="#F9A8D4" fillOpacity="0.45" />
      </svg>
    ),
  },
  IPPB_LOANS: {
    gradient: 'from-violet-950 via-purple-950 to-slate-950',
    accentHex: '#C084FC',
    motifBgHex: '#3B0764',
    sealLabel: 'Gold & Business Credit · 8.85%+',
    renderUniqueMotif: () => (
      <svg viewBox="0 0 320 180" className="w-full h-full opacity-35" aria-hidden="true">
        {/* Architectural pillar / credit bridge columns */}
        <rect x="192" y="52" width="18" height="92" rx="3" stroke="#C084FC" strokeWidth="2" fill="#A855F7" fillOpacity="0.2" />
        <rect x="226" y="52" width="18" height="92" rx="3" stroke="#C084FC" strokeWidth="2" fill="#A855F7" fillOpacity="0.2" />
        <rect x="260" y="52" width="18" height="92" rx="3" stroke="#C084FC" strokeWidth="2" fill="#A855F7" fillOpacity="0.2" />
        <polygon points="178,48 235,20 292,48" stroke="#E9D5FF" strokeWidth="2" fill="#C084FC" fillOpacity="0.25" />
        <line x1="176" y1="148" x2="294" y2="148" stroke="#E9D5FF" strokeWidth="3" />
      </svg>
    ),
  },
};

export default function SchemePosterArtwork({
  code,
  name,
  rateHighlight,
  categoryLabel,
}: SchemePosterArtworkProps) {
  const cfg = SCHEME_VISUAL_CONFIG[code] || {
    gradient: 'from-red-950 via-slate-900 to-slate-950',
    accentHex: '#FBBF24',
    motifBgHex: '#450A0A',
    sealLabel: 'Govt of India Sovereign Guarantee',
    renderUniqueMotif: () => (
      <svg viewBox="0 0 320 180" className="w-full h-full opacity-30" aria-hidden="true">
        <circle cx="245" cy="90" r="52" stroke="#FBBF24" strokeWidth="2" fill="none" />
        <circle cx="245" cy="90" r="32" stroke="#FDE68A" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
      </svg>
    ),
  };

  return (
    <div
      className="relative h-48 overflow-hidden bg-slate-950 border-b border-slate-200 select-none"
      style={{ backgroundColor: cfg.motifBgHex }}
    >
      {/* Unique Background: Photographic Editorial OR Distinct Bespoke SVG Vector Poster */}
      {cfg.photoSrc ? (
        <>
          <img
            src={cfg.photoSrc}
            alt={name}
            className="w-full h-full object-cover object-center opacity-75 group-hover:scale-105 transition-transform duration-500"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${cfg.gradient}`} />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/45 to-transparent" />
        </>
      ) : (
        <>
          <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient}`} />
          <div className="absolute inset-0">{cfg.renderUniqueMotif?.()}</div>
          <div
            className="absolute -right-4 top-2 font-black text-7xl tracking-tighter opacity-10 pointer-events-none select-none font-mono"
            style={{ color: cfg.accentHex }}
          >
            {code.split('_')[0]}
          </div>
        </>
      )}

      {/* Clean Poster Typography Overlay (Zero Badge Spam) */}
      <div className="relative z-10 h-full p-5 flex flex-col justify-between text-white">
        <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
          <span style={{ color: cfg.accentHex }} className="tracking-wide uppercase">
            {categoryLabel} · {code}
          </span>
          <span className="font-mono text-white/85">Sovereign Guaranteed</span>
        </div>

        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug drop-shadow-xs line-clamp-2">
            {name}
          </h3>
          <div className="pt-2 border-t border-white/15 flex items-baseline justify-between gap-3">
            <span className="text-sm sm:text-base font-black tabular-nums" style={{ color: cfg.accentHex }}>
              {rateHighlight}
            </span>
            <span className="text-[11px] text-white/80 font-medium shrink-0">{cfg.sealLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
