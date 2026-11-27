import React from 'react';

export interface IndiaPostLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  subtitle?: string;
  variant?: 'light' | 'dark';
  className?: string;
}

const EMBLEM_SIZES: Record<NonNullable<IndiaPostLogoProps['size']>, { box: string; w: number; h: number; title: string; sub: string }> = {
  xs: { box: 'w-7 h-7', w: 28, h: 28, title: 'text-xs', sub: 'text-[10px]' },
  sm: { box: 'w-9 h-9', w: 36, h: 36, title: 'text-sm', sub: 'text-[11px]' },
  md: { box: 'w-11 h-11', w: 44, h: 44, title: 'text-base', sub: 'text-xs' },
  lg: { box: 'w-14 h-14', w: 56, h: 56, title: 'text-lg', sub: 'text-xs' },
};

/**
 * Official India Post Emblem SVG
 * Features the signature Postal Red & Gold winged-envelope motif.
 */
export function IndiaPostEmblem({
  width = 36,
  height = 36,
  className = '',
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="India Post Official Emblem"
      className={className}
    >
      <title>India Post Official Emblem</title>
      {/* Official Postal Red Emblem Badge */}
      <rect x="2" y="6" width="60" height="52" rx="10" fill="#B91C1C" />
      <rect x="4" y="8" width="56" height="48" rx="8" stroke="#FACC15" strokeWidth="1.5" strokeOpacity="0.4" />

      {/* Upper Gold Speed Wings (Three Classic India Post Bars) */}
      <path d="M12 19H52L46 24H12V19Z" fill="#FACC15" />
      <path d="M12 26.5H43L37.5 31.5H12V26.5Z" fill="#FACC15" />
      <path d="M12 34H34.5L29.5 39H12V34Z" fill="#FDE047" />

      {/* Crisp Stylized Postal Envelope Fold / Chevron Accent */}
      <path
        d="M35 31L52 24V45C52 46.6569 50.6569 48 49 48H15C13.3431 48 12 46.6569 12 45V42H33.5L47.5 31.5L35 31Z"
        fill="#FFFFFF"
        fillOpacity="0.96"
      />
      {/* Red Wing Cutout Inside Envelope Base */}
      <path d="M15 44.5H48L44.5 41.5H18.5L15 44.5Z" fill="#DC2626" />
    </svg>
  );
}

export default function IndiaPostLogo({
  size = 'sm',
  showWordmark = true,
  subtitle,
  variant = 'light',
  className = '',
}: IndiaPostLogoProps) {
  const cfg = EMBLEM_SIZES[size];
  const isDarkBg = variant === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 min-w-0 select-none ${className}`}>
      <span className={`${cfg.box} shrink-0 inline-flex items-center justify-center rounded-lg overflow-hidden shadow-xs`}>
        <IndiaPostEmblem width={cfg.w} height={cfg.h} className="w-full h-full" />
      </span>

      {showWordmark && (
        <div className="min-w-0 leading-tight">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span
              className={`${cfg.title} font-black tracking-tight ${
                isDarkBg ? 'text-white' : 'text-slate-900'
              }`}
            >
              India Post
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                isDarkBg
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              Dak Sewa
            </span>
          </div>
          {subtitle && (
            <div
              className={`${cfg.sub} font-medium truncate ${
                isDarkBg ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
