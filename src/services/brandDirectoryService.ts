import { staffProductService } from './staffProductService';
import { getPincodeHub } from './pincodeOperationsService';

import imgBrandApparel from '../assets/images/brand_apparel_fashion_1794743634256.jpg';
import imgBrandElectronics from '../assets/images/brand_electronics_hub_1794743634422.jpg';
import imgBrandFootwear from '../assets/images/brand_footwear_sports_1794747058446.jpg';
import imgBrandHomeGadgets from '../assets/images/brand_home_gadgets_1794747072023.jpg';
import imgBrandQsrPizza from '../assets/images/brand_qsr_pizza_1794743632250.jpg';
import imgBrandSupermarket from '../assets/images/brand_supermarket_mart_1794743632575.jpg';
import imgBakeryDairy from '../assets/images/local_bakery_dairy_1794822884061.jpg';
import imgLaundryEvent from '../assets/images/laundry_event_kit_1794822884997.jpg';
import imgEvScooter from '../assets/images/ev_scooter_mobility_1794822882283.jpg';
import imgEvBattery from '../assets/images/ev_lithium_battery_1794822883055.jpg';
import imgEvCharger from '../assets/images/ev_fast_charger_1794822883729.jpg';
import imgEvAccessories from '../assets/images/ev_accessories_kit_1794822883888.jpg';
import imgPharmaWellness from '../assets/images/prod_b2b_pharma_wellness_1794734843342.jpg';
import imgSabjiMandi from '../assets/images/sabji_mandi_fresh_1794971673626.jpg';
import imgHandloom from '../assets/images/store_kota_handloom_1794731364865.jpg';
import imgDigitalDocs from '../assets/images/store_digital_documents_1794731363970.jpg';

export interface UnifiedBrandProduct {
  id: string;
  sku: string;
  title: string;
  brandSlug: string;
  brandName: string;
  categoryGroup: string;
  mrpPrice: number;
  retailPrice: number;
  imageSrc: string;
  description: string;
  badgeTag: string;
}

export interface OfficialBrandStore {
  slug: string;
  brandName: string;
  shortTagline: string;
  categoryLabel: string;
  coverImage: string;
  accentGradient: string;
  trustAssurance: string;
  deliveryGuarantee: string;
  featuredCategories: string[];
}

