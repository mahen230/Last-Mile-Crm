import React, { useState } from 'react';
import {
  Building2,
  Landmark,
  Layers,
  Package,
  ShieldCheck,
  Store,
  Truck,
  Zap,
} from 'lucide-react';

export interface PredefinedBrandTheme {
  id: string;
  name: string;
  accentColor: string;
  surfaceTint: string;
  borderTint: string;
  contrastText: string;
}

export const PREDEFINED_BRAND_THEMES: PredefinedBrandTheme[] = [
  {
    id: 'postal-crimson',
    name: 'Crimson Pillar',
    accentColor: '#991B1B',
    surfaceTint: '#FEF2F2',
    borderTint: '#FECACA',
    contrastText: '#7F1D1D',
  },
  {
    id: 'logistics-slate',
    name: 'Command Slate',
    accentColor: '#0F172A',
    surfaceTint: '#F8FAFC',
    borderTint: '#CBD5E1',
    contrastText: '#0F172A',
  },
  {
    id: 'ev-emerald',
    name: 'EV Emerald',
    accentColor: '#065F46',
    surfaceTint: '#ECFDF5',
    borderTint: '#A7F3D0',
    contrastText: '#064E3B',
  },
  {
    id: 'royal-cobalt',
    name: 'Royal Cobalt',
    accentColor: '#1D4ED8',
    surfaceTint: '#EFF6FF',
    borderTint: '#BFDBFE',
    contrastText: '#1E3A8A',
  },
  {
    id: 'saffron-amber',
    name: 'Saffron Gold',
    accentColor: '#B45309',
    surfaceTint: '#FFFBEB',
    borderTint: '#FDE68A',
    contrastText: '#78350F',
  },
  {
    id: 'indigo-hub',
    name: 'Indigo Hub',
    accentColor: '#4338CA',
    surfaceTint: '#EEF2FF',
    borderTint: '#C7D2FE',
    contrastText: '#312E81',
  },
  {
    id: 'teal-horizon',
    name: 'Teal Horizon',
    accentColor: '#0F766E',
    surfaceTint: '#F0FDFA',
    borderTint: '#99F6E4',
    contrastText: '#134E4A',
  },
  {
    id: 'plum-retail',
    name: 'Plum Commerce',
    accentColor: '#7E22CE',
    surfaceTint: '#FAF5FF',
    borderTint: '#E9D5FF',
    contrastText: '#581C87',
  },
];

export interface PredefinedLogoPreset {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const PREDEFINED_LOGO_PRESETS: PredefinedLogoPreset[] = [
  {
    id: 'MONOGRAM',
    label: 'Letter Monogram',
    description: 'Clean initials badge',
    icon: Layers,
  },
  {
    id: 'POSTAL_PILLAR',
    label: 'Anchor Pillar',
    description: 'Institutional trust emblem',
    icon: Landmark,
  },
  {
    id: 'LOGISTICS_HUB',
    label: 'Logistics Fleet',
    description: 'Hub & dispatch mark',
    icon: Truck,
  },
  {
    id: 'EV_MOBILITY',
    label: 'EV Volt',
    description: 'Electric mobility emblem',
    icon: Zap,
  },
  {
    id: 'STORE_FRONT',
    label: 'Storefront',
    description: 'Retail & partner outlet',
    icon: Store,
  },
  {
    id: 'PARCEL_BOX',
    label: 'Fulfillment Parcel',
    description: 'Pickup & delivery mark',
    icon: Package,
  },
  {
    id: 'ENTERPRISE_OFFICE',
    label: 'Branch Hub',
    description: 'Multi-branch building',
    icon: Building2,
  },
  {
    id: 'VERIFIED_SHIELD',
    label: 'Verified Shield',
    description: 'Certified partner mark',
    icon: ShieldCheck,
  },
];

export function resolveBrandTheme(accentColor?: string): PredefinedBrandTheme {
  const normalized = (accentColor || '').trim().toUpperCase();
  const matched = PREDEFINED_BRAND_THEMES.find(
    (t) => t.accentColor.toUpperCase() === normalized
  );
  if (matched) return matched;
  return {
    id: 'custom',
    name: 'Custom Brand Color',
    accentColor: accentColor || '#0F172A',
    surfaceTint: '#F8FAFC',
    borderTint: '#CBD5E1',
    contrastText: accentColor || '#0F172A',
  };
}

export function PartnerBrandLogo({
  displayName,
  monogram,
  accentColor,
  logoUrl,
  logoPresetId,
  size = 'md',
}: {
  displayName: string;
  monogram: string;
  accentColor?: string;
  logoUrl?: string;
  logoPresetId?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [imgFailed, setImgFailed] = useState(false);

  const boxSize =
    size === 'lg'
      ? 'w-12 h-12 rounded-xl text-base'
      : size === 'sm'
      ? 'w-8 h-8 rounded-lg text-[11px]'
      : 'w-10 h-10 rounded-xl text-xs';

  const iconSize = size === 'lg' ? 22 : size === 'sm' ? 15 : 18;
  const bg = accentColor || '#0F172A';

  if (logoUrl && !imgFailed) {
    return (
      <img
        src={logoUrl}
        alt={displayName}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className={`${boxSize} object-cover border border-slate-200 bg-white shrink-0`}
      />
    );
  }

  const preset = PREDEFINED_LOGO_PRESETS.find((p) => p.id === logoPresetId);
  if (preset && preset.id !== 'MONOGRAM') {
    const IconComp = preset.icon;
    return (
      <div
        className={`${boxSize} text-white flex items-center justify-center shrink-0`}
        style={{ backgroundColor: bg }}
        aria-label={`${displayName} logo`}
      >
        <IconComp size={iconSize} />
      </div>
    );
  }

  return (
    <div
      className={`${boxSize} text-white font-bold flex items-center justify-center shrink-0`}
      style={{ backgroundColor: bg }}
      aria-label={`${displayName} monogram`}
    >
      {monogram}
    </div>
  );
}
