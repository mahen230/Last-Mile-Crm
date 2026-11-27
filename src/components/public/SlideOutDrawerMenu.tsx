import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Package,
  BookOpen,
  Award,
  HeartPulse,
  Sprout,
  Wallet,
  ShieldCheck,
  Landmark,
  Truck,
  FileText,
  UserCheck,
  Crown,
  ChevronDown,
  MapPin,
  Globe,
  MessageCircle,
  ArrowRight,
  Clock,
  Building2,
  Store,
} from 'lucide-react';
import { SupportedLanguage, LANGUAGE_OPTIONS } from '../../utils/localization';
import { getPincodeHub } from '../../services/pincodeOperationsService';
import { OFFICIAL_BRAND_STORES } from '../../services/brandDirectoryService';

interface SlideOutDrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  lang: SupportedLanguage;
  onSelectLang: (lang: SupportedLanguage) => void;
  activePincode: string;
  onOpenPincodeModal: () => void;
  onOpenCitizenModal: (serviceId?: string) => void;
  onOpenTrackModal: () => void;
  onOpenStaffLogin: () => void;
  onSelectCategoryFilter?: (filterKey: string) => void;
}

interface SubCategoryItem {
  id: string;
  name: string;
  nameHi?: string;
  badge?: string;
  filterKey?: string;
  anchorId?: string;
}

interface CategoryMenuGroup {
  id: string;
  title: string;
  titleHi: string;
  subtitle: string;
  subtitleHi: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: string;
  badgeText: string;
  anchorId: string;
  filterKey?: string;
  subItems: SubCategoryItem[];
}

interface FinancialMenuGroup {
  id: string;
  title: string;
  titleHi: string;
  rateHighlight: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  anchorId: string;
  subTab?: string;
  subItems: { title: string; highlight: string }[];
}

interface LocalStoreHub {
  name: string;
  category: string;
  beatManager: string;
  beatNo: string;
  phone: string;
  address: string;
  timings: string;
  isOfficial?: boolean;
}