export const OFFICIAL_BRAND_STORES: OfficialBrandStore[] = [
  {
    slug: 'dominos-pizza',
    brandName: "Domino's Pizza",
    shortTagline: 'Oven-Hot Pizzas, Stuffed Garlic Bread & Party Boxes via Centralized XPOKART COD',
    categoryLabel: 'Fresh QSR & Hot Meals',
    coverImage: imgBrandQsrPizza,
    accentGradient: 'from-rose-950 via-red-900 to-slate-950',
    trustAssurance: 'Authorized Regional QSR Partner',
    deliveryGuarantee: 'Thermal-Sealed Express COD Dispatch',
    featuredCategories: ['Signature Pizzas', 'Family Combos', 'Sides & Beverages'],
  },
  {
    slug: 'reliance-digital',
    brandName: 'Reliance Digital',
    shortTagline: 'Brand-Warranty ANC Audio, 65W GaN Chargers & Smart Electronics',
    categoryLabel: 'Electronics & Smart Tech',
    coverImage: imgBrandElectronics,
    accentGradient: 'from-sky-950 via-indigo-900 to-slate-950',
    trustAssurance: 'GST Invoice & Manufacturer Warranty',
    deliveryGuarantee: 'Insured Tamper-Proof Speed Post COD',
    featuredCategories: ['Audio & Earbuds', 'Fast Charging & Power', 'Tech Bundles'],
  },
  {
    slug: 'allen-solly',
    brandName: 'Allen Solly',
    shortTagline: 'Showroom-Sealed Pique Polos, Tailored Chinos & Linen Blazers',
    categoryLabel: 'Menswear & Formal Fashion',
    coverImage: imgBrandApparel,
    accentGradient: 'from-amber-950 via-red-900 to-slate-950',
    trustAssurance: '100% Authentic Tag & 48-Hr Exchange',
    deliveryGuarantee: 'Sealed Apparel Parcel · Flat ₹15 Fee',
    featuredCategories: ['Polos & Chinos', 'Formal Blazers'],
  },
  {
    slug: 'levis',
    brandName: "Levi's",
    shortTagline: 'Authentic 511 Stretch Denim, Casual Shirts & Indigo Trucker Jackets',
    categoryLabel: 'Denim & Streetwear',
    coverImage: imgEvCharger,
    accentGradient: 'from-slate-950 via-blue-950 to-indigo-950',
    trustAssurance: 'QR Verified Denim & 48-Hr Exchange',
    deliveryGuarantee: 'Flat ₹15 Speed Post Beat Delivery',
    featuredCategories: ['Stretch Denim', 'Trucker Jackets'],
  },
  {
    slug: 'fabindia',
    brandName: 'Fabindia',
    shortTagline: 'Artisanal Handloom Cotton-Silk Kurta Sets & Ethnic Heritage Wear',
    categoryLabel: 'Handloom & Ethnic Fashion',
    coverImage: imgHandloom,
    accentGradient: 'from-orange-950 via-amber-900 to-slate-950',
    trustAssurance: 'Handloom Craft Verified · Sealed Gift Pack',
    deliveryGuarantee: 'Express Doorstep COD',
    featuredCategories: ['Festive Kurta Sets', 'Handloom Ethnic'],
  },
  {
    slug: 'xpeedo-ev',
    brandName: 'XPEEDO EV',
    shortTagline: 'Electric Scooters, 60V LiFePO4 Batteries & 10A Auto-Cut Fast Chargers',
    categoryLabel: 'EV Mobility & Batteries',
    coverImage: imgEvScooter,
    accentGradient: 'from-emerald-950 via-teal-900 to-slate-950',
    trustAssurance: 'Authorized Regional EV Center',
    deliveryGuarantee: 'Test Ride & Insured Delivery',
    featuredCategories: ['Electric Scooters', 'Lithium Batteries', 'Chargers & Gear'],
  },
  {
    slug: 'velocity-sports',
    brandName: 'Velocity Sports',
    shortTagline: 'Marathon Running Shoes, Court Trainers, Cricket Bats & Gym Gear',
    categoryLabel: 'Sports & Athletic Footwear',
    coverImage: imgBrandFootwear,
    accentGradient: 'from-violet-950 via-purple-900 to-slate-950',
    trustAssurance: '48-Hr Beat Size Exchange',
    deliveryGuarantee: 'Flat ₹15 Speed Post COD',
    featuredCategories: ['Running Footwear', 'Cricket & Fitness'],
  },
  {
    slug: 'smart-living',
    brandName: 'Smart Living',
    shortTagline: '4.5L Digital Air Fryers, Precision Steel Kettles & 1000W Nutri-Blenders',
    categoryLabel: 'Home & Kitchen Appliances',
    coverImage: imgBrandHomeGadgets,
    accentGradient: 'from-cyan-950 via-slate-900 to-indigo-950',
    trustAssurance: '2-Year Replacement Warranty',
    deliveryGuarantee: 'Insured Boxed COD Delivery',
    featuredCategories: ['Kitchen Tech', 'Brewing & Blenders'],
  },
  {
    slug: 'dadabari-fresh',
    brandName: 'Daily Fresh Dairy & Bakery',
    shortTagline: 'Morning A2 Buffalo Milk, Malai Paneer, Croissants & Celebration Cakes',
    categoryLabel: 'Fresh Dairy & Artisanal Bakery',
    coverImage: imgBakeryDairy,
    accentGradient: 'from-yellow-950 via-amber-900 to-red-950',
    trustAssurance: 'Daily Cold-Chain Tested Freshness',
    deliveryGuarantee: 'Morning & Express COD Dispatch',
    featuredCategories: ['A2 Milk & Paneer', 'Cakes & Bakery'],
  },
  {
    slug: 'xpokart-essentials',
    brandName: 'Daily Kirana, Pharmacy & Mandi',
    shortTagline: 'Household Ration, OTC Diagnostics & Morning Farm Vegetables',
    categoryLabel: 'Daily Essentials Hub',
    coverImage: imgBrandSupermarket,
    accentGradient: 'from-emerald-950 via-green-900 to-slate-950',
    trustAssurance: '13-Hub Regional Stocking Fulfillment',
    deliveryGuarantee: 'Flat ₹15 Speed Post Beat COD',
    featuredCategories: ['Kirana & Ration', 'Medical & Pharmacy', 'Sabji Mandi'],
  },
  {
    slug: 'software-saas-hub',
    brandName: 'Top Trending Software & CRMs',
    shortTagline: 'WhatsApp Bulk Messaging, Tally Connector, AI Video Generators & Lovable App Builders',
    categoryLabel: 'Business Software & SaaS',
    coverImage: imgDigitalDocs,
    accentGradient: 'from-purple-950 via-indigo-900 to-slate-950',
    trustAssurance: 'Instant Digital License & Speed Post COD',
    deliveryGuarantee: 'Email License Key & WhatsApp Onboarding',
    featuredCategories: ['WhatsApp & CRM', 'Accounting & Tally', 'AI Video & App Builders'],
  },
];

