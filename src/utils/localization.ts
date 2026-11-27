// Localization module for India Post (Kota & Baran Division 13-Pincode Hub Network)
// Supports English (en), Hindi (hi), and Regional Rajasthani/Marwari (raj)
import { safeStorage } from './safeStorage';

export type SupportedLanguage = 'en' | 'hi' | 'raj';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'raj', name: 'Rajasthani', nativeName: 'राजस्थानी (मारवाड़ी)', flag: '🐪' },
];

const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Navigation
    nav_home: 'Home',
    nav_categories: 'Categories',
    nav_post_office: 'Post Office Store',
    nav_top_sellers: 'Top Sellers',
    nav_citizen_desk: 'Citizen Desk',
    nav_track_order: 'Track COD',
    nav_cart: 'Cart',
    nav_book_visit: 'Book Visit',
    nav_menu: 'All Categories & Stores',

    // Brand & Location
    brand_sub: 'Sovereign Hyper-Local Marketplace',
    pincode_label: 'Dadabari S.O. PIN 324009',
    beat_info: '13 Pincode Hubs · Express Beats',
    delivery_sla: '30-45 Min Express Beat Delivery',
    flat_delivery_fee: '₹15 Flat Beat Del Fee',
    partner_margin: 'Direct Store Savings',

    // Search & Actions
    search_placeholder: 'Search SSY, PLI, Speed Post, IPPB, MyStamp, Bulk Parcel...',
    add_to_cart: 'Add to Cart · COD',
    quick_inquiry: 'Quick Inquiry',
    whatsapp_desk: 'Order on WhatsApp',
    whatsapp_beat2: 'WhatsApp Support',
    partner_mode: 'Verified Savings',

    // Hero & Live Desk
    hero_kicker: 'Kota & Baran Hub Network · Speed Post COD',
    live_desk_title: 'Live Desk: Urgent Flash Deals & Official Notices',
    urgent_deal: 'URGENT DEAL',
    expires_in: 'Expires in',
    claim_offer: 'Claim Offer · COD',
    mrp_label: 'MRP',
    offer_price: 'Offer Price',
    you_save: 'You Save',

    // Sections
    sec_top_sellers: 'Exclusive Top-Selling Products',
    sec_top_sellers_sub: 'High-velocity recurring essentials strictly exclusive to this discovery shelf',
    sec_trending_categories: 'Top Trending Categories',
    sec_trending_categories_sub: 'Explore verified hyper-local categories across Dadabari PIN 324009',
    sec_service_ecosystems: 'Local Service Ecosystem & Storefronts',
    sec_service_ecosystems_sub: 'Click any ecosystem hub for verified address, working hours, and full store catalog',
    sec_citizen_desk: 'Citizen Documentation & Statutory Application Desk',
    sec_citizen_desk_sub: 'Doorstep biometric visits for PAN card, Child Aadhaar, Ayushman Bharat & small savings',

    // Citizen services
    pan_title: 'PAN Card New / Correction (Form 49A)',
    pan_desc: 'Doorstep biometric e-KYC authentication and NSDL/UTIITSL processing.',
    celc_title: 'Child Aadhaar Enrolment (0–5 Yrs CELC)',
    celc_desc: 'Free doorstep biometric tablet enrolment by authorized Beat 2 Postman.',
    ayushman_title: 'Ayushman Bharat Golden Health Card (PM-JAY)',
    ayushman_desc: '₹5 Lakh per year cashless hospitalization coverage for eligible families.',
    estamp_title: 'Rajasthan e-Gras Legal Stamp Papers & e-Stamps',
    estamp_desc: 'Affidavits, rent agreements, and statutory legal agreements with official seal.',
    ssy_title: 'Sukanya Samriddhi (SSY 8.2%) / SCSS Account Booking',
    ssy_desc: 'Doorstep account opening kit pickup and sovereign passbook delivery.',

    // Common
    apply_now: 'Book Doorstep Slot',
    view_store: 'View Store Catalog',
    location_near_me: 'Near Me',
    select_pincode: 'Change Vicinity PIN',
  },
  hi: {
    // Navigation
    nav_home: 'होम',
    nav_categories: 'श्रेणियां',
    nav_post_office: 'डाकघर स्टोर',
    nav_top_sellers: 'बेस्ट सेलर',
    nav_citizen_desk: 'नागरिक सेवा डेस्क',
    nav_track_order: 'ऑर्डर ट्रैक करें',
    nav_cart: 'कार्ट',
    nav_book_visit: 'विजिट बुक करें',
    nav_menu: 'सभी श्रेणियां एवं स्टोर्स',

    // Brand & Location
    brand_sub: 'स्थानीय सरकारी एवं ई-कॉमर्स बाजार',
    pincode_label: 'दादाबाड़ी उप डाकघर पिन 324009',
    beat_info: '13 पिनकोड हब · एक्सप्रेस बीट',
    delivery_sla: '30-45 मिनट एक्सप्रेस बीट डिलीवरी',
    flat_delivery_fee: '₹15 फ्लैट बीट डिलीवरी शुल्क',
    partner_margin: 'सीधी स्टोर बचत',

    // Search & Actions
    search_placeholder: 'सुकन्या, पीएलआई, स्पीड पोस्ट, आईपीपीबी, मायस्टैम्प, बल्क पार्सल खोजें...',
    add_to_cart: 'कार्ट में जोड़ें · सीओडी',
    quick_inquiry: 'त्वरित पूछताछ',
    whatsapp_desk: 'व्हाट्सएप ऑर्डर',
    whatsapp_beat2: 'व्हाट्सएप सहायता',
    partner_mode: 'प्रमाणित बचत',

    // Hero & Live Desk
    hero_kicker: 'अधिकृत दादाबाड़ी डाकघर हब · स्पीड पोस्ट सीओडी',
    live_desk_title: 'लाइव डेस्क: तत्काल फ्लैश डील्स एवं आधिकारिक सूचनाएं',
    urgent_deal: 'सीमित समय ऑफर',
    expires_in: 'समाप्ति में शेष',
    claim_offer: 'ऑफर पाएं · सीओडी',
    mrp_label: 'एमआरपी',
    offer_price: 'ऑफर मूल्य',
    you_save: 'आपकी बचत',

    // Sections
    sec_top_sellers: 'एक्सक्लूसिव टॉप-सेलिंग प्रोडक्ट्स',
    sec_top_sellers_sub: 'दैनिक जरूरत के सबसे अधिक बिकने वाले उत्पाद जो केवल यहीं उपलब्ध हैं',
    sec_trending_categories: 'शीर्ष ट्रेंडिंग श्रेणियां',
    sec_trending_categories_sub: 'दादाबाड़ी पिन 324009 के तहत स्थानीय प्रमाणित सेवाएं एवं वस्तुएं',
    sec_service_ecosystems: 'स्थानीय सेवा इकोसिस्टम एवं स्टोर फ्रंट्स',
    sec_service_ecosystems_sub: 'प्रमाणित पता, समय और पूरे कैटलॉग के लिए किसी भी स्टोर कार्ड पर क्लिक करें',
    sec_citizen_desk: 'नागरिक दस्तावेज एवं सरकारी आवेदन डेस्क',
    sec_citizen_desk_sub: 'पैन कार्ड, बाल आधार, आयुष्मान भारत और डाक बचत खातों के लिए घर बैठे स्लॉट बुक करें',

    // Citizen services
    pan_title: 'नया पैन कार्ड / सुधार (फॉर्म 49ए)',
    pan_desc: 'घर बैठे बायोमेट्रिक ई-केवाईसी सत्यापन एवं एनएसडीएल/यूटीआईआईटीएसएल प्रोसेसिंग।',
    celc_title: 'बाल आधार नामांकन (0–5 वर्ष CELC)',
    celc_desc: 'अधिकृत बीट 2 डाकिया द्वारा निशुल्क घर बैठे टैबलेट से बाल आधार नामांकन।',
    ayushman_title: 'आयुष्मान भारत गोल्डन हेल्थ कार्ड (PM-JAY)',
    ayushman_desc: 'पात्र परिवारों के लिए प्रति वर्ष ₹5 लाख का कैशलेस अस्पताल उपचार कवर।',
    estamp_title: 'राजस्थान ई-ग्रास कानूनी स्टाम्प पेपर्स एवं ई-स्टाम्प',
    estamp_desc: 'शपथ पत्र, किरायानामा एवं वैधानिक कानूनी अनुबंध आधिकारिक सील सहित।',
    ssy_title: 'सुकन्या समृद्धि (8.2%) / वरिष्ठ नागरिक (SCSS) खाता बुकिंग',
    ssy_desc: 'घर बैठे खाता खोलने के फॉर्म का संकलन एवं सरकारी पासबुक डिलीवरी।',

    // Common
    apply_now: 'घर बैठे स्लॉट बुक करें',
    view_store: 'स्टोर कैटलॉग देखें',
    location_near_me: 'मेरे निकट',
    select_pincode: 'पिन कोड बदलें',
  },
  raj: {
    // Navigation
    nav_home: 'घर (होम)',
    nav_categories: 'सगळी किस्में',
    nav_post_office: 'डाकखाना दुकान',
    nav_top_sellers: 'चोखी बिकवाली',
    nav_citizen_desk: 'नागरिक सेवा अड्डा',
    nav_track_order: 'पार्सल देखो',
    nav_cart: 'थैली (कार्ट)',
    nav_book_visit: 'डाकिया ने बुलाओ',
    nav_menu: 'सगळी किस्में अर दुकानें',

    // Brand & Location
    brand_sub: 'आपणो सरकारी अर स्थानीय बाज़ार',
    pincode_label: 'दादाबाड़ी डाकघर पिन 324009',
    beat_info: '13 पिनकोड हब · तेज डाकिया सेवा',
    delivery_sla: '30-45 मिनट में घर पूगावा',
    flat_delivery_fee: '₹15 पक्का डाकिया खर्चा',
    partner_margin: 'सीधी दुकान बचत',

    // Search & Actions
    search_placeholder: 'सुकन्या, बीमा, स्पीड पोस्ट, डाकघर सेवा अर बल्क पार्सल ढूंढो...',
    add_to_cart: 'थैली में घालो · नकद द्यो',
    quick_inquiry: 'झटपट पूछो',
    whatsapp_desk: 'व्हाट्सएप ऑर्डर',
    whatsapp_beat2: 'व्हाट्सएप सहायता',
    partner_mode: 'सही भाव',

    // Hero & Live Desk
    hero_kicker: 'दादाबाड़ी खास दुकान · स्पीड पोस्ट नकद पर',
    live_desk_title: 'लाईव डेस्क: झटपट सस्ता सौदा अर सरकारी खबर',
    urgent_deal: 'झटपट सौदा',
    expires_in: 'इत्ती देर बाक़ी',
    claim_offer: 'सौदा पक्को करो',
    mrp_label: 'एमआरपी',
    offer_price: 'सौदा भाव',
    you_save: 'थारी बचत',

    // Sections
    sec_top_sellers: 'सबसूं घणी बिकने वाली बढ़िया चीजें',
    sec_top_sellers_sub: 'रोजमर्रा री चोखी चीजें जो सीधे घर पूगेगी',
    sec_trending_categories: 'सबसूं घणी पसन्द की किस्में',
    sec_trending_categories_sub: 'दादाबाड़ी 324009 रा सगळा प्रमाणित सामान',
    sec_service_ecosystems: 'मोहल्ले रा केंद्र अर दुकानां',
    sec_service_ecosystems_sub: 'दुकान रो पक्को पत्तो अर भाव देखने वास्ते क्लिक करो',
    sec_citizen_desk: 'कागज़-पत्तर अर सरकारी सेवा डेस्क',
    sec_citizen_desk_sub: 'पैन कार्ड, टाबर रो आधार, आयुष्मान कार्ड घर बैठे बणाओ',

    // Citizen services
    pan_title: 'नयो पैन कार्ड / नाम-पतो सुधराओ',
    pan_desc: 'घर बैठे अंगूठा लगायने पैन कार्ड चालू कराओ।',
    celc_title: 'छोटा टाबर रो आधार कार्ड (0–5 साल)',
    celc_desc: 'बीट 2 डाकिया खुद घर आयने मुफ्त में आधार कार्ड बनावेला।',
    ayushman_title: 'आयुष्मान भारत कार्ड (₹5 लाख ईलाज)',
    ayushman_desc: 'अस्पताल में 5 लाख तक रो मुफ्त इलाज कार्ड घर बैठे पाओ।',
    estamp_title: 'राजस्थान ई-ग्रास स्टाम्प पेपर',
    estamp_desc: 'किरायानामा, शपथ पत्र अर कोर्ट रा पक्का स्टाम्प।',
    ssy_title: 'सुकन्या समृद्धि (8.2%) खाता खोलाओ',
    ssy_desc: 'डाकिया घर आयने फॉर्म भरवावेला अर पासबुक देवेला।',

    // Common
    apply_now: 'डाकिया ने घरे बुलाओ',
    view_store: 'दुकान रो सामान देखो',
    location_near_me: 'म्हारो इलाको',
    select_pincode: 'पिन कोड बदलो',
  },
};

const STORAGE_KEY = 'indiapost_selected_lang';

export function getInitialLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = safeStorage.getItem(STORAGE_KEY) as SupportedLanguage;
    if (saved && (saved === 'en' || saved === 'hi' || saved === 'raj')) {
      return saved;
    }
    const navLang = (navigator.language || '').toLowerCase();
    if (navLang.startsWith('hi')) return 'hi';
  } catch {
    // fallback
  }
  return 'en';
}

export function setStoredLanguage(lang: SupportedLanguage) {
  if (typeof window === 'undefined') return;
  try {
    safeStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore
  }
}

export function translate(key: string, lang: SupportedLanguage = 'en', fallback?: string): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || fallback || key;
}