export default function SlideOutDrawerMenu({
  isOpen,
  onClose,
  lang,
  onSelectLang,
  activePincode,
  onOpenPincodeModal,
  onOpenCitizenModal,
  onOpenTrackModal,
  onOpenStaffLogin,
  onSelectCategoryFilter,
}: SlideOutDrawerMenuProps) {
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>('bulk_study');
  const activeHub = getPincodeHub(activePincode);

  if (!isOpen) return null;

  const toggleAccordion = (groupId: string) => {
    setExpandedGroupId((prev) => (prev === groupId ? null : groupId));
  };

  const handleNavClick = (anchorId: string, filterKey?: string) => {
    onClose();
    if (filterKey && onSelectCategoryFilter) {
      onSelectCategoryFilter(filterKey);
    }
    setTimeout(() => {
      const el = document.getElementById(anchorId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  };

  // 1. India Post Bulk Customer Showcase Categories
  const bulkShowcaseCategories: CategoryMenuGroup[] = [
    {
      id: 'bulk_study',
      title: 'Books & Academic Study Material',
      titleHi: 'पुस्तकें एवं अध्ययन सामग्री',
      subtitle: 'Vigyan Nagar S.O. Bulk Parcel & Coaching Module Dispatch',
      subtitleHi: 'विज्ञान नगर डाकघर से देशभर में अध्ययन सामग्री डिस्पैच',
      icon: BookOpen,
      accentColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      badgeText: 'BNPL Tariff',
      anchorId: 'bulk-customer-showcase',
      filterKey: 'Books & Study Material',
      subItems: [
        { id: 'study_5kg', name: 'Competitive Exam Printed Module Bundle (5 kg)', nameHi: 'प्रतियोगी परीक्षा अध्ययन बंडल (5 किग्रा)', badge: 'PIN 324005' },
        { id: 'book_post', name: 'Registered Printed Book Parcel Dispatch', nameHi: 'पंजीकृत पुस्तक पार्सल सेवा' },
      ],
    },
    {
      id: 'bulk_handloom',
      title: 'Handloom & GI Kota Doria',
      titleHi: 'हथकरघा एवं कोटा डोरिया',
      subtitle: 'Kaithoon S.O. Loom Cooperative & Insured COD Shipping',
      subtitleHi: 'कैथून डाकघर से जीआई कोटा डोरिया व हस्तशिल्प पार्सल',
      icon: Award,
      accentColor: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
      badgeText: 'GI Verified',
      anchorId: 'bulk-customer-showcase',
      filterKey: 'Handloom & Textiles',
      subItems: [
        { id: 'doria_box', name: 'GI-Tagged Kota Doria Handloom Gift Box', nameHi: 'जीआई टैग कोटा डोरिया गिफ्ट बॉक्स', badge: 'COD Ready' },
        { id: 'weavers_bulk', name: 'Weavers Cooperative Wholesale Parcel Slab', nameHi: 'बुनकर सहकारी थोक पार्सल दर' },
      ],
    },
    {
      id: 'bulk_medical',
      title: 'Medical & Diagnostics Kits',
      titleHi: 'मेडिकल एवं डायग्नोस्टिक पैक',
      subtitle: 'Dadabari S.O. Sealed Clinic & Wellness Parcel Dispatch',
      subtitleHi: 'दादाबाड़ी डाकघर से सुरक्षित मेडिकल व क्लिनिक किट डिस्पैच',
      icon: HeartPulse,
      accentColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      badgeText: 'Beat 2 Fast',
      anchorId: 'bulk-customer-showcase',
      filterKey: 'Medical & Diagnostics',
      subItems: [
        { id: 'med_kit', name: 'Clinic First-Aid & Digital BP Monitor Pack', nameHi: 'क्लिनिक फर्स्ट-एड एवं बीपी मॉनिटर पैक', badge: 'PIN 324009' },
        { id: 'diag_seal', name: 'Moisture-Sealed Pharmacy Carton Booking', nameHi: 'फार्मेसी कार्टन प्राथमिकता डिस्पैच' },
      ],
    },
    {
      id: 'bulk_agro',
      title: 'Hadoti Agro & Regional FPOs',
      titleHi: 'हाड़ौती कृषि एवं क्षेत्रीय उत्पाद',
      subtitle: 'Baran H.O. Spice Collective & Cold-Pressed Oil Cartons',
      subtitleHi: 'बारां मुख्य डाकघर से मसाले व एफपीओ पार्सल',
      icon: Sprout,
      accentColor: 'text-lime-400 bg-lime-400/10 border-lime-400/20',
      badgeText: 'FPO Direct',
      anchorId: 'bulk-customer-showcase',
      filterKey: 'Agro & Regional Goods',
      subItems: [
        { id: 'hadoti_5kg', name: 'Hadoti Whole Spices & Mustard Oil 5kg Box', nameHi: 'हाड़ौती साबुत मसाले व सरसों तेल बॉक्स', badge: 'PIN 325205' },
      ],
    },
    {
      id: 'bulk_packaging',
      title: 'Packaging, Philately & My Stamp',
      titleHi: 'पैकेजिंग, डाक टिकट एवं माय स्टैंप',
      subtitle: 'Indraprastha RIICO Mailers, Kota H.O. My Stamp & Gangajal',
      subtitleHi: 'इंद्रप्रस्थ मेलर्स, कोटा एच.ओ. माय स्टैंप एवं गंगाजल',
      icon: Package,
      accentColor: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
      badgeText: 'Official Issue',
      anchorId: 'bulk-customer-showcase',
      filterKey: 'Industrial & Packaging',
      subItems: [
        { id: 'tamper_mailers', name: 'Tamper-Proof Courier Pouches (250 Pack)', nameHi: 'टैम्पर-प्रूफ कूरियर पाउच (250 पैक)' },
        { id: 'mystamp_sheet', name: 'Personalized My Stamp Sheet (12 Stamps)', nameHi: 'व्यक्तिगत माय स्टैंप शीट (12 डाक टिकट)', badge: '₹300' },
        { id: 'gangajal_pack', name: 'Gangotri Sacred Gangajal Pack (250 ml)', nameHi: 'गंगोत्री पवित्र गंगाजल पैक (250 मिली)', badge: '₹30' },
      ],
    },
  ];

  // 2. Sovereign Postal & Financial Services
  const sovereignFinancialServices: FinancialMenuGroup[] = [
    {
      id: 'sovereign_savings',
      title: 'Sovereign Savings (SSY / SCSS / PPF)',
      titleHi: 'सरकारी बचत योजनाएं (सुकन्या / वरिष्ठ नागरिक)',
      rateHighlight: '8.2% p.a. Tax-Free',
      desc: 'Sukanya Samriddhi (SSY), Senior Citizen Savings (SCSS), PPF & Monthly Income Scheme (MIS)',
      icon: Wallet,
      anchorId: 'post-office-banking-store',
      subTab: 'SAVINGS_SSY_SCSS',
      subItems: [
        { title: 'Sukanya Samriddhi Yojana (SSY)', highlight: '8.2% · EEE Tax-Free' },
        { title: 'Senior Citizen Savings (SCSS)', highlight: '8.2% · Quarterly Pension' },
        { title: 'Public Provident Fund (PPF)', highlight: '7.1% · Sovereign Wealth' },
        { title: 'Monthly Income Scheme (MIS)', highlight: '7.4% · Monthly Payout' },
      ],
    },
    {
      id: 'postal_insurance',
      title: 'Postal Insurance (PLI / RPLI)',
      titleHi: 'डाक जीवन बीमा (पीएलआई / आरपीएलआई)',
      rateHighlight: 'Peak Sovereign Bonus',
      desc: 'PLI Suraksha Whole Life, Santosh Endowment & RPLI Gram Santosh with Government backing',
      icon: ShieldCheck,
      anchorId: 'post-office-banking-store',
      subTab: 'INSURANCE_PLI',
      subItems: [
        { title: 'PLI Suraksha (Whole Life)', highlight: 'Up to ₹50 Lakh Cover' },
        { title: 'PLI Santosh (Endowment)', highlight: 'Sec 80C Tax Rebate' },
        { title: 'RPLI Gram Santosh', highlight: 'Rural & Semi-Urban Family' },
      ],
    },
    {
      id: 'ippb_digital',
      title: 'IPPB Digital Accounts & Accident Cover',
      titleHi: 'आईपीपीबी डिजिटल खाते एवं दुर्घटना बीमा',
      rateHighlight: '₹10L Cover @ ₹399/Yr',
      desc: 'Zero-Balance Digital Accounts, ₹10L Accidental Cover, AePS Doorstep Cash & Merchant QR',
      icon: Landmark,
      anchorId: 'post-office-banking-store',
      subTab: 'IPPB_QR_COVER',
      subItems: [
        { title: 'IPPB Zero-Balance Account', highlight: 'Instant RuPay & AePS' },
        { title: '₹10 Lakh Accidental Insurance', highlight: '₹399/Yr Premium' },
        { title: 'Doorstep AePS Biometric Cash', highlight: 'Up to ₹10,000 Delivery' },
        { title: 'Merchant QR Standee & BNPL Sync', highlight: 'Zero MDR Settlement' },
      ],
    },
  ];

  // 3. Logistics & Citizen Documentation
  const logisticsAndCitizenServices = [
    {
      id: 'logistics_speed_post',
      title: 'Speed Post Tracking & Inquiry Status',
      titleHi: 'स्पीड पोस्ट ट्रैकिंग एवं आवेदन स्थिति',
      subtitle: 'Verify Reference/Ticket ID + registered mobile or Speed Post barcode status',
      icon: Truck,
      badgeText: 'Track Status',
      action: () => {
        onClose();
        onOpenTrackModal();
      },
    },
    {
      id: 'citizen_documentation',
      title: 'Citizen Documentation Desk (CELC / DLC / PAN)',
      titleHi: 'नागरिक दस्तावेज डेस्क (आधार / जीवन प्रमाण / पैन)',
      subtitle: 'Child Aadhaar CELC (0–5 Yrs), Jeevan Pramaan DLC, PAN Form 49A & e-Stamps',
      icon: FileText,
      badgeText: 'Biometric Doorstep',
      action: () => {
        onClose();
        onOpenCitizenModal();
      },
    },
  ];

  // 4. India Post Post Offices & Bulk Dispatch Hubs
  const officialPostalHubs: LocalStoreHub[] = [
    {
      name: 'Dadabari Sub Post Office (S.O.)',
      category: 'Department of Posts · Beat 2 Field Operations & IPPB',
      beatManager: 'Mahendra Kumar Meena',
      beatNo: 'Beat 2',
      phone: '9460020640',
      address: 'Near Shastri Park, Main Road, Dadabari (PIN 324009)',
      timings: '09:00 AM – 05:00 PM',
      isOfficial: true,
    },
    {
      name: 'Kota Head Post Office (Kota H.O.)',
      category: 'Divisional Head Office · Philately, MyStamp & Corporate Bulk',
      beatManager: 'Philately & Bulk Mail Counter',
      beatNo: 'Beat 1',
      phone: '9460020640',
      address: 'Civil Lines, Kota Division (PIN 324001)',
      timings: '09:00 AM – 05:30 PM',
      isOfficial: true,
    },
    {
      name: 'Vigyan Nagar Sub Post Office (S.O.)',
      category: 'Academic Study Material Bulk Parcel & BNPL Node',
      beatManager: 'Academic Fulfillment Desk',
      beatNo: 'Beat 14',
      phone: '9460020640',
      address: 'Vigyan Nagar Commercial Center, Kota (PIN 324005)',
      timings: '09:00 AM – 06:00 PM',
    },
    {
      name: 'Kaithoon Sub Post Office (S.O.)',
      category: 'GI Kota Doria Weavers Guild & Insured Parcel Hub',
      beatManager: 'Heritage Loom Cooperative',
      beatNo: 'Beat 1',
      phone: '9460020640',
      address: 'Kaithoon Main Market, Kota Division (PIN 325001)',
      timings: '09:30 AM – 05:30 PM',
    },
    {
      name: 'Indraprastha Sub Post Office (S.O.)',
      category: 'RIICO Industrial Mailers & SME Business Parcel Pickup',
      beatManager: 'RIICO Industrial Hub Desk',
      beatNo: 'Beat 1',
      phone: '9460020640',
      address: 'Indraprastha Industrial Area, Kota (PIN 324003)',
      timings: '09:00 AM – 06:00 PM',
    },
    {
      name: 'Baran Head Post Office (Baran H.O.)',
      category: 'Hadoti Spice & Agro FPO Bulk Dispatch Terminal',
      beatManager: 'FPO Agro Dispatch',
      beatNo: 'Beat 1',
      phone: '9460020640',
      address: 'Baran Division HQ (PIN 325205)',
      timings: '09:00 AM – 05:30 PM',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="relative w-full max-w-md bg-slate-950 text-slate-100 flex flex-col justify-between shadow-2xl z-10 border-r border-slate-800 h-full overflow-hidden animate-in slide-in-from-left duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="India Post Navigation Menu"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950 via-slate-950 to-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-700 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                📮
              </div>
              <div>
                <div className="text-base font-black text-white tracking-tight leading-tight flex items-center gap-2">
                  <span>INDIA POST</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-800 text-white font-bold">
                    PIN {activePincode}
                  </span>
                </div>
                <p className="text-[11px] text-amber-300 font-medium truncate">
                  {lang === 'hi'
                    ? `${activeHub.officeName} · पिन ${activeHub.pincode}`
                    : `${activeHub.officeName} · ${activeHub.division}`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition"
              aria-label="Close Menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Location Selector & Language Toggle */}
          <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPincodeModal();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-[11px] font-bold cursor-pointer transition border border-slate-800"
            >
              <MapPin size={12} className="text-red-400 shrink-0" />
              <span>PIN {activePincode}</span>
              <span className="text-slate-400 text-[10px] font-normal font-sans">({lang === 'hi' ? 'बदलें' : 'Change'})</span>
            </button>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <Globe size={11} className="text-amber-400 ml-1 shrink-0" />
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => onSelectLang(opt.code)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                    lang === opt.code
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 text-xs custom-scrollbar">
          {/* Quick Action Tiles */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenTrackModal();
              }}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left flex items-start gap-2.5 transition cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-slate-800 text-amber-400 shrink-0 group-hover:bg-amber-400 group-hover:text-slate-950 transition">
                <Truck size={15} />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white text-xs truncate">
                  {lang === 'hi' ? 'आवेदन / पार्सल ट्रैक' : 'Track Status'}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">Ticket ID + Mobile</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCitizenModal();
              }}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left flex items-start gap-2.5 transition cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-red-950 text-red-400 shrink-0 group-hover:bg-red-700 group-hover:text-white transition">
                <FileText size={15} />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white text-xs truncate">
                  {lang === 'hi' ? 'नागरिक सेवा डेस्क' : 'Citizen Desk'}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">CELC, DLC, PAN, e-Stamp</div>
              </div>
            </button>
          </div>

          {/* 1. BULK CUSTOMER & PROMOTED PRODUCTS CATEGORIES */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-black tracking-wider text-slate-400 uppercase">
              <span>{lang === 'hi' ? 'बल्क ग्राहक एवं प्रचारित उत्पाद' : 'Bulk Customer Showcase'}</span>
              <span className="text-[10px] text-amber-400 lowercase font-mono">5 categories</span>
            </div>

            <div className="space-y-2">
              {bulkShowcaseCategories.map((cat) => {
                const IconComp = cat.icon;
                const isExpanded = expandedGroupId === cat.id;

                return (
                  <div
                    key={cat.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden transition"
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(cat.id)}
                      className="w-full p-3 flex items-center justify-between gap-3 text-left hover:bg-slate-850 transition cursor-pointer"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${cat.accentColor}`}>
                          <IconComp size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white text-xs truncate flex items-center gap-2">
                            <span>{lang === 'hi' ? cat.titleHi : cat.title}</span>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 shrink-0">
                              {cat.badgeText}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            {lang === 'hi' ? cat.subtitleHi : cat.subtitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={`p-1 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          <ChevronDown size={14} />
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-3 pt-0 border-t border-slate-800/80 space-y-2.5 bg-slate-950/50 animate-in fade-in duration-150">
                        <div className="space-y-1.5 pt-2">
                          {cat.subItems.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleNavClick(cat.anchorId, cat.filterKey)}
                              className="w-full p-2 rounded-lg text-left text-[11px] text-slate-300 hover:text-white hover:bg-slate-800/70 transition flex items-center justify-between gap-2 group cursor-pointer"
                            >
                              <span className="truncate group-hover:text-amber-300">
                                {lang === 'hi' && item.nameHi ? item.nameHi : item.name}
                              </span>
                              {item.badge && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-950 text-red-300 font-bold shrink-0">
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleNavClick(cat.anchorId, cat.filterKey)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>{lang === 'hi' ? 'पूरी श्रेणी देखें' : `Browse ${cat.title}`}</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. SOVEREIGN POSTAL & FINANCIAL SERVICES */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-black tracking-wider text-slate-400 uppercase">
              <span>{lang === 'hi' ? 'सरकारी डाक एवं वित्तीय सेवाएं' : 'Sovereign Postal & Finance'}</span>
              <span className="text-[10px] text-amber-400 lowercase font-mono">100% Govt Trust</span>
            </div>

            <div className="space-y-2">
              {sovereignFinancialServices.map((fin) => {
                const IconComp = fin.icon;
                const isExpanded = expandedGroupId === fin.id;

                return (
                  <div
                    key={fin.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden transition"
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(fin.id)}
                      className="w-full p-3 flex items-center justify-between gap-3 text-left hover:bg-slate-850 transition cursor-pointer"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-red-950/80 text-amber-300 border border-red-800/40 flex items-center justify-center shrink-0">
                          <IconComp size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white text-xs truncate flex items-center gap-2">
                            <span>{lang === 'hi' ? fin.titleHi : fin.title}</span>
                          </div>
                          <div className="text-[10px] text-emerald-400 font-mono font-bold truncate mt-0.5">
                            {fin.rateHighlight}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={`p-1 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          <ChevronDown size={14} />
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-3 pt-0 border-t border-slate-800/80 space-y-2.5 bg-slate-950/50 animate-in fade-in duration-150">
                        <p className="text-[10px] text-slate-400 leading-relaxed pt-2">
                          {fin.desc}
                        </p>

                        <div className="space-y-1.5">
                          {fin.subItems.map((sub, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleNavClick(fin.anchorId)}
                              className="w-full p-2 rounded-lg text-left text-[11px] text-slate-200 hover:text-white hover:bg-slate-800/70 transition flex items-center justify-between gap-2 cursor-pointer group"
                            >
                              <span className="truncate group-hover:text-amber-300">{sub.title}</span>
                              <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">
                                {sub.highlight}
                              </span>
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleNavClick(fin.anchorId)}
                          className="w-full py-2 px-3 rounded-xl bg-red-800 hover:bg-red-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span>{lang === 'hi' ? 'आधिकारिक स्टोर में देखें' : 'View Sovereign Counters'}</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. LOGISTICS & CITIZEN DOCUMENTATION DESK */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <div className="text-[11px] font-black tracking-wider text-slate-400 uppercase">
              {lang === 'hi' ? 'डाक एवं नागरिक सेवाएं' : 'Speed Post & Citizen Services'}
            </div>

            <div className="space-y-2">
              {logisticsAndCitizenServices.map((srv) => {
                const IconComp = srv.icon;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={srv.action}
                    className="w-full p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-left flex items-start justify-between gap-3 transition cursor-pointer group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 text-red-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-red-700 group-hover:text-white transition">
                        <IconComp size={16} />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="font-bold text-white text-xs group-hover:text-amber-300 transition leading-snug">
                          {lang === 'hi' ? srv.titleHi : srv.title}
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 leading-relaxed">
                          {srv.subtitle}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                      {srv.badgeText}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. INDIA POST OFFICES & BULK HUBS */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800" id="drawer-local-stores-section">
            <div className="flex items-center justify-between text-[11px] font-black tracking-wider text-slate-400 uppercase">
              <span>{lang === 'hi' ? 'डाकघर एवं बल्क डिस्पैच हब' : 'Post Offices & Bulk Hubs'}</span>
              <span className="text-[10px] text-emerald-400 lowercase font-mono">Division mapped</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {lang === 'hi'
                ? 'डाकघर काउंटरों एवं बीट प्रबंधकों से सीधे व्हाट्सएप पर जुड़ें।'
                : 'Connect directly with regional Post Office counters & Beat operations desks.'}
            </p>

            <div className="space-y-2">
              {officialPostalHubs.map((st, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border transition ${
                    st.isOfficial
                      ? 'bg-gradient-to-r from-red-950/70 to-slate-900 border-red-800/60'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-white text-xs">{st.name}</span>
                        {st.isOfficial && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-bold">
                            Official
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{st.category}</div>
                      <div className="text-[10px] text-slate-300 flex items-center gap-2 flex-wrap">
                        <span>Desk: <strong className="text-white">{st.beatManager}</strong></span>
                        <span>·</span>
                        <span className="text-amber-300 font-mono font-semibold">{st.beatNo}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock size={10} className="text-slate-500" />
                        <span>{st.timings}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <a
                        href={`https://api.whatsapp.com/send?phone=${activeHub.whatsappPhone}&text=${encodeURIComponent(
                          `Namaste ${st.name} (${activeHub.officeName} · PIN ${activeHub.pincode}),\nI want to connect with ${st.beatManager} (${st.beatNo}) for India Post assistance.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center shadow-xs"
                        title={`WhatsApp ${st.name}`}
                        aria-label={`WhatsApp ${st.name}`}
                      >
                        <MessageCircle size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4B. INDIA POST HUBS & BULK SHOWCASE */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-black tracking-wider text-slate-400 uppercase">
              <span>India Post Hubs &amp; Bulk Showcase</span>
              <span className="text-[10px] text-amber-400 font-mono">Official Portal</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {OFFICIAL_BRAND_STORES.map((store) => (
                <Link
                  key={store.slug}
                  to={`/brand/${store.slug}`}
                  onClick={onClose}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left flex items-center gap-2 transition"
                >
                  <Store size={13} className="text-amber-400 shrink-0" />
                  <span className="text-[11px] font-bold text-white truncate">{store.brandName}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* 5. BULK CUSTOMER DESK & STAFF SIGN-IN */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-[11px] font-black tracking-wider text-slate-400 uppercase">
              {lang === 'hi' ? 'थोक ग्राहक एवं संचालन डेस्क' : 'Bulk Customer & Operational Gateways'}
            </div>
            <Link
              to="/b2b-partner"
              onClick={onClose}
              className="w-full p-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 text-left flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Bulk Customer &amp; BNPL Desk</div>
                  <div className="text-[10px] text-emerald-300/90">Institutional Buyers &amp; Business Parcel</div>
                </div>
              </div>
              <ArrowRight size={13} className="text-emerald-400 shrink-0" />
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStaffLogin();
                }}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-left border border-slate-800 transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <UserCheck size={13} className="text-amber-400" />
                  <span>Staff Login</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Beat Postman &amp; Desk</div>
              </button>

              <Link
                to="/login"
                onClick={onClose}
                className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-left border border-amber-400/30 transition block"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Crown size={13} className="text-amber-400" />
                  <span>Operations Portal</span>
                </div>
                <div className="text-[10px] text-amber-200/80 mt-0.5">Admin &amp; Office Sign-In</div>
              </Link>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2.5 text-xs shrink-0">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>{lang === 'hi' ? 'डाकघर आधिकारिक सहायता:' : '13 Pincode Hub Support:'}</span>
            <span className="font-mono text-emerald-400 font-bold">India Post Desk</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://api.whatsapp.com/send?phone=${activeHub.whatsappPhone}&text=${encodeURIComponent(
                `Namaste India Post Hub Desk (${activeHub.officeName} · PIN ${activeHub.pincode}), I need assistance with postal services or a bulk inquiry.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 transition text-[11px] shadow-xs"
            >
              <MessageCircle size={13} />
              <span>WhatsApp Support</span>
            </a>

            <Link
              to="/b2b-partner"
              onClick={onClose}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold flex items-center justify-center gap-1.5 transition text-[11px]"
            >
              <Building2 size={13} className="text-amber-400" />
              <span>Bulk Customer Desk</span>
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