const BASE_UNIFIED_BRAND_PRODUCTS: UnifiedBrandProduct[] = [
  // Domino's Pizza (Consolidated)
  {
    id: 'brand-dom-01',
    sku: 'BRAND-DOMINOS-FARM-699',
    title: "Domino's · Farmhouse Feast + Stuffed Garlic Bread COD Combo",
    brandSlug: 'dominos-pizza',
    brandName: "Domino's Pizza",
    categoryGroup: 'Family Combos',
    mrpPrice: 899,
    retailPrice: 699,
    imageSrc: imgBrandQsrPizza,
    description: 'Medium Farmhouse pizza, stuffed garlic bread, cheese dip & oregano packs hot-sealed.',
    badgeTag: 'Best Seller',
  },
  {
    id: 'brand-dom-02',
    sku: 'BRAND-DOMINOS-4BOX-1199',
    title: "Domino's · 4-Pizza Family Celebration Box + Choco Lava",
    brandSlug: 'dominos-pizza',
    brandName: "Domino's Pizza",
    categoryGroup: 'Signature Pizzas',
    mrpPrice: 1599,
    retailPrice: 1199,
    imageSrc: imgBrandQsrPizza,
    description: '4 Classic Hand-Tossed pizzas with choco lava cake & 2 beverages dispatched via XPOKART.',
    badgeTag: 'Party Pack',
  },
  {
    id: 'brand-dom-03',
    sku: 'BRAND-DOMINOS-PEPPER-549',
    title: "Domino's · Peppy Paneer + Classic Garlic Bread & Pepsi Combo",
    brandSlug: 'dominos-pizza',
    brandName: "Domino's Pizza",
    categoryGroup: 'Signature Pizzas',
    mrpPrice: 720,
    retailPrice: 549,
    imageSrc: imgBrandQsrPizza,
    description: 'Peppy Paneer medium pizza paired with baked garlic breadsticks and chilled beverage.',
    badgeTag: 'Hot COD',
  },

  // Reliance Digital (Consolidated)
  {
    id: 'brand-rel-01',
    sku: 'BRAND-BOAT-EARBUDS-1999',
    title: 'Reliance Digital · boAt Airdopes 48H ANC Wireless Earbuds',
    brandSlug: 'reliance-digital',
    brandName: 'Reliance Digital',
    categoryGroup: 'Audio & Earbuds',
    mrpPrice: 2999,
    retailPrice: 1999,
    imageSrc: imgBrandElectronics,
    description: '48-hour active noise cancelling earbuds with quad mic ENx & USB-C charging case.',
    badgeTag: 'Official Warranty',
  },
  {
    id: 'brand-rel-02',
    sku: 'BRAND-GAN-CHARGER-1499',
    title: 'Reliance Digital · 65W Triple-Port GaN Laptop & Phone Fast Charger',
    brandSlug: 'reliance-digital',
    brandName: 'Reliance Digital',
    categoryGroup: 'Fast Charging & Power',
    mrpPrice: 2199,
    retailPrice: 1499,
    imageSrc: imgBrandElectronics,
    description: 'Compact 65W Gallium Nitride PD charger supporting laptops, tablets & fast smartphones.',
    badgeTag: 'Student Pick',
  },
  {
    id: 'brand-rel-03',
    sku: 'BRAND-POWERBANK-1999',
    title: 'Reliance Digital · 20,000mAh 22.5W Quick Charge Power Bank',
    brandSlug: 'reliance-digital',
    brandName: 'Reliance Digital',
    categoryGroup: 'Fast Charging & Power',
    mrpPrice: 2899,
    retailPrice: 1999,
    imageSrc: imgBrandElectronics,
    description: 'High-density lithium-polymer power bank with LED charge indicator & dual output.',
    badgeTag: 'BIS Certified',
  },
  {
    id: 'brand-rel-04',
    sku: 'BRAND-RELIANCE-TECH-2499',
    title: 'Reliance Digital · Studio ANC Wireless Headset + 65W GaN Bundle',
    brandSlug: 'reliance-digital',
    brandName: 'Reliance Digital',
    categoryGroup: 'Tech Bundles',
    mrpPrice: 3499,
    retailPrice: 2499,
    imageSrc: imgBrandElectronics,
    description: 'Authorized Reliance Digital over-ear ANC wireless headphones bundled with 65W charger.',
    badgeTag: 'Value Bundle',
  },

  // Allen Solly (Consolidated)
  {
    id: 'brand-solly-01',
    sku: 'BRAND-SOLLY-POLO-1799',
    title: 'Allen Solly · Pique Cotton Polo & Stretch Chino Combo',
    brandSlug: 'allen-solly',
    brandName: 'Allen Solly',
    categoryGroup: 'Polos & Chinos',
    mrpPrice: 2499,
    retailPrice: 1799,
    imageSrc: imgBrandApparel,
    description: 'Breathable signature cotton pique polo paired with slim-fit comfort stretch chinos.',
    badgeTag: 'Showroom Sealed',
  },
  {
    id: 'brand-solly-02',
    sku: 'BRAND-SOLLY-BLAZER-3899',
    title: 'Allen Solly · Tailored Linen Blend Formal Blazer',
    brandSlug: 'allen-solly',
    brandName: 'Allen Solly',
    categoryGroup: 'Formal Blazers',
    mrpPrice: 5499,
    retailPrice: 3899,
    imageSrc: imgBrandApparel,
    description: 'Wrinkle-resistant tailored linen-blend blazer ideal for formal office & wedding occasions.',
    badgeTag: '48-Hr Exchange',
  },

  // Levi's (Consolidated)
  {
    id: 'brand-levi-01',
    sku: 'BRAND-LEVI-DENIM-2499',
    title: "Levi's · 511 Authentic Stretch Denim & Casual Shirt Pack",
    brandSlug: 'levis',
    brandName: "Levi's",
    categoryGroup: 'Stretch Denim',
    mrpPrice: 3499,
    retailPrice: 2499,
    imageSrc: imgBrandApparel,
    description: "Signature Levi's 511 slim-stretch jeans bundled with brushed cotton casual shirt.",
    badgeTag: 'QR Authentic',
  },
  {
    id: 'brand-levi-02',
    sku: 'BRAND-LEVI-TRUCKER-2799',
    title: "Levi's · Classic Indigo Trucker Jacket + Cotton Crew Tee",
    brandSlug: 'levis',
    brandName: "Levi's",
    categoryGroup: 'Trucker Jackets',
    mrpPrice: 3999,
    retailPrice: 2799,
    imageSrc: imgBrandApparel,
    description: "Heritage indigo denim trucker jacket paired with authentic Levi's graphic cotton tee.",
    badgeTag: 'Season Classic',
  },

  // Fabindia (Consolidated)
  {
    id: 'brand-fab-01',
    sku: 'BRAND-FAB-ETHNIC-2199',
    title: 'Fabindia · Handcrafted Cotton Silk Kurta & Pajama Set',
    brandSlug: 'fabindia',
    brandName: 'Fabindia',
    categoryGroup: 'Festive Kurta Sets',
    mrpPrice: 2999,
    retailPrice: 2199,
    imageSrc: imgBrandApparel,
    description: 'Artisanal handloom cotton-silk festive kurta pajama set in gift-ready packaging.',
    badgeTag: 'Handloom Certified',
  },
  {
    id: 'brand-fab-02',
    sku: 'BRAND-FAB-NEHRU-1999',
    title: 'Fabindia · Hand-Block Linen Nehru Jacket + Short Kurta',
    brandSlug: 'fabindia',
    brandName: 'Fabindia',
    categoryGroup: 'Handloom Ethnic',
    mrpPrice: 2799,
    retailPrice: 1999,
    imageSrc: imgBrandApparel,
    description: 'Breathable summer handloom linen sleeveless Nehru jacket & printed cotton kurta.',
    badgeTag: 'Artisanal',
  },

  // XPEEDO EV (Consolidated)
  {
    id: 'brand-ev-scooter-01',
    sku: 'XPEEDO-EV-X1PRO-54999',
    title: 'XPEEDO EV · X1 Pro City & Cargo Electric Scooter',
    brandSlug: 'xpeedo-ev',
    brandName: 'XPEEDO EV',
    categoryGroup: 'Electric Scooters',
    mrpPrice: 68999,
    retailPrice: 54999,
    imageSrc: imgEvScooter,
    description: '85 km range BLDC hub motor scooter with detachable 60V battery & rear parcel carrier.',
    badgeTag: '3-Yr Warranty',
  },
  {
    id: 'brand-ev-battery-02',
    sku: 'XPEEDO-LFP-60V30AH-18499',
    title: 'XPEEDO EV · 60V 30Ah LiFePO4 Swappable Battery Pack',
    brandSlug: 'xpeedo-ev',
    brandName: 'XPEEDO EV',
    categoryGroup: 'Lithium Batteries',
    mrpPrice: 23999,
    retailPrice: 18499,
    imageSrc: imgEvBattery,
    description: 'Smart BMS automotive-grade LiFePO4 battery with 2,000+ cycles & IP67 enclosure.',
    badgeTag: '3-Yr Warranty',
  },
  {
    id: 'brand-ev-charger-03',
    sku: 'XPEEDO-CHG-60V10A-2999',
    title: 'XPEEDO EV · 60V/72V 10A Smart Auto-Cut Fast Charger',
    brandSlug: 'xpeedo-ev',
    brandName: 'XPEEDO EV',
    categoryGroup: 'Chargers & Gear',
    mrpPrice: 4199,
    retailPrice: 2999,
    imageSrc: imgEvCharger,
    description: 'Die-cast aluminum finned 10A intelligent fast charger with over-voltage auto-cut.',
    badgeTag: '1-Yr Warranty',
  },
  {
    id: 'brand-ev-acc-04',
    sku: 'XPEEDO-ACC-KIT-1899',
    title: 'XPEEDO EV · Helmet, GPS Tracker & Delivery Rack Kit',
    brandSlug: 'xpeedo-ev',
    brandName: 'XPEEDO EV',
    categoryGroup: 'Chargers & Gear',
    mrpPrice: 2699,
    retailPrice: 1899,
    imageSrc: imgEvAccessories,
    description: 'ISI modular EV helmet, Geo-Trace GPS tracker, alloy phone mount & saddle bag.',
    badgeTag: 'Safety Bundle',
  },
  {
    id: 'brand-ev-battery-05',
    sku: 'XPEEDO-LFP-48V24AH-13999',
    title: 'XPEEDO EV · 48V 24Ah Commuter Lithium Battery Pack',
    brandSlug: 'xpeedo-ev',
    brandName: 'XPEEDO EV',
    categoryGroup: 'Lithium Batteries',
    mrpPrice: 17999,
    retailPrice: 13999,
    imageSrc: imgEvBattery,
    description: 'Lightweight swappable 48V lithium pack tuned for low-speed urban delivery scooters.',
    badgeTag: '3-Yr Warranty',
  },
  {
    id: 'brand-ev-rack-06',
    sku: 'XPEEDO-CARGO-RACK-2499',
    title: 'XPEEDO EV · Heavy-Duty Parcel Box & USB Charger Mount',
    brandSlug: 'xpeedo-ev',
    brandName: 'XPEEDO EV',
    categoryGroup: 'Chargers & Gear',
    mrpPrice: 3499,
    retailPrice: 2499,
    imageSrc: imgEvAccessories,
    description: 'Waterproof 45L parcel carrier box with lockable steel frame & handlebar USB.',
    badgeTag: 'Cargo Ready',
  },

  // Velocity Sports
  {
    id: 'brand-vel-01',
    sku: 'BRAND-VELOCITY-PRO-2299',
    title: 'Velocity Sports · Marathon Running Sneakers + Hydration Flask',
    brandSlug: 'velocity-sports',
    brandName: 'Velocity Sports',
    categoryGroup: 'Running Footwear',
    mrpPrice: 3299,
    retailPrice: 2299,
    imageSrc: imgBrandFootwear,
    description: 'Breathable mesh running shoes with cushioned EVA sole & insulated steel flask.',
    badgeTag: 'Top Rated',
  },
  {
    id: 'brand-vel-02',
    sku: 'BRAND-COURT-TRAINERS-1899',
    title: 'Velocity Sports · Court Trainers + Water-Resistant Gym Duffel',
    brandSlug: 'velocity-sports',
    brandName: 'Velocity Sports',
    categoryGroup: 'Running Footwear',
    mrpPrice: 2699,
    retailPrice: 1899,
    imageSrc: imgBrandFootwear,
    description: 'Non-marking high-stability court shoes bundled with compact gym duffel bag.',
    badgeTag: 'Size Exchange',
  },
  {
    id: 'brand-vel-03',
    sku: 'VEL-CRICKET-TURF-2999',
    title: 'Velocity Sports · English Willow Hybrid Turf Bat & Gloves Kit',
    brandSlug: 'velocity-sports',
    brandName: 'Velocity Sports',
    categoryGroup: 'Cricket & Fitness',
    mrpPrice: 4199,
    retailPrice: 2999,
    imageSrc: imgBrandFootwear,
    description: 'Seasoned willow cricket bat, padded batting gloves & kit carry sleeve.',
    badgeTag: 'Turf Ready',
  },

  // Smart Living
  {
    id: 'brand-smart-01',
    sku: 'BRAND-SMART-AIRFRYER-3499',
    title: 'Smart Living · 4.5L Digital Touch Air Fryer & Grill',
    brandSlug: 'smart-living',
    brandName: 'Smart Living',
    categoryGroup: 'Kitchen Tech',
    mrpPrice: 4999,
    retailPrice: 3499,
    imageSrc: imgBrandHomeGadgets,
    description: '360° hot-air circulation oil-free digital air fryer with 8 cooking presets.',
    badgeTag: '2-Yr Warranty',
  },
  {
    id: 'brand-smart-02',
    sku: 'BRAND-KETTLE-1899',
    title: 'Smart Living · 1.8L Precision Stainless Electric Kettle',
    brandSlug: 'smart-living',
    brandName: 'Smart Living',
    categoryGroup: 'Brewing & Blenders',
    mrpPrice: 2599,
    retailPrice: 1899,
    imageSrc: imgBrandHomeGadgets,
    description: 'Food-grade 304 steel electric kettle with auto boil-dry safety cut-off.',
    badgeTag: 'Hostel Favorite',
  },
  {
    id: 'brand-smart-03',
    sku: 'BRAND-BLENDER-2899',
    title: 'Smart Living · 1000W Copper-Motor Nutri-Blender + Speaker',
    brandSlug: 'smart-living',
    brandName: 'Smart Living',
    categoryGroup: 'Brewing & Blenders',
    mrpPrice: 3999,
    retailPrice: 2899,
    imageSrc: imgBrandHomeGadgets,
    description: 'High-speed smoothie & spice blender paired with compact Bluetooth kitchen speaker.',
    badgeTag: 'Combo Offer',
  },

  // Daily Fresh Dairy & Bakery
  {
    id: 'brand-fresh-01',
    sku: 'XPO-BAKERY-DAIRY-649',
    title: 'Daily Fresh · Pure A2 Buffalo Milk 2L, Paneer 500g & Truffle Cake',
    brandSlug: 'dadabari-fresh',
    brandName: 'Daily Fresh Dairy & Bakery',
    categoryGroup: 'A2 Milk & Paneer',
    mrpPrice: 850,
    retailPrice: 649,
    imageSrc: imgBakeryDairy,
    description: 'Cold-chain verified pure A2 milk, soft malai paneer & celebratory truffle cake pack.',
    badgeTag: 'Morning Fresh',
  },
  {
    id: 'brand-fresh-02',
    sku: 'XPO-DAIRY-BREAKFAST-399',
    title: 'Daily Fresh · Artisanal Butter Croissants, Toast Rusks & Matka Curd',
    brandSlug: 'dadabari-fresh',
    brandName: 'Daily Fresh Dairy & Bakery',
    categoryGroup: 'Cakes & Bakery',
    mrpPrice: 520,
    retailPrice: 399,
    imageSrc: imgBakeryDairy,
    description: 'Fresh morning baked butter croissants, crunchy suji rusks & earthen matka dahi.',
    badgeTag: 'Daily Baked',
  },
  {
    id: 'brand-fresh-03',
    sku: 'XPO-LAUNDRY-EVENT-499',
    title: 'Express Steam · 10-Garment Steam Dry-Clean & Kraft Parcel Return',
    brandSlug: 'dadabari-fresh',
    brandName: 'Daily Fresh Dairy & Bakery',
    categoryGroup: 'Express Laundry',
    mrpPrice: 699,
    retailPrice: 499,
    imageSrc: imgLaundryEvent,
    description: 'Doorstep Beat pickup & 24-hour crisp steam dry-cleaning returned in sealed kraft pack.',
    badgeTag: '24-Hr Pickup',
  },

  // XPOKART Daily Essentials
  {
    id: 'brand-ess-01',
    sku: 'XPO-ATTA-10KG-385',
    title: 'Aashirvaad · Shudh Chakki Whole Wheat Atta 10kg Family Pack',
    brandSlug: 'xpokart-essentials',
    brandName: 'Daily Kirana, Pharmacy & Mandi',
    categoryGroup: 'Kirana & Ration',
    mrpPrice: 465,
    retailPrice: 385,
    imageSrc: imgBrandSupermarket,
    description: '100% MP Sharbati stone-ground whole wheat atta sealed & delivered to doorstep.',
    badgeTag: 'High Demand',
  },
  {
    id: 'brand-ess-02',
    sku: 'XPO-MED-OMRON-BP-1849',
    title: 'Omron · HEM-7120 Automatic Digital Blood Pressure Monitor',
    brandSlug: 'xpokart-essentials',
    brandName: 'Daily Kirana, Pharmacy & Mandi',
    categoryGroup: 'Medical & Pharmacy',
    mrpPrice: 2490,
    retailPrice: 1849,
    imageSrc: imgPharmaWellness,
    description: 'Clinically validated Intellisense digital BP monitor with irregular heartbeat alert.',
    badgeTag: 'Sealed Pharmacy',
  },
  {
    id: 'brand-ess-03',
    sku: 'XPO-SABJI-CRATE-249',
    title: 'Morning Mandi · Fresh Potato, Onion, Tomato & Leafy Greens 5kg Crate',
    brandSlug: 'xpokart-essentials',
    brandName: 'Daily Kirana, Pharmacy & Mandi',
    categoryGroup: 'Sabji Mandi',
    mrpPrice: 340,
    retailPrice: 249,
    imageSrc: imgSabjiMandi,
    description: '6 AM hand-sorted Kota & Baran farm basket delivered chilled with COD.',
    badgeTag: '6 AM Harvest',
  },
  // Top Trending Software, CRMs & Business Solutions
  {
    id: 'sw-wa-crm-01',
    sku: 'SW-WHATSAPP-CRM-2499',
    title: 'WhatsApp Cloud API Bulk Messaging & Multi-Agent CRM Suite (1 Yr)',
    brandSlug: 'software-saas-hub',
    brandName: 'Top Trending Software & CRMs',
    categoryGroup: 'WhatsApp & CRM',
    mrpPrice: 4999,
    retailPrice: 2499,
    imageSrc: imgDigitalDocs,
    description: 'Official Meta Cloud API bulk broadcast, chatbot automation, multi-agent shared inbox & webhook triggers.',
    badgeTag: 'Official API',
  },
  {
    id: 'sw-tally-02',
    sku: 'SW-TALLY-GST-3499',
    title: 'Tally Prime & Cloud GST Connector Integration Suite (1 Yr)',
    brandSlug: 'software-saas-hub',
    brandName: 'Top Trending Software & CRMs',
    categoryGroup: 'Accounting & Tally',
    mrpPrice: 5999,
    retailPrice: 3499,
    imageSrc: imgDigitalDocs,
    description: 'Automated e-invoicing, E-way bill generation, bank statement reconciliations & direct tally sync.',
    badgeTag: 'GST Ready',
  },
  {
    id: 'sw-ai-video-03',
    sku: 'SW-AIVIDEO-PRO-1999',
    title: 'AI Video & Multilingual Avatar Generator (Pro Studio License / Mo)',
    brandSlug: 'software-saas-hub',
    brandName: 'Top Trending Software & CRMs',
    categoryGroup: 'AI Video & App Builders',
    mrpPrice: 3499,
    retailPrice: 1999,
    imageSrc: imgDigitalDocs,
    description: 'Create hyper-realistic AI spokesperson videos and marketing reels in 40+ languages instantly.',
    badgeTag: 'Pro Studio',
  },
  {
    id: 'sw-lovable-04',
    sku: 'SW-LOVABLE-DEV-4999',
    title: 'Lovable.dev & Full-Stack AI App Builder Enterprise License (1 Yr)',
    brandSlug: 'software-saas-hub',
    brandName: 'Top Trending Software & CRMs',
    categoryGroup: 'AI Video & App Builders',
    mrpPrice: 8999,
    retailPrice: 4999,
    imageSrc: imgDigitalDocs,
    description: 'Build production-grade web apps with AI prompts, custom domains, and priority deployment support.',
    badgeTag: 'Enterprise',
  },
  {
    id: 'sw-n8n-05',
    sku: 'SW-N8N-ZAPIER-2999',
    title: 'n8n & Zapier Advanced Workflow Automation Suite (Self-Hosted / 1 Yr)',
    brandSlug: 'software-saas-hub',
    brandName: 'Top Trending Software & CRMs',
    categoryGroup: 'WhatsApp & CRM',
    mrpPrice: 4999,
    retailPrice: 2999,
    imageSrc: imgDigitalDocs,
    description: 'Unlimited workflow automations, CRM webhook integrations, and automated lead routing nodes.',
    badgeTag: 'Self-Hosted',
  },
  {
    id: 'sw-zoho-hubspot-06',
    sku: 'SW-ZOHO-HUBSPOT-3999',
    title: 'Zoho & HubSpot Enterprise CRM Suite Integration (1 Yr)',
    brandSlug: 'software-saas-hub',
    brandName: 'Top Trending Software & CRMs',
    categoryGroup: 'WhatsApp & CRM',
    mrpPrice: 6999,
    retailPrice: 3999,
    imageSrc: imgDigitalDocs,
    description: 'Complete sales pipeline management, WhatsApp lead tracking, quotation generator & analytics.',
    badgeTag: 'Cloud Suite',
  },
];

