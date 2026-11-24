import React from 'react';
import { Check } from 'lucide-react';
import {
  PREDEFINED_BRAND_THEMES,
  PREDEFINED_LOGO_PRESETS,
  PartnerBrandLogo,
  resolveBrandTheme,
} from '../common/PartnerBrandLogo';

interface PartnerThemeLogoPickerProps {
  displayName: string;
  monogram: string;
  accentColor: string;
  logoPresetId: string;
  logoUrl: string;
  onChange: (patch: {
    monogram?: string;
    accentColor?: string;
    themePresetName?: string;
    logoPresetId?: string;
    logoUrl?: string;
  }) => void;
}

export default function PartnerThemeLogoPicker({
  displayName,
  monogram,
  accentColor,
  logoPresetId,
  logoUrl,
  onChange,
}: PartnerThemeLogoPickerProps) {
  const activeTheme = resolveBrandTheme(accentColor);

  return (
    <div className="space-y-4 text-xs">
      {/* Live Portal Header Preview */}
      <div
        className="p-3.5 rounded-xl border flex items-center justify-between gap-3"
        style={{
          backgroundColor: activeTheme.surfaceTint,
          borderColor: activeTheme.borderTint,
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <PartnerBrandLogo
            displayName={displayName || 'Partner Portal'}
            monogram={monogram || 'PR'}
            accentColor={accentColor}
            logoPresetId={logoPresetId}
            logoUrl={logoUrl || undefined}
            size="md"
          />
          <div className="min-w-0">
            <div className="font-bold text-slate-900 truncate">
              {displayName || 'Partner Portal Preview'}
            </div>
            <div className="text-[11px] text-slate-600">
              {activeTheme.name} · Dynamic Login &amp; Workspace Theme
            </div>
          </div>
        </div>
        <span
          className="px-3 py-1.5 rounded-lg text-white font-semibold text-[11px] shrink-0"
          style={{ backgroundColor: accentColor }}
        >
          Sample CTA
        </span>
      </div>

      {/* 1. Predefined Brand Color Swatches */}
      <div className="space-y-2">
        <div className="font-semibold text-slate-700">
          Predefined Brand Color Themes
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PREDEFINED_BRAND_THEMES.map((theme) => {
            const selected =
              theme.accentColor.toUpperCase() === (accentColor || '').toUpperCase();
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() =>
                  onChange({
                    accentColor: theme.accentColor,
                    themePresetName: theme.name,
                  })
                }
                className={`p-2 rounded-lg border text-left flex items-center gap-2 transition cursor-pointer ${
                  selected
                    ? 'border-slate-900 bg-slate-100 font-semibold text-slate-900'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: theme.accentColor }}
                >
                  {selected && <Check size={12} />}
                </span>
                <span className="truncate text-[11px]">{theme.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. File-Upload-Free System Logo Emblem Selector */}
      <div className="space-y-2">
        <div className="font-semibold text-slate-700">
          System Logo Emblem (No File Upload Required)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PREDEFINED_LOGO_PRESETS.map((preset) => {
            const IconComp = preset.icon;
            const selected = (logoPresetId || 'MONOGRAM') === preset.id && !logoUrl;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange({ logoPresetId: preset.id, logoUrl: '' })}
                className={`p-2 rounded-lg border text-left flex items-center gap-2 transition cursor-pointer ${
                  selected
                    ? 'border-slate-900 bg-slate-100 text-slate-900 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span
                  className="w-6 h-6 rounded-md text-white flex items-center justify-center shrink-0"
                  style={{ backgroundColor: accentColor }}
                >
                  <IconComp size={13} />
                </span>
                <span className="truncate text-[11px]">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Custom Monogram & File-Upload-Free Image URL / Data URI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Monogram (2–3 Chars)
          </label>
          <input
            type="text"
            maxLength={3}
            value={monogram}
            onChange={(e) => onChange({ monogram: e.target.value.toUpperCase() })}
            placeholder="IP"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono uppercase"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block font-semibold text-slate-700 mb-1">
            Logo Image URL or Data URI (Optional, Upload-Free)
          </label>
          <input
            type="text"
            value={logoUrl}
            onChange={(e) => onChange({ logoUrl: e.target.value })}
            placeholder="https://... or data:image/svg+xml;..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
          />
        </div>
      </div>
    </div>
  );
}
