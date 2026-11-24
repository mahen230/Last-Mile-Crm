import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Utensils,
  BatteryCharging,
  Shirt,
  Smartphone,
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
  HeartPulse,
  Leaf,
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
  // Accordion active state: defaults to first category open
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>('kirana');
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

  // 1. Clean Consumer-Facing Categories
  const consumerCategories: CategoryMenuGroup[] = [
    {
      id: 'kirana',
      title: 'Kirana & Daily Staples',
      titleHi: 'किराना एवं दैनिक राशन',
      subtitle: 'Atta, Edible Oils, Unpolished Pulses & Ration Crates',
      subtitleHi: 'आटा, खाद्य तेल, दालें एवं मासिक राशन पेटी',
      icon: ShoppingBag,
      accentColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      badgeText: '₹15 Beat Del',
      anchorId: 'daily-kirana-section',
      filterKey: 'supermarket',
      subItems: [
        { id: 'atta', name: 'Aashirvaad Chakki Atta 10kg Sack', nameHi: 'आशीर्वाद चक्की आटा 10 किलो', badge: 'Wholesale' },
        { id: 'oils', name: 'Fortune Mustard & Sunlite 5L Twin Pack', nameHi: 'फॉर्च्यून सरसों व सनलाइट तेल 5 लीटर' },
        { id: 'pulses', name: 'Tata Sampann Unpolished Toor & Moong 5kg', nameHi: 'टाटा सम्पन्न अनपॉलिश दालें 5 किलो' },
        { id: 'hamper', name: 'Dadabari 12-Item Monthly Kitchen Crate', nameHi: 'दादाबाड़ी 12-वस्तु मासिक रसोई पेटी', badge: 'Save ₹400' },
        { id: 'spices', name: 'MDH & Everest Spices + Red Label Tea', nameHi: 'एमडीएच मसाले एवं रेड लेबल चाय' },
      ],
    },
    {
      id: 'bakery_dairy',
      title: 'Fresh Dairy & QSR',
      titleHi: 'ताजा डेयरी एवं फास्ट फूड',
      subtitle: "Pure A2 Milk, Malai Paneer, Cakes & Domino's QSR",
      subtitleHi: "शुद्ध ए2 दूध, मलाई पनीर, केक एवं डोमिनोज़ पिज्जा",
      icon: Utensils,
      accentColor: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      badgeText: 'Cold-Chain 35m',
      anchorId: 'dairy-bakery-section',
      filterKey: 'bakery_dairy',
      subItems: [
        { id: 'milk', name: 'Dadabari Fresh Pure A2 Buffalo Milk 2L', nameHi: 'दादाबाड़ी शुद्ध ए2 भैंस का दूध 2 लीटर' },
        { id: 'paneer', name: 'Fresh Malai Paneer 500g & Matka Curd', nameHi: 'ताजा मलाई पनीर 500 ग्राम व मटका दही' },
        { id: 'dominos', name: "Domino's Farmhouse Feast + Garlic Bread Combo", nameHi: 'डोमिनोज़ पिज्जा एवं गार्लिक ब्रेड कॉम्बो', badge: 'Hot COD' },
        { id: 'cakes', name: 'Dutch Chocolate Truffle Celebration Cake 1kg', nameHi: 'डच चॉकलेट ट्रफल बर्थडे केक 1 किलो' },
        { id: 'bakery_bakes', name: 'Artisanal Butter Croissants & Toast Rusks', nameHi: 'ताजा मक्खन क्रोइसैन एवं रस्क' },
      ],
    },
    {
      id: 'ev',
      title: 'EV Mobility & Batteries',
      titleHi: 'ईवी मोबिलिटी एवं बैटरी',
      subtitle: 'XPEEDO Scooters, 60V Lithium Packs & 10A Fast Chargers',
      subtitleHi: 'एक्सपीडो इलेक्ट्रिक स्कूटर, 60V लीथियम पैक व चार्जर',
      icon: BatteryCharging,
      accentColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      badgeText: 'Govt Subsidy Ready',
      anchorId: 'vendor-carousels-hub',
      filterKey: 'ev',
      subItems: [
        { id: 'scooter', name: 'XPEEDO X1 Pro 85km Range EV Scooter', nameHi: 'एक्सपीडो X1 प्रो 85 किमी रेंज स्कूटर', badge: 'Test Ride' },
        { id: 'battery', name: '60V 30Ah LiFePO4 Swappable Smart Battery', nameHi: '60V 30Ah स्वापेबल लीथियम बैटरी' },
        { id: 'charger', name: '60V/72V 10A Intelligent Auto-Cut Fast Charger', nameHi: '60V 10A ऑटो-कट फास्ट चार्जर' },
        { id: 'delivery_box', name: '45L Lockable Delivery Box & USB Mount', nameHi: '45 लीटर लॉक पार्सल बॉक्स व मोबाइल स्टैंड' },
        { id: 'helmet', name: 'ISI Modular Safety Helmet & GPS Tracker Kit', nameHi: 'आईएसआई हेलमेट एवं जीपीएस ट्रैकर किट' },
      ],
    },
    {
      id: 'apparel',
      title: 'Branded Fashion & Footwear',
      titleHi: 'ब्रांडेड परिधान एवं जूते',
      subtitle: "Allen Solly, Levi's, Fabindia & Velocity Sports Studio",
      subtitleHi: 'एलन सोली, लेवाइस, फैबइंडिया एवं वेलोसिटी स्पोर्ट्स',
      icon: Shirt,
      accentColor: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
      badgeText: 'Size Exchange',
      anchorId: 'fashion-footwear-section',
      filterKey: 'apparel',
      subItems: [
        { id: 'solly_polo', name: 'Allen Solly Pique Cotton Polos & Formal Blazers', nameHi: 'एलन सोली कॉटन पोलो टीशर्ट व ब्लेजर' },
        { id: 'levi_jeans', name: "Levi's 511 Authentic Stretch Denims & Truckers", nameHi: 'लेवाइस 511 स्ट्रेच जींस व जैकेट्स' },
        { id: 'fabindia', name: 'Fabindia Artisanal Handloom Cotton Kurta Sets', nameHi: 'फैबइंडिया हैंडलूम कॉटन कुर्ता सेट' },
        { id: 'velocity_shoe', name: 'Velocity Marathon Running Shoes + Hydration Flask', nameHi: 'वेलोसिटी मैराथन रनिंग जूते व बॉटल', badge: 'Top Seller' },
        { id: 'trainers', name: 'Court Trainers, Cricket Bat Kit & Gym Duffel', nameHi: 'कोर्ट ट्रेनर्स, क्रिकेट किट व जिम बैग' },
      ],
    },
    {
      id: 'electronics',
      title: 'Electronics & Smart Tech',
      titleHi: 'इलेक्ट्रॉनिक्स एवं स्मार्ट टेक',
      subtitle: 'Reliance Digital Audio, GaN Chargers & Smart Living',
      subtitleHi: 'रिलायंस डिजिटल ऑडियो, चार्जर एवं स्मार्ट लिविंग',
      icon: Smartphone,
      accentColor: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
      badgeText: 'Brand Warranty',
      anchorId: 'electronics-tech-section',
      filterKey: 'electronics',
      subItems: [
        { id: 'earbuds', name: 'boAt Airdopes 48H ANC Wireless Earbuds', nameHi: 'बोट एयरडोप्स 48 घंटे एएनसी ईयरबड्स' },
        { id: 'gan_charger', name: '65W Triple-Port GaN Laptop & Phone Fast Charger', nameHi: '65W ट्रिपल-पोर्ट GaN फास्ट चार्जर' },
        { id: 'powerbank', name: '20,000mAh 22.5W Quick Charge Power Bank', nameHi: '20,000mAh क्विक चार्ज पावर बैंक' },
        { id: 'airfryer', name: 'Smart Living 4.5L Digital Touch Air Fryer & Grill', nameHi: 'स्मार्ट लिविंग 4.5L डिजिटल टच एयर फ्रायर', badge: 'Save ₹1500' },
        { id: 'kettle', name: '1.8L Stainless Steel Kettle & 1000W NutriBlender', nameHi: '1.8L स्टील केतली व न्यूट्री ब्लेंडर' },
      ],
    },
    {
      id: 'medical',
      title: 'Medical & Pharmacy',
      titleHi: 'मेडिकल एवं फार्मेसी',
      subtitle: 'OTCs, BP Monitors, Immunity & First-Aid Kits',
      subtitleHi: 'दवाइयां, बीपी मॉनिटर, इम्युनिटी व फर्स्ट-एड किट',
      icon: HeartPulse,
      accentColor: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
      badgeText: 'Sealed Pharmacy',
      anchorId: 'medical-pharmacy-section',
      filterKey: 'medical',
      subItems: [
        { id: 'med_bp', name: 'Omron Automatic Digital BP Monitor', nameHi: 'ओमरोन डिजिटल बीपी मॉनिटर', badge: '25-Min Del' },
        { id: 'med_glucometer', name: 'Accu-Chek Instant Glucometer + 25 Strips', nameHi: 'ग्लूकोमीटर + 25 टेस्ट स्ट्रिप्स' },
        { id: 'med_firstaid', name: '24-Piece Family Emergency First-Aid Kit', nameHi: '24-पीस फैमिली फर्स्ट-एड किट' },
        { id: 'med_ors', name: 'Electral Hydration & Daily Vitamin C Pack', nameHi: 'इलेक्ट्रल एवं विटामिन C पैक' },
      ],
    },
    {
      id: 'sabji_mandi',
      title: 'Sabji Mandi (Farm Fresh)',
      titleHi: 'ताजा सब्जी मंडी',
      subtitle: 'Morning Farm Tomatoes, Onions, Greens & Seasonal Fruits',
      subtitleHi: 'ताजा टमाटर, प्याज, हरी सब्जियां व मौसमी फल',
      icon: Leaf,
      accentColor: 'text-lime-400 bg-lime-400/10 border-lime-400/20',
      badgeText: '6 AM Harvest',
      anchorId: 'sabji-mandi-section',
      filterKey: 'sabji_mandi',
      subItems: [
        { id: 'veg_basket', name: 'Daily Sabji Mandi Essentials Crate (5kg Mix)', nameHi: 'दैनिक ताजा सब्जी टोकरी (5 किलो)', badge: 'Farm Direct' },
        { id: 'veg_greens', name: 'Fresh Spinach, Coriander & Curry Leaves Combo', nameHi: 'ताजा पालक, धनिया व हरी मिर्च कॉम्बो' },
        { id: 'veg_potato_onion', name: 'Indore Chipsona Potato + Nashik Onion 5kg', nameHi: 'आलू + नासिक लाल प्याज 5 किलो पैक' },
        { id: 'fruit_box', name: 'Seasonal Kota Orchard Kinnow & Banana Box', nameHi: 'ताजा मौसमी फल फैमिली बॉक्स' },
      ],
    },
  ];

  // 2. Sovereign & Postal Services mapped under clean financial headings
  const sovereignFinancialServices: FinancialMenuGroup[] = [
    {
      id: 'sovereign_savings',
      title: 'Sovereign Savings (SSY/SCSS)',
      titleHi: 'सरकारी बचत योजनाएं (सुकन्या/वरिष्ठ नागरिक)',
      rateHighlight: '8.2% p.a. Tax-Free',
      desc: 'Sukanya Samriddhi (SSY), Senior Citizen Savings (SCSS), PPF & Monthly Income (MIS)',
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
      title: 'Postal Insurance (PLI/RPLI)',
      titleHi: 'डाक जीवन बीमा (पीएलआई/आरपीएलआई)',
      rateHighlight: '₹76/1K Peak Bonus',
      desc: 'PLI Suraksha Whole Life, Santosh Endowment & RPLI Gram Santosh with sovereign claim guarantee',
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
      desc: 'Zero-Balance Digital Accounts, ₹10 Lakh Accidental Cover, AePS Doorstep Cash & Shopkeeper QR Standees',
      icon: Landmark,
      anchorId: 'post-office-banking-store',
      subTab: 'IPPB_QR_COVER',
      subItems: [
        { title: 'IPPB Zero-Balance Account', highlight: 'Instant RuPay & AePS' },
        { title: '₹10 Lakh Accidental Insurance', highlight: '₹399/Yr Premium' },
        { title: 'Doorstep AePS Biometric Cash', highlight: 'Up to ₹10,000 Delivery' },
        { title: 'Merchant QR Standee & Soundbox', highlight: 'Zero MDR Settlement' },
      ],
    },
  ];

  // 3. Logistics & Citizen Documentation
  const logisticsAndCitizenServices = [
    {
      id: 'logistics_speed_post',
      title: 'Courier & Speed Post Logistics',
      titleHi: 'स्पीड पोस्ट कूरियर एवं पार्सल लॉजिस्टिक्स',
      subtitle: 'Doorstep Pickup, Real-Time Consignment Barcode Tracking & Dak Niryat Kendra',
      icon: Truck,
      badgeText: 'Track SP-RJ-...',
      action: () => {
        onClose();
        onOpenTrackModal();
      },
    },
    {
      id: 'citizen_documentation',
      title: 'Citizen Documentation Desk (e-Mitra / PAN / Aadhaar)',
      titleHi: 'नागरिक दस्तावेज डेस्क (ई-मित्र / पैन / आधार)',
      subtitle: 'Child Aadhaar CELC (0–5 Yrs), PAN Form 49A, Ayushman PM-JAY & Rajasthan e-Stamps',
      icon: FileText,
      badgeText: 'Biometric Doorstep',
      action: () => {
        onClose();
        onOpenCitizenModal();
      },
    },
  ];

  // 4. Authorized Local Stores & Hubs (Dedicated Bottom Section)
  const authorizedLocalStores: LocalStoreHub[] = [
    {
      name: 'Dadabari Sub Post Office Sovereign Counters',
      category: 'Department of Posts · Head Office Desk',
      beatManager: 'Official Postal Desk',
      beatNo: 'Headquarters',
      phone: '9460020640',
      address: 'Near Shastri Park, Main Commercial Road, Dadabari (324009)',
      timings: '09:00 AM – 05:00 PM',
      isOfficial: true,
    },
    {
      name: 'XPEEDO EV & Green Mobility Regional Hub',
      category: 'EV Scooters, LiFePO4 Batteries & Fast Chargers',
      beatManager: 'Mahendra Kumar Meena',
      beatNo: 'Beat 2 Delivery Head',
      phone: '8769706002',
      address: 'Dadabari Commercial Arcade, Near Circle, Kota',
      timings: '08:00 AM – 08:30 PM',
    },
    {
      name: "Allen Solly & Levi's Authorized Franchise",
      category: 'Branded Apparel, Stretch Denim & Size Exchange',
      beatManager: 'Mahendra Kumar Meena',
      beatNo: 'Beat 2 & Beat 3',
      phone: '9460020640',
      address: 'Showroom 14, Main Road, Dadabari, Kota',
      timings: '10:00 AM – 09:00 PM',
    },
    {
      name: 'Dadabari Fresh Cold-Chain Dairy & Bakery',
      category: 'Pure A2 Buffalo Milk, Paneer & Truffle Cakes',
      beatManager: 'Cold-Chain Supervisor',
      beatNo: 'Beat 2 Sector 4 Hub',
      phone: '8769706002',
      address: 'Sector 4 Market, Dadabari, Kota',
      timings: '06:00 AM – 09:00 PM',
    },
    {
      name: "Domino's QSR Express Hub",
      category: 'Farmhouse Pizzas, Stuffed Garlic Bread & Hot Combos',
      beatManager: 'Dadabari Circle Express Team',
      beatNo: 'Beat 2 Delivery Node',
      phone: '9460020640',
      address: 'Dadabari Circle Express Counter, Kota',
      timings: '11:00 AM – 11:00 PM',
    },
    {
      name: 'Reliance Digital & Smart Tech Center',
      category: 'ANC Earbuds, GaN Chargers, Air Fryers & Home Tech',
      beatManager: 'Mohit Arvind',
      beatNo: 'Beat 5 Keshavpura Node',
      phone: '9460020640',
      address: 'Keshavpura Commercial Center, Kota',
      timings: '10:00 AM – 08:30 PM',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-Out Drawer Panel */}
      <aside
        className="relative w-full max-w-md bg-slate-950 text-slate-100 flex flex-col justify-between shadow-2xl z-10 border-r border-slate-800 h-full overflow-hidden animate-in slide-in-from-left duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="XPOKART Category-First Navigation Menu"
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
                  <span>XPOKART</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-800 text-white font-bold">
                    PIN {activePincode}
                  </span>
                </div>
                <p className="text-[11px] text-amber-300 font-medium truncate">
                  {lang === 'hi'
                    ? `${activeHub.officeName} · पिन ${activeHub.pincode}`
                    : `${activeHub.officeName} · ${activeHub.localStockingPartner}`}
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

          {/* Location Selector & Quick Bilingual Toggle Strip */}
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

            {/* Quick Bilingual Switcher (English / Hindi / Rajasthani) */}
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
                  {lang === 'hi' ? 'ऑर्डर ट्रैक करें' : 'Track Order'}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">Speed Post Barcode</div>
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
                <div className="text-[10px] text-slate-400 truncate mt-0.5">PAN, Aadhaar, e-Stamps</div>
              </div>
            </button>
          </div>

          {/* 1. SECTION: CONSUMER-FACING CATEGORIES (ACCORDION STRUCTURE) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-black tracking-wider text-slate-400 uppercase">
              <span>{lang === 'hi' ? 'उपभोक्ता श्रेणियां' : 'Consumer Catalog Categories'}</span>
              <span className="text-[10px] text-amber-400 lowercase font-mono">7 verticals</span>
            </div>

            <div className="space-y-2">
              {consumerCategories.map((cat) => {
                const IconComp = cat.icon;
                const isExpanded = expandedGroupId === cat.id;

                return (
                  <div
                    key={cat.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden transition"
                  >
                    {/* Category Accordion Header */}
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

                    {/* Smooth Accordion Body */}
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

                        {/* View Entire Category Button */}
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

          {/* 2. SECTION: SOVEREIGN POSTAL & FINANCIAL SERVICES */}
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

          {/* 3. SECTION: LOGISTICS & CITIZEN DOCUMENTATION DESK */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <div className="text-[11px] font-black tracking-wider text-slate-400 uppercase">
              {lang === 'hi' ? 'लॉजिस्टिक्स एवं ई-मित्र नागरिक सेवाएं' : 'Courier & Citizen Services'}
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

          {/* 4. SECTION: DEDICATED "AUTHORIZED LOCAL STORES & HUBS" SECTION */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800" id="drawer-local-stores-section">
            <div className="flex items-center justify-between text-[11px] font-black tracking-wider text-slate-400 uppercase">
              <span>{lang === 'hi' ? 'अधिकृत स्थानीय स्टोर्स एवं हब' : 'Authorized Local Stores & Hubs'}</span>
              <span className="text-[10px] text-emerald-400 lowercase font-mono">Beat 2 mapped</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {lang === 'hi'
                ? 'भौतिक स्टोर, ब्रांड शोरूम एवं डाकघर काउंटरों से सीधे व्हाट्सएप व कॉल पर जुड़ें।'
                : 'Connect directly with physical showrooms, Post Office counters & assigned Beat Managers.'}
            </p>

            <div className="space-y-2">
              {authorizedLocalStores.map((st, idx) => (
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
                        <span>Beat Mgr: <strong className="text-white">{st.beatManager}</strong></span>
                        <span>·</span>
                        <span className="text-amber-300 font-mono font-semibold">{st.beatNo}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock size={10} className="text-slate-500" />
                        <span>{st.timings}</span>
                      </div>
                    </div>

                    {/* Quick WhatsApp Support Bridge */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <a
                        href={`https://api.whatsapp.com/send?phone=${activeHub.whatsappPhone}&text=${encodeURIComponent(
                          `Namaste ${st.name} (${activeHub.officeName} · PIN ${activeHub.pincode}),\nI want to connect with ${st.beatManager} (${st.beatNo}) for order assistance.`
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

          {/* 4B. CONSOLIDATED OFFICIAL BRAND STORES */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-black tracking-wider text-slate-400 uppercase">
              <span>Official Brand Stores</span>
              <span className="text-[10px] text-amber-400 font-mono">Central COD</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {OFFICIAL_BRAND_STORES.slice(0, 8).map((brand) => (
                <Link
                  key={brand.slug}
                  to={`/brand/${brand.slug}`}
                  onClick={onClose}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left flex items-center gap-2 transition"
                >
                  <Store size={13} className="text-amber-400 shrink-0" />
                  <span className="text-[11px] font-bold text-white truncate">{brand.brandName}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* 5. SECTION: B2B PORTAL & ROLE-BASED COMMAND GATEWAY */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-[11px] font-black tracking-wider text-slate-400 uppercase">
              {lang === 'hi' ? 'व्यापार एवं संचालन डेस्क' : 'Business & Operational Gateways'}
            </div>
            <Link
              to="/b2b-partner"
              onClick={onClose}
              className="w-full p-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 text-left flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">B2B &amp; Merchant Partner Portal</div>
                  <div className="text-[10px] text-emerald-300/90">Bulk Buyers, Franchises &amp; Local Sellers</div>
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

              <a
                href="/dev-command-secure-portal?token=xpokart_master_key_9460020640"
                className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-left border border-amber-400/30 transition block"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Crown size={13} className="text-amber-400" />
                  <span>Master Console</span>
                </div>
                <div className="text-[10px] text-amber-200/80 mt-0.5">Super Admin Desk</div>
              </a>
            </div>
          </div>
        </div>

        {/* Drawer Footer with Clean Support Bridges (Zero Visible Raw Numbers) */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2.5 text-xs shrink-0">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>{lang === 'hi' ? 'डाकघर आधिकारिक सहायता:' : '13 Pincode Hub Support:'}</span>
            <span className="font-mono text-emerald-400 font-bold">24×7 Express Desk</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`https://api.whatsapp.com/send?phone=${activeHub.whatsappPhone}&text=${encodeURIComponent(
                `Namaste XPOKART Hub Desk (${activeHub.officeName} · PIN ${activeHub.pincode}), I need order assistance.`
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
              <span>Partner Portal</span>
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