export function resolveBrandSlug(brandName?: string): string {
  const lower = (brandName || '').toLowerCase();
  if (lower.includes('domino')) return 'dominos-pizza';
  if (lower.includes('reliance')) return 'reliance-digital';
  if (lower.includes('allen') || lower.includes('solly')) return 'allen-solly';
  if (lower.includes('levi')) return 'levis';
  if (lower.includes('fabindia')) return 'fabindia';
  if (lower.includes('xpeedo')) return 'xpeedo-ev';
  if (lower.includes('velocity')) return 'velocity-sports';
  if (lower.includes('smart living')) return 'smart-living';
  if (lower.includes('software') || lower.includes('whatsapp') || lower.includes('tally') || lower.includes('ai video') || lower.includes('lovable') || lower.includes('n8n') || lower.includes('crm')) {
    return 'software-saas-hub';
  }
  if (lower.includes('dairy') || lower.includes('bakery') || lower.includes('laundry')) {
    return 'dadabari-fresh';
  }
  return 'xpokart-essentials';
}

export function getOfficialBrandBySlug(slug?: string): OfficialBrandStore {
  return (
    OFFICIAL_BRAND_STORES.find((b) => b.slug === slug) || OFFICIAL_BRAND_STORES[0]
  );
}

/**
 * Returns consolidated, SKU-deduplicated products for an official brand store,
 * dynamically merged with any staff-published SKUs matching that brand and routed
 * through the active regional pincode delivery office & local stocking partner.
 */
export function getConsolidatedProductsForBrand(
  brandSlug: string,
  activePincode: string
): {
  brand: OfficialBrandStore;
  hub: ReturnType<typeof getPincodeHub>;
  productsByCategory: Record<string, UnifiedBrandProduct[]>;
  allProducts: UnifiedBrandProduct[];
} {
  const brand = getOfficialBrandBySlug(brandSlug);
  const hub = getPincodeHub(activePincode);
  const seenSkus = new Set<string>();
  const collected: UnifiedBrandProduct[] = [];

  for (const item of BASE_UNIFIED_BRAND_PRODUCTS) {
    if (item.brandSlug !== brand.slug) continue;
    const key = item.sku.trim().toUpperCase();
    if (seenSkus.has(key)) continue;
    seenSkus.add(key);
    collected.push(item);
  }

  // Merge any staff-published items matching the brand without creating duplicates
  const staffCatalog = staffProductService.getPublicCatalog();
  for (const prod of staffCatalog) {
    const matchedSlug = resolveBrandSlug(prod.brandName || prod.vendorName || prod.title);
    if (matchedSlug !== brand.slug) continue;
    if (prod.price <= 0) continue;
    const key = (prod.sku || prod.id).trim().toUpperCase();
    if (seenSkus.has(key)) continue;
    seenSkus.add(key);
    const mrp = prod.mrpPrice && prod.mrpPrice > prod.price ? prod.mrpPrice : Math.round(prod.price * 1.25);
    collected.push({
      id: prod.id,
      sku: prod.sku,
      title: prod.title,
      brandSlug: brand.slug,
      brandName: brand.brandName,
      categoryGroup: prod.brandCategoryTag || prod.vendorCategory || brand.featuredCategories[0] || 'Featured',
      mrpPrice: mrp,
      retailPrice: prod.price,
      imageSrc: prod.thumbnailUrl || brand.coverImage,
      description: prod.description,
      badgeTag: `Fulfilled via PIN ${hub.pincode}`,
    });
  }

  const productsByCategory: Record<string, UnifiedBrandProduct[]> = {};
  for (const item of collected) {
    if (!productsByCategory[item.categoryGroup]) {
      productsByCategory[item.categoryGroup] = [];
    }
    productsByCategory[item.categoryGroup].push(item);
  }

  return {
    brand,
    hub,
    productsByCategory,
    allProducts: collected,
  };
}
