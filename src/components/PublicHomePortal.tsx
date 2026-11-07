import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Award,
  CheckCircle2,
  ArrowRight,
  Phone,
  Search,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Share2,
  Copy,
  Check,
  Sparkles,
  FileText,
  Lock,
  Unlock,
  MapPin,
  HeartHandshake,
  Landmark,
  Smartphone,
  HelpCircle,
  X,
  ExternalLink,
  MessageCircle,
  UserCheck,
  Send,
  Globe,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { POSTAL_PRODUCTS } from '../data/productsData';
import { ProductDefinition } from '../types/models';
import { customerService } from '../services/customerService';
import heroPostalBanking from '../assets/images/hero_postal_banking_1791904267944.jpg';

interface PublicHomePortalProps {
  isStandalone?: boolean;
  onToggleStandalone?: () => void;
  onOpenStaffLogin?: () => void;
}

export type SchemePillar = 
  | 'ALL' 
  | 'SAVINGS_ACCOUNTS' 
  | 'RECURRING_DEPOSITS' 
  | 'PLI_SCHEMES' 
  | 'IPPB_LOAN_INSURANCE';

interface UnlockedVisitor {
  name: string;
  mobile: string;
  locality: string;
  beatNo: string;
  lastTicketNumber?: string;
}

const SESSION_UNLOCK_KEY = 'india_post_public_visitor_unlocked_v1';

const PAN_INDIA_CIRCLES: { label: string; regionCode: string }[] = [
  { label: 'All-India Citizen Inquiry (Any Post Office / PIN)', regionCode: 'Pan-India' },
  { label: 'North India Circle (Delhi, Rajasthan, UP, Punjab, Haryana)', regionCode: 'North Circle' },
  { label: 'West India Circle (Maharashtra, Gujarat, MP, Chhattisgarh)', regionCode: 'West Circle' },
  { label: 'South India Circle (Karnataka, Tamil Nadu, Telangana, AP, Kerala)', regionCode: 'South Circle' },
  { label: 'East & North-East Circle (West Bengal, Bihar, Odisha, Assam)', regionCode: 'East Circle' },
];

interface HeroSlide {
  id: string;
  productCode: string;
  kicker: string;
  headline: string;
  subtitle: string;
  rateHighlight: string;
  rateLabel: string;
  taxHighlight: string;
  maxLimit: string;
  pillarLabel: string;
  accentGradient: string;
  badgeText: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-ssa',
    productCode: 'SSA',
    kicker: 'Flagship Girl Child Scheme · 100% Government of India Sovereign Guarantee · Pan-India',
    headline: 'Sukanya Samriddhi Yojana (SSY): Build a Tax-Free Corpus for Your Daughter',
    subtitle:
      'Earn India’s highest small savings return at 8.2% p.a. with Triple Tax Exemption (EEE). Start with just ₹250 at any Post Office across India and secure her higher education and marriage milestones.',
    rateHighlight: '8.2% p.a.',
    rateLabel: 'Compounded Annually',
    taxHighlight: '100% Tax-Free (EEE · Sec 80C)',
    maxLimit: 'Up to ₹1.50 Lakh / Year',
    pillarLabel: 'Savings Accounts',
    accentGradient: 'from-rose-950 via-red-900 to-slate-950',
    badgeText: 'Girl Child Ages 0–10 Years · Pan-India Post Offices',
  },
  {
    id: 'slide-pli',
    productCode: 'PLI_SURAKSHA',
    kicker: 'Postal Life Insurance (PLI & RPLI) · Established 1884 · Sovereign Claim Guarantee',
    headline: 'PLI Suraksha & Santosh: Lowest Premiums with India’s Highest Bonus',
    subtitle:
      'Available for Central/State Government staff, PSU employees, teachers, doctors, engineers, professionals, and rural citizens (RPLI). Get up to ₹50 Lakh life cover with unmatched annual bonus accumulation.',
    rateHighlight: '₹76 / ₹1,000',
    rateLabel: 'Annual Bonus (Suraksha)',
    taxHighlight: 'Sec 80C & 10(10D) Tax-Free Maturity',
    maxLimit: 'Sum Assured up to ₹50 Lakh',
    pillarLabel: 'PLI Schemes',
    accentGradient: 'from-slate-950 via-indigo-950 to-slate-900',
    badgeText: 'Suraksha · Santosh · RPLI Gram Santosh',
  },
  {
    id: 'slide-scss',
    productCode: 'SCSS',
    kicker: 'Senior Citizen Retirement Security · Paid Every Quarter (Apr, Jul, Oct, Jan)',
    headline: 'Senior Citizen Savings Scheme (SCSS): Guaranteed 8.2% Quarterly Pension',
    subtitle:
      'Turn retirement savings into dependable quarterly cash flow deposited directly into your Post Office or IPPB Savings Account. Enhanced investment ceiling up to ₹30 Lakh per individual.',
    rateHighlight: '8.2% p.a.',
    rateLabel: 'Paid Every 3 Months',
    taxHighlight: 'Sec 80C Deduction up to ₹1.5L',
    maxLimit: 'Up to ₹30 Lakh (₹60L Couple)',
    pillarLabel: 'Savings Accounts',
    accentGradient: 'from-amber-950 via-red-950 to-slate-950',
    badgeText: 'Senior Citizens 60+ & Retirees 55+',
  },
  {
    id: 'slide-ippb',
    productCode: 'IPPB_BANKING',
    kicker: 'India Post Payments Bank · Aapka Bank, Aapke Dwaar · Pan-India Doorstep Network',
    headline: 'IPPB Digital Banking, Doorstep Cash & Child Aadhaar CELC at Home',
    subtitle:
      'Open an instant paperless IPPB account in 5 minutes, withdraw cash from any Aadhaar-linked bank account (AePS), submit Jeevan Pramaan DLC, or enrol children (0–5 yrs) for free Aadhaar at your doorstep.',
    rateHighlight: '₹0 Balance',
    rateLabel: 'Instant Biometric e-KYC',
    taxHighlight: 'Free Child Aadhaar (0–5 Yrs)',
    maxLimit: 'AePS Cash & DBT Enabled',
    pillarLabel: 'IPPB Loan & Insurance Services',
    accentGradient: 'from-emerald-950 via-teal-950 to-slate-950',
    badgeText: 'Pan-India Doorstep Postman & Gramin Dak Sevak Service',
  },
];

function getProductPillar(product: ProductDefinition): SchemePillar {
  const code = product.code;
  if (code.includes('PLI') || code.includes('RPLI')) {
    return 'PLI_SCHEMES';
  }
  if (code === 'RD' || code === 'TD' || code === 'NSC' || code === 'KVP') {
    return 'RECURRING_DEPOSITS';
  }
  if (
    code.includes('IPPB') ||
    code.includes('CELC') ||
    code.includes('LOAN') ||
    code.includes('GPA') ||
    product.category?.includes('IPPB') ||
    product.category?.includes('Aadhaar') ||
    product.category?.includes('Loan')
  ) {
    return 'IPPB_LOAN_INSURANCE';
  }
  return 'SAVINGS_ACCOUNTS';
}

function getPillarDisplayLabel(pillar: SchemePillar): string {
  switch (pillar) {
    case 'SAVINGS_ACCOUNTS':
      return 'Savings Accounts';
    case 'RECURRING_DEPOSITS':
      return 'Recurring & Term Deposits';
    case 'PLI_SCHEMES':
      return 'PLI Schemes';
    case 'IPPB_LOAN_INSURANCE':
      return 'IPPB Loan & Insurance Services';
    default:
      return 'All Financial Products';
  }
}

export default function PublicHomePortal({
  isStandalone = false,
  onToggleStandalone,
  onOpenStaffLogin,
}: PublicHomePortalProps) {
  // Hero Auto-Slider State
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  // Filter & Search State
  const [selectedPillar, setSelectedPillar] = useState<SchemePillar>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Visitor Lead Capture & Unlock State
  const [unlockedVisitor, setUnlockedVisitor] = useState<UnlockedVisitor | null>(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_UNLOCK_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Modals State
  const [leadGateTargetProduct, setLeadGateTargetProduct] = useState<ProductDefinition | null>(null);
  const [leadGateMode, setLeadGateMode] = useState<'KNOW_MORE' | 'QUICK_INQUIRY'>('KNOW_MORE');
  const [activeDetailProduct, setActiveDetailProduct] = useState<ProductDefinition | null>(null);
  const [shareModalProduct, setShareModalProduct] = useState<ProductDefinition | null>(null);

  // Lead Gate Form Inputs
  const [visitorName, setVisitorName] = useState(unlockedVisitor?.name || '');
  const [visitorMobile, setVisitorMobile] = useState(unlockedVisitor?.mobile || '');
  const [visitorLocality, setVisitorLocality] = useState(
    unlockedVisitor?.locality || PAN_INDIA_CIRCLES[0].label
  );
  const [preferredContact, setPreferredContact] = useState<'WhatsApp' | 'Phone Call' | 'Doorstep Visit'>('WhatsApp');
  const [inquiryNote, setInquiryNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Interactive Calculator inside Detail Modal
  const [calcMonthlyOrLump, setCalcMonthlyOrLump] = useState<number>(50000);

  // Share Feedback Toast
  const [copiedProductCode, setCopiedProductCode] = useState<string | null>(null);
  const [leadBannerMessage, setLeadBannerMessage] = useState<string | null>(null);

  // Auto-advance Hero Banner every 5 seconds unless paused
  useEffect(() => {
    if (isHeroPaused) return;
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHeroPaused]);

  const currentHeroSlide = HERO_SLIDES[activeSlideIndex];

  // Filter products by Pillar & Search query
  const filteredProducts = useMemo(() => {
    return POSTAL_PRODUCTS.filter((prod) => {
      const pillar = getProductPillar(prod);
      const matchesPillar = selectedPillar === 'ALL' || pillar === selectedPillar;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.code.toLowerCase().includes(q) ||
        prod.tagline.toLowerCase().includes(q) ||
        prod.interestRateOrBonus.toLowerCase().includes(q) ||
        prod.description.toLowerCase().includes(q);
      return matchesPillar && matchesSearch;
    });
  }, [selectedPillar, searchQuery]);

  // Counts per category
  const counts = useMemo(() => {
    const all = POSTAL_PRODUCTS.length;
    const savings = POSTAL_PRODUCTS.filter((p) => getProductPillar(p) === 'SAVINGS_ACCOUNTS').length;
    const recurring = POSTAL_PRODUCTS.filter((p) => getProductPillar(p) === 'RECURRING_DEPOSITS').length;
    const pli = POSTAL_PRODUCTS.filter((p) => getProductPillar(p) === 'PLI_SCHEMES').length;
    const ippb = POSTAL_PRODUCTS.filter((p) => getProductPillar(p) === 'IPPB_LOAN_INSURANCE').length;
    return { all, savings, recurring, pli, ippb };
  }, []);

  // Build viral WhatsApp & social media share message for any scheme
  const buildShareMessage = (product: ProductDefinition): string => {
    const portalUrl = typeof window !== 'undefined' ? window.location.origin : 'https://indiapost.gov.in';
    return (
      `📮 *India Post & IPPB — Pan-India Banking & Financial Services*\n` +
      `✨ *${product.name} (${product.code})*\n\n` +
      `📈 *Official Interest / Bonus:* ${product.interestRateOrBonus}\n` +
      `🛡️ *Income Tax Benefit:* ${product.taxBenefits}\n` +
      `💰 *Investment Limit:* ${product.minInvestment}\n` +
      `⏳ *Tenure / Maturity:* ${product.tenure}\n\n` +
      `✅ 100% Government of India Sovereign Guarantee & Doorstep Postman / IPPB Assistance available across India!\n` +
      `👉 Check full scheme benefits & calculate returns: ${portalUrl}/?scheme=${product.code}`
    );
  };

  const getShareUrls = (product: ProductDefinition) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://indiapost.gov.in';
    const schemeUrl = `${origin}/?scheme=${product.code}`;
    const text = buildShareMessage(product);
    const shortHeadline = `India Post: ${product.name} with ${product.interestRateOrBonus} & 100% Sovereign Guarantee!`;

    return {
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(schemeUrl)}&text=${encodeURIComponent(shortHeadline)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(schemeUrl)}&quote=${encodeURIComponent(shortHeadline)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shortHeadline)}&url=${encodeURIComponent(schemeUrl)}`,
      schemeUrl,
      text,
    };
  };

  const getWhatsAppUrl = (product: ProductDefinition): string => {
    return getShareUrls(product).whatsapp;
  };

  const handleCopyOrNativeShare = async (product: ProductDefinition) => {
    const shareText = buildShareMessage(product);
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: `${product.name} — India Post & IPPB Schemes Portal`,
          text: shareText,
          url: `${window.location.origin}/?scheme=${product.code}`,
        });
        return;
      }
    } catch {
      // Fallback to clipboard copy if user cancels or share fails
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedProductCode(product.code);
      setTimeout(() => setCopiedProductCode(null), 2500);
    } catch {
      setCopiedProductCode(product.code);
      setTimeout(() => setCopiedProductCode(null), 2500);
    }
  };

  // Triggered when user clicks "Know More" or "Quick Inquiry" on a product card or Hero slide
  const handleProductAction = (product: ProductDefinition, mode: 'KNOW_MORE' | 'QUICK_INQUIRY') => {
    setFormError(null);
    // Always prompt for Name & Mobile first if visitor hasn't unlocked yet, OR if they explicitly click "Quick Inquiry"
    if (!unlockedVisitor || mode === 'QUICK_INQUIRY') {
      if (unlockedVisitor) {
        setVisitorName(unlockedVisitor.name);
        setVisitorMobile(unlockedVisitor.mobile);
        setVisitorLocality(unlockedVisitor.locality);
      }
      setLeadGateTargetProduct(product);
      setLeadGateMode(mode);
      return;
    }

    // If visitor already entered Name & Mobile in this session and clicked "Know More", log their interest and show full details immediately
    const { inquiry } = customerService.submitCustomerInquiry({
      customerName: unlockedVisitor.name,
      mobile: unlockedVisitor.mobile,
      productInterested: product.name,
      requirement: `Viewed full scheme details & tax calculator for ${product.name}`,
      preferredContact: 'WhatsApp',
      address: unlockedVisitor.locality,
      beatNo: unlockedVisitor.beatNo,
    });

    const updatedVisitor: UnlockedVisitor = {
      ...unlockedVisitor,
      lastTicketNumber: inquiry.ticketNumber,
    };
    setUnlockedVisitor(updatedVisitor);
    try {
      sessionStorage.setItem(SESSION_UNLOCK_KEY, JSON.stringify(updatedVisitor));
    } catch {
      // ignore storage errors
    }
    setActiveDetailProduct(product);
  };

  // Handle Lead Capture Gate Form Submission
  const handleLeadGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = visitorName.trim();
    const digitsOnlyMobile = visitorMobile.replace(/\D/g, '').slice(-10);

    if (trimmedName.length < 2) {
      setFormError('Please enter your full name (minimum 2 characters).');
      return;
    }
    if (digitsOnlyMobile.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const targetProduct = leadGateTargetProduct || POSTAL_PRODUCTS[0];
    const matchedCircle =
      PAN_INDIA_CIRCLES.find((l) => l.label === visitorLocality) || PAN_INDIA_CIRCLES[0];

    const { inquiry } = customerService.submitCustomerInquiry({
      customerName: trimmedName,
      mobile: digitsOnlyMobile,
      productInterested: targetProduct.name,
      requirement:
        inquiryNote.trim() ||
        (leadGateMode === 'KNOW_MORE'
          ? `Unlocked full scheme details & rate sheet for ${targetProduct.name}`
          : `Requested ${preferredContact} consultation for ${targetProduct.name}`),
      preferredContact,
      address: visitorLocality || 'Pan-India Online Portal Inquiry',
      beatNo: 'Beat 1',
    });

    const visitorRecord: UnlockedVisitor = {
      name: trimmedName,
      mobile: digitsOnlyMobile,
      locality: visitorLocality || matchedCircle.label,
      beatNo: 'Beat 1',
      lastTicketNumber: inquiry.ticketNumber,
    };

    setUnlockedVisitor(visitorRecord);
    try {
      sessionStorage.setItem(SESSION_UNLOCK_KEY, JSON.stringify(visitorRecord));
    } catch {
      // ignore
    }

    setLeadBannerMessage(
      `Welcome ${trimmedName}! Reference #${inquiry.ticketNumber} registered for ${targetProduct.name}. Full scheme benefits unlocked.`
    );
    setLeadGateTargetProduct(null);
    setInquiryNote('');

    // Immediately open the full product details, interest rates, and tax benefits modal!
    setActiveDetailProduct(targetProduct);
  };

  // Interactive Return Estimator helper for the active detail modal
  const computeEstimatedProjection = (product: ProductDefinition, amount: number) => {
    const code = product.code;
    if (code === 'SSA') {
      // 15 years annual deposit compounded at 8.2% for 21 years (~4.6x of annual deposit * 15)
      const totalInvested = amount * 15;
      const estimatedMaturity = Math.round(amount * 46.18);
      return {
        inputLabel: 'Annual Deposit (for 15 Yrs)',
        totalInvested,
        estimatedReturn: estimatedMaturity,
        returnLabel: 'Tax-Free Maturity at Year 21 (8.2% p.a.)',
      };
    }
    if (code === 'SCSS') {
      const quarterlyPension = Math.round((amount * 0.082) / 4);
      const fiveYearInterest = quarterlyPension * 20;
      return {
        inputLabel: 'One-Time Retirement Deposit',
        totalInvested: amount,
        estimatedReturn: amount + fiveYearInterest,
        returnLabel: `₹${quarterlyPension.toLocaleString('en-IN')} Quarterly Payout (5-Yr Total)`,
      };
    }
    if (code === 'MIS') {
      const monthlyIncome = Math.round((amount * 0.074) / 12);
      return {
        inputLabel: 'One-Time Lump Sum Deposit',
        totalInvested: amount,
        estimatedReturn: amount + monthlyIncome * 60,
        returnLabel: `₹${monthlyIncome.toLocaleString('en-IN')} Guaranteed Monthly Income`,
      };
    }
    if (code === 'PPF') {
      const totalInvested = amount * 15;
      const estimatedMaturity = Math.round(amount * 27.12);
      return {
        inputLabel: 'Annual PPF Deposit (15 Yrs)',
        totalInvested,
        estimatedReturn: estimatedMaturity,
        returnLabel: 'Tax-Free Corpus after 15 Years (7.1% p.a.)',
      };
    }
    if (code === 'NSC') {
      const maturity = Math.round(amount * 1.449);
      return {
        inputLabel: 'Single Investment Amount',
        totalInvested: amount,
        estimatedReturn: maturity,
        returnLabel: '5-Year Guaranteed Maturity (7.7% p.a.)',
      };
    }
    if (code === 'KVP') {
      return {
        inputLabel: 'Single KVP Deposit',
        totalInvested: amount,
        estimatedReturn: amount * 2,
        returnLabel: 'Guaranteed Double in 115 Months (7.5% p.a.)',
      };
    }
    if (code.includes('PLI')) {
      const bonusRate = code === 'PLI_SURAKSHA' ? 76 : code === 'PLI_SANTOSH' ? 52 : 60;
      const annualBonus = Math.round((amount / 1000) * bonusRate);
      const twentyYearMaturity = amount + annualBonus * 20;
      return {
        inputLabel: 'Chosen Policy Sum Assured',
        totalInvested: amount,
        estimatedReturn: twentyYearMaturity,
        returnLabel: `Est. Sum Assured + 20-Yr Bonus (₹${annualBonus.toLocaleString('en-IN')}/yr)`,
      };
    }
    // Default 5-year compounding estimate
    return {
      inputLabel: 'Deposit Amount',
      totalInvested: amount,
      estimatedReturn: Math.round(amount * 1.435),
      returnLabel: 'Estimated 5-Year Sovereign Value',
    };
  };

  return (
    <div className="space-y-8 pb-12" id="public-home-portal">
      {/* Top Public Portal Trust Strip (100% Pan-India · Zero Administrative Clutter) */}
      <div className="bg-white border border-slate-200 rounded-2xl px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-700 text-white flex items-center justify-center font-black text-lg shrink-0">
            📮
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>भारतीय डाक · Department of Posts, Ministry of Communications, Govt. of India</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono font-semibold text-red-700">Pan-India Citizen Portal</span>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              India Post & IPPB Financial Services — National Savings, PLI/RPLI & Doorstep Banking Hub
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/dashboard"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-2xs"
            id="go-to-staff-crm-link"
          >
            <Shield size={13} className="text-amber-400" />
            <span>Staff CRM Portal & Login</span>
            <ArrowRight size={13} />
          </Link>

          {onOpenStaffLogin && (
            <button
              type="button"
              onClick={onOpenStaffLogin}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              id="public-portal-staff-login-btn"
            >
              <Lock size={13} className="text-red-700" />
              <span>Staff Login</span>
            </button>
          )}

          {unlockedVisitor ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
              <Unlock size={14} className="text-emerald-600 shrink-0" />
              <span>
                Unlocked for <strong>{unlockedVisitor.name}</strong> ({unlockedVisitor.mobile})
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleProductAction(POSTAL_PRODUCTS[0], 'QUICK_INQUIRY')}
              className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              id="top-quick-inquiry-btn"
            >
              <Phone size={14} />
              <span>Book Doorstep Postman Visit</span>
            </button>
          )}

          {onToggleStandalone && (
            <button
              type="button"
              onClick={onToggleStandalone}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0"
              id="toggle-standalone-portal-btn"
            >
              {isStandalone ? 'Exit Full-Screen' : 'Full-Screen View'}
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Notice if visitor just unlocked a lead */}
      {leadBannerMessage && (
        <div className="bg-emerald-950 text-white rounded-2xl px-5 py-3.5 border border-emerald-700 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>{leadBannerMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setLeadBannerMessage(null)}
            className="text-emerald-300 hover:text-white text-xs font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. LANDSCAPE HERO SECTION: HIGH-CONVERSION BANKING & SAVINGS SCHEMES */}
      <section
        className="relative overflow-hidden rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl transition-colors duration-500"
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
        id="hero-auto-slider"
      >
        {/* Landscape Photographic Visual Background with Cinematic Vignette Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={heroPostalBanking}
            alt="India Post Banking Services & Sovereign Savings Desk"
            className="w-full h-full object-cover object-center opacity-35 scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/65" />
          <div className="absolute inset-0 bg-radial-[at_top_right] from-red-600/20 via-transparent to-black/70" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          {/* Top Kicker & Slide Counter */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold tracking-wide">
              <Award size={15} className="shrink-0 text-amber-400" />
              <span>{currentHeroSlide.kicker}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300 tabular-nums">
              <span className="font-medium text-amber-300/90">{currentHeroSlide.pillarLabel}</span>
              <span aria-hidden="true" className="text-white/30">·</span>
              <span>
                Slide 0{activeSlideIndex + 1} / 0{HERO_SLIDES.length}
              </span>
            </div>
          </div>

          {/* Main 2-Column Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-6">
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-xs font-semibold text-amber-300">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>{currentHeroSlide.badgeText}</span>
                </div>
                <h2
                  className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight"
                  style={{ textWrap: 'balance' }}
                >
                  {currentHeroSlide.headline}
                </h2>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
                  {currentHeroSlide.subtitle}
                </p>
              </div>

              {/* Landscape Hero Action Buttons with High-Conversion CTA & Viral Share */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const prod =
                      POSTAL_PRODUCTS.find((p) => p.code === currentHeroSlide.productCode) ||
                      POSTAL_PRODUCTS[0];
                    handleProductAction(prod, 'KNOW_MORE');
                  }}
                  className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-2 shadow-lg cursor-pointer whitespace-nowrap shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                  id="hero-know-more-btn"
                >
                  <span>Know More & Tax Benefits</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const prod =
                      POSTAL_PRODUCTS.find((p) => p.code === currentHeroSlide.productCode) ||
                      POSTAL_PRODUCTS[0];
                    handleProductAction(prod, 'QUICK_INQUIRY');
                  }}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                  id="hero-quick-inquiry-btn"
                >
                  <Phone size={15} className="text-amber-300" />
                  <span>Book Doorstep Visit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const prod =
                      POSTAL_PRODUCTS.find((p) => p.code === currentHeroSlide.productCode) ||
                      POSTAL_PRODUCTS[0];
                    setShareModalProduct(prod);
                  }}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 shadow-md cursor-pointer"
                  id="hero-multi-share-btn"
                >
                  <Share2 size={15} />
                  <span>Share Scheme Flyer</span>
                </button>
              </div>
            </div>

            {/* Right Column: Quantified Scheme Highlights Card */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-black/45 backdrop-blur-md border border-white/15 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="text-xs text-slate-300 font-medium">Official Government Rate / Bonus</div>
                  <div className="text-3xl sm:text-4xl font-black text-amber-400 tabular-nums mt-1">
                    {currentHeroSlide.rateHighlight}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">{currentHeroSlide.rateLabel}</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shrink-0">
                  <Shield size={24} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-slate-400">Tax Exemption Status</div>
                  <div className="font-bold text-white mt-1">{currentHeroSlide.taxHighlight}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-slate-400">Investment Limit</div>
                  <div className="font-bold text-white tabular-nums mt-1">{currentHeroSlide.maxLimit}</div>
                </div>
              </div>

              <div className="text-xs text-slate-300 flex items-center justify-between pt-1">
                <span>100% Sovereign Guarantee · Zero Risk</span>
                <span className="font-mono text-amber-300 font-semibold">1.65L+ Post Offices</span>
              </div>
            </div>
          </div>

          {/* Bottom Slider Controls & Direct Scheme Selector Tabs */}
          <div className="mt-8 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                    idx === activeSlideIndex
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  0{idx + 1}. {slide.productCode === 'SSA' ? 'Sukanya (8.2%)' : slide.productCode === 'PLI_SURAKSHA' ? 'PLI Suraksha' : slide.productCode === 'SCSS' ? 'Senior Citizen (8.2%)' : 'IPPB Doorstep'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setActiveSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
                }
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition cursor-pointer"
                aria-label="Previous Flagship Scheme"
                id="hero-prev-slide-btn"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => setActiveSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition cursor-pointer"
                aria-label="Next Flagship Scheme"
                id="hero-next-slide-btn"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY FILTER BAR & SEARCH */}
      <section className="space-y-6" id="schemes-catalog-section">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
          {/* Interactive Segmented Category Filter Controls: Savings, Recurring, PLI, IPPB Loans */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedPillar('ALL')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                selectedPillar === 'ALL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="filter-pillar-all"
            >
              All Financial Products ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setSelectedPillar('SAVINGS_ACCOUNTS')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                selectedPillar === 'SAVINGS_ACCOUNTS'
                  ? 'bg-red-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="filter-pillar-savings"
            >
              01. Savings Accounts ({counts.savings})
            </button>
            <button
              type="button"
              onClick={() => setSelectedPillar('RECURRING_DEPOSITS')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                selectedPillar === 'RECURRING_DEPOSITS'
                  ? 'bg-red-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="filter-pillar-recurring"
            >
              02. Recurring Deposits ({counts.recurring})
            </button>
            <button
              type="button"
              onClick={() => setSelectedPillar('PLI_SCHEMES')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                selectedPillar === 'PLI_SCHEMES'
                  ? 'bg-red-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="filter-pillar-pli"
            >
              03. PLI Schemes ({counts.pli})
            </button>
            <button
              type="button"
              onClick={() => setSelectedPillar('IPPB_LOAN_INSURANCE')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                selectedPillar === 'IPPB_LOAN_INSURANCE'
                  ? 'bg-red-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="filter-pillar-ippb"
            >
              04. IPPB Loan & Insurance ({counts.ippb})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px] sm:min-w-[320px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SSY, SCSS, PLI, PPF, MIS, NSC, Loans..."
              className="w-full pl-9 pr-16 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
              id="public-scheme-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Smart Lead Funnel Notice Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            {unlockedVisitor ? (
              <>
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>
                  Full scheme calculators, interest rate tables & tax benefits are unlocked for{' '}
                  <strong className="text-slate-900">{unlockedVisitor.name}</strong>.
                </span>
              </>
            ) : (
              <>
                <Lock size={14} className="text-amber-600 shrink-0" />
                <span>
                  Click <strong className="text-slate-900">Know More</strong> on any product card to open the lead capture form and unlock complete interest rates, tax benefits, and calculators.
                </span>
              </>
            )}
          </div>
          <div className="text-slate-500 tabular-nums">
            Showing {filteredProducts.length} of {POSTAL_PRODUCTS.length} Official Schemes
          </div>
        </div>

        {/* 3. HIGH-END VISUAL CARD-VIEW GRID: 4 CORE FINANCIAL CATEGORIES */}
        <div className="space-y-10">
          {([
            {
              pillarKey: 'SAVINGS_ACCOUNTS' as SchemePillar,
              badge: 'CATEGORY 01 · SOVEREIGN SAVINGS ACCOUNTS & SCHEMES',
              title: 'Savings Accounts & Small Savings (SSY, SCSS, PPF, MIS)',
              subtitle:
                '100% Government of India guaranteed deposits offering up to 8.2% p.a. returns with Triple Tax Exemption (EEE) under Section 80C.',
              accentBorder: 'border-red-200 bg-red-50/50',
              accentText: 'text-red-950',
            },
            {
              pillarKey: 'RECURRING_DEPOSITS' as SchemePillar,
              badge: 'CATEGORY 02 · RECURRING DEPOSITS & TERM CERTIFICATES',
              title: 'Recurring Deposits & Term Fixed Deposits (5-Yr RD, TD, NSC, KVP)',
              subtitle:
                'Systematic monthly compounding, bank loan collateral eligibility, and guaranteed doubling certificates backed by sovereign security.',
              accentBorder: 'border-amber-200 bg-amber-50/50',
              accentText: 'text-amber-950',
            },
            {
              pillarKey: 'PLI_SCHEMES' as SchemePillar,
              badge: 'CATEGORY 03 · POSTAL LIFE INSURANCE (PLI / RPLI)',
              title: 'PLI Schemes: Whole Life & Endowment Assurance (Suraksha, Santosh & Gram Santosh)',
              subtitle:
                'India’s oldest sovereign-backed life protection (Est. 1884) offering the lowest premiums and highest annual bonuses up to ₹76/₹1,000.',
              accentBorder: 'border-indigo-200 bg-indigo-50/50',
              accentText: 'text-indigo-950',
            },
            {
              pillarKey: 'IPPB_LOAN_INSURANCE' as SchemePillar,
              badge: 'CATEGORY 04 · IPPB LOAN & INSURANCE SERVICES',
              title: 'IPPB Loan & Insurance Services (GPA ₹10L Cover, Doorstep Loans & Digital Banking)',
              subtitle:
                '₹10 Lakh accidental insurance at ₹399/yr, doorstep loan assistance, instant biometric zero-balance accounts, AePS cash delivery, and free Child Aadhaar CELC.',
              accentBorder: 'border-emerald-200 bg-emerald-50/50',
              accentText: 'text-emerald-950',
            },
          ] as const)
            .filter((group) => selectedPillar === 'ALL' || selectedPillar === group.pillarKey)
            .map((group) => {
              const categoryProducts = filteredProducts.filter(
                (p) => getProductPillar(p) === group.pillarKey
              );
              if (categoryProducts.length === 0) return null;

              return (
                <div key={group.pillarKey} className="space-y-4">
                  {/* Visual Category Header Strip */}
                  <div
                    className={`rounded-2xl border ${group.accentBorder} px-5 py-4 flex flex-wrap items-center justify-between gap-3`}
                  >
                    <div>
                      <div className="text-[11px] font-black tracking-wider uppercase text-red-700">
                        {group.badge}
                      </div>
                      <h2 className={`text-base sm:text-lg font-black ${group.accentText} mt-0.5`}>
                        {group.title}
                      </h2>
                      <p className="text-xs text-slate-600 mt-0.5">{group.subtitle}</p>
                    </div>
                    <div className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shrink-0 tabular-nums">
                      {categoryProducts.length} {categoryProducts.length === 1 ? 'Scheme' : 'Schemes'}
                    </div>
                  </div>

                  {/* Category Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryProducts.map((product) => {
                      const pillar = getProductPillar(product);
                      const isCopied = copiedProductCode === product.code;

                      return (
                        <article
                          key={product.id}
                          className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition flex flex-col justify-between overflow-hidden shadow-2xs"
                        >
                          {/* Top Visual Header Banner */}
                          <div>
                            <div
                              className={`p-5 border-b border-slate-100 ${
                                pillar === 'PLI_SCHEMES'
                                  ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white'
                                  : pillar === 'IPPB_LOAN_INSURANCE'
                                  ? 'bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 text-white'
                                  : pillar === 'RECURRING_DEPOSITS'
                                  ? 'bg-gradient-to-br from-amber-950 via-orange-950 to-slate-950 text-white'
                                  : 'bg-gradient-to-br from-red-950 via-red-900 to-slate-950 text-white'
                              }`}
                            >
                              {/* Metadata Strip */}
                              <div className="flex items-center justify-between gap-2 text-[11px] text-amber-300/90 font-medium">
                                <span>
                                  {getPillarDisplayLabel(pillar)} · {product.code}
                                </span>
                                <span className="font-mono text-white/80">Govt Guarantee</span>
                              </div>

                              <h3 className="text-base sm:text-lg font-extrabold text-white mt-2 leading-snug">
                                {product.name}
                              </h3>

                              <div className="mt-3 pt-3 border-t border-white/10 flex items-baseline justify-between gap-2">
                                <div>
                                  <div className="text-[11px] text-slate-300">Interest Rate / Bonus</div>
                                  <div className="text-sm sm:text-base font-black text-amber-300 tabular-nums mt-0.5">
                                    {product.interestRateOrBonus}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 space-y-4">
                              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                                {product.description}
                              </p>

                              {/* Key Specs Preview */}
                              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                                <div className="flex items-start justify-between gap-3">
                                  <span className="text-slate-500 shrink-0">Min / Max Limit:</span>
                                  <span className="font-semibold text-slate-900 text-right tabular-nums">
                                    {product.minInvestment}
                                  </span>
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                  <span className="text-slate-500 shrink-0">Tenure / Maturity:</span>
                                  <span className="font-semibold text-slate-900 text-right">{product.tenure}</span>
                                </div>
                                <div className="flex items-start justify-between gap-3">
                                  <span className="text-slate-500 shrink-0">Tax Benefit:</span>
                                  <span className="font-semibold text-emerald-700 text-right">
                                    {unlockedVisitor
                                      ? product.taxBenefits
                                      : 'Sec 80C / Tax-Free Rules (Click Know More)'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Card Footer: Know More Button, Quick Inquiry & Viral Social Share */}
                          <div className="px-5 pb-5 pt-3 border-t border-slate-100 space-y-2.5 bg-slate-50/50">
                            <div className="grid grid-cols-2 gap-2">
                              {/* Know More Button: Opens Lead Capture / Inquiry Funnel Form Pre-filled with Scheme */}
                              <button
                                type="button"
                                onClick={() => handleProductAction(product, 'KNOW_MORE')}
                                className="px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                              >
                                {unlockedVisitor ? (
                                  <Unlock size={13} className="text-emerald-400" />
                                ) : (
                                  <Lock size={13} className="text-amber-400" />
                                )}
                                <span>Know More</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleProductAction(product, 'QUICK_INQUIRY')}
                                className="px-3 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <Phone size={13} />
                                <span>Quick Inquiry</span>
                              </button>
                            </div>

                            {/* Interactive Share Strip: WhatsApp direct + Multi-Platform Social Share Modal */}
                            <div className="flex items-center gap-2">
                              <a
                                href={getWhatsAppUrl(product)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                                title="Share formatted scheme details on WhatsApp"
                              >
                                <MessageCircle size={13} className="text-emerald-600 shrink-0" />
                                <span>Share on WhatsApp</span>
                              </a>

                              {/* Multi-Platform Social Share Button (WhatsApp, Telegram, Facebook, X, Native) */}
                              <button
                                type="button"
                                onClick={() => setShareModalProduct(product)}
                                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                                title="Share across WhatsApp, Telegram, Facebook, X & Device Share"
                              >
                                <Share2 size={13} />
                                <span>Share</span>
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* 4. CITIZEN PROOF & PAN-INDIA DOORSTEP ASSISTANCE SECTION */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="text-xs font-semibold text-red-700">
              All-India Postal Network · India Post & IPPB Doorstep Banking
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              How Pan-India Doorstep Postal Banking & Scheme Enrollment Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every urban and rural pin code across India is served by a dedicated Postman or Gramin Dak Sevak equipped with a smartphone and biometric micro-ATM for paperless doorstep banking and scheme guidance.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-900">01. Enter Name & Mobile</div>
                <p className="text-xs text-slate-600 mt-1">
                  Click &ldquo;Know More&rdquo; or &ldquo;Quick Inquiry&rdquo; on any scheme card to unlock full returns and log your inquiry.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-900">02. Instant Callback & Guidance</div>
                <p className="text-xs text-slate-600 mt-1">
                  Our postal financial advisor connects with you to schedule a convenient doorstep or nearest Post Office visit.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-900">03. Instant Passbook / Policy</div>
                <p className="text-xs text-slate-600 mt-1">
                  Complete simple Aadhaar e-KYC and receive your sovereign-guaranteed passbook or PLI/RPLI bond.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 space-y-4">
            <div className="text-xs font-semibold text-amber-400">
              Official Sovereign Financial Highlights · India Post
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl font-black text-white tabular-nums">8.2% p.a.</div>
                <div className="text-xs text-slate-300 mt-0.5">Peak Tax-Free Rate (SSY & SCSS)</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl font-black text-amber-400 tabular-nums">₹76 / 1K</div>
                <div className="text-xs text-slate-300 mt-0.5">Highest PLI Annual Bonus</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl font-black text-emerald-400 tabular-nums">1.65 Lakh+</div>
                <div className="text-xs text-slate-300 mt-0.5">Post Offices Across India</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl font-black text-white tabular-nums">100%</div>
                <div className="text-xs text-slate-300 mt-0.5">Govt of India Sovereign Safety</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SMART LEAD CAPTURE GATE MODAL (Prompts Name & Mobile BEFORE showing full details) */}
      {leadGateTargetProduct && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-gradient-to-r from-red-900 via-red-800 to-slate-950 text-white flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-amber-300">
                  {leadGateMode === 'KNOW_MORE'
                    ? 'Step 1 of 2 · Unlock Full Scheme Details & Calculator'
                    : 'Instant Doorstep Inquiry & Callback Request'}
                </div>
                <h3 className="text-lg font-black text-white mt-1 leading-snug">
                  {leadGateTargetProduct.name}
                </h3>
                <p className="text-xs text-slate-200 mt-1">
                  Enter your Name and Mobile Number below to view complete interest rates, tax benefits, eligibility, and maturity returns.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLeadGateTargetProduct(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLeadGateSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Your Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  id="lead-gate-name-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  10-Digit Mobile / WhatsApp Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={visitorMobile}
                  onChange={(e) => setVisitorMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="e.g. 9829012345"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  id="lead-gate-mobile-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Select Postal Circle / Region (Pan-India)
                  </label>
                  <select
                    value={visitorLocality}
                    onChange={(e) => setVisitorLocality(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    id="lead-gate-locality-select"
                  >
                    {PAN_INDIA_CIRCLES.map((loc) => (
                      <option key={loc.label} value={loc.label}>
                        {loc.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Preferred Assistance Mode
                  </label>
                  <select
                    value={preferredContact}
                    onChange={(e) =>
                      setPreferredContact(e.target.value as 'WhatsApp' | 'Phone Call' | 'Doorstep Visit')
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    id="lead-gate-contact-mode"
                  >
                    <option value="WhatsApp">WhatsApp Brochure & Rates</option>
                    <option value="Doorstep Visit">Doorstep Postman Visit</option>
                    <option value="Phone Call">Phone Callback</option>
                  </select>
                </div>
              </div>

              {leadGateMode === 'QUICK_INQUIRY' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Specific Question or Requirement (Optional)
                  </label>
                  <input
                    type="text"
                    value={inquiryNote}
                    onChange={(e) => setInquiryNote(e.target.value)}
                    placeholder="e.g. Want to open account for 5-year-old daughter..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setLeadGateTargetProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-black transition flex items-center gap-2 shadow-md cursor-pointer"
                  id="lead-gate-submit-btn"
                >
                  <span>Unlock Full Scheme Details</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UNLOCKED FULL PRODUCT DETAILS, INTEREST RATES, TAX BENEFITS & VIRAL SHARE MODAL */}
      {activeDetailProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-950 via-red-950 to-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>
                    Full Scheme Details Unlocked
                    {unlockedVisitor?.lastTicketNumber
                      ? ` · Inquiry Ref #${unlockedVisitor.lastTicketNumber}`
                      : ''}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {activeDetailProduct.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">{activeDetailProduct.tagline}</p>
              </div>

              <button
                type="button"
                onClick={() => setActiveDetailProduct(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Top Viral Share & Quick Action Bar */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-emerald-950">
                    Share This Scheme with Family & Friends on WhatsApp
                  </div>
                  <div className="text-xs text-emerald-800">
                    Pre-formatted with official interest rates, Sec 80C / EEE tax benefits, and Pan-India portal link.
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={getWhatsAppUrl(activeDetailProduct)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs whitespace-nowrap shrink-0"
                    id="detail-modal-whatsapp-share"
                  >
                    <MessageCircle size={15} />
                    <span>Share on WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyOrNativeShare(activeDetailProduct)}
                    className="px-3.5 py-2.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {copiedProductCode === activeDetailProduct.code ? (
                      <>
                        <Check size={14} className="text-emerald-600" />
                        <span>Copied Share Message!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Share Post</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Core Rate, Tax Benefits, Minimum Investment & Tenure Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <div className="text-xs text-amber-900 font-semibold">Interest Rate / Bonus</div>
                  <div className="text-lg font-black text-red-800 tabular-nums mt-1">
                    {activeDetailProduct.interestRateOrBonus}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <div className="text-xs text-emerald-900 font-semibold">Income Tax Benefits</div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-950 mt-1">
                    {activeDetailProduct.taxBenefits}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-semibold">Investment Range</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums mt-1">
                    {activeDetailProduct.minInvestment}
                    {activeDetailProduct.maxInvestment ? ` • Max: ${activeDetailProduct.maxInvestment}` : ''}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-semibold">Tenure & Lock-in</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                    {activeDetailProduct.tenure}
                  </div>
                </div>
              </div>

              {/* Interactive Sovereign Return Estimator */}
              {(() => {
                const proj = computeEstimatedProjection(activeDetailProduct, calcMonthlyOrLump);
                return (
                  <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Calculator size={18} className="text-amber-400" />
                        <h4 className="text-sm font-black">
                          Interactive Return & Maturity Estimator ({activeDetailProduct.code})
                        </h4>
                      </div>
                      <span className="text-xs text-amber-300 font-mono">
                        100% Government Guaranteed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-6 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300">{proj.inputLabel}:</span>
                          <span className="text-base font-black text-amber-400 tabular-nums">
                            ₹{calcMonthlyOrLump.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={5000}
                          max={500000}
                          step={5000}
                          value={calcMonthlyOrLump}
                          onChange={(e) => setCalcMonthlyOrLump(Number(e.target.value))}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[11px] text-slate-400 tabular-nums">
                          <span>₹5,000</span>
                          <span>₹1,00,000</span>
                          <span>₹2,50,000</span>
                          <span>₹5,00,000</span>
                        </div>
                      </div>

                      <div className="md:col-span-6 grid grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                          <div className="text-[11px] text-slate-300">Principal / Sum Assured</div>
                          <div className="text-lg font-black text-white tabular-nums mt-1">
                            ₹{proj.totalInvested.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-amber-400/15 border border-amber-400/30">
                          <div className="text-[11px] text-amber-200">{proj.returnLabel}</div>
                          <div className="text-lg font-black text-amber-300 tabular-nums mt-1">
                            ₹{proj.estimatedReturn.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Key Benefits & Eligibility Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                  <h4 className="text-sm font-black text-slate-900">
                    Key Scheme Benefits & Highlights
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {activeDetailProduct.keyBenefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 mb-2">
                      Who is Eligible?
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {activeDetailProduct.eligibility.map((el, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <UserCheck size={14} className="text-red-700 shrink-0 mt-0.5" />
                          <span>{el}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <h4 className="text-sm font-black text-slate-900 mb-2">
                      Required KYC Documents
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {activeDetailProduct.requiredDocuments.map((doc, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <FileText size={14} className="text-slate-500 shrink-0 mt-0.5" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* FAQs */}
              {activeDetailProduct.faqs && activeDetailProduct.faqs.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-slate-900">
                    Frequently Asked Questions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeDetailProduct.faqs.map((faq, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
                        <div className="text-xs font-bold text-slate-900">{faq.question}</div>
                        <div className="text-xs text-slate-600 leading-relaxed">{faq.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-600">
                Need doorstep account opening or scheme assistance at your nearest <strong>India Post Office</strong>?
              </div>
              <div className="flex items-center gap-2.5">
                <a
                  href={getWhatsAppUrl(activeDetailProduct)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <MessageCircle size={14} />
                  <span>Share on WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const prod = activeDetailProduct;
                    setActiveDetailProduct(null);
                    handleProductAction(prod, 'QUICK_INQUIRY');
                  }}
                  className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Phone size={14} />
                  <span>Book Doorstep Postman Visit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDetailProduct(null)}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MULTI-PLATFORM SOCIAL SHARING & CAMPAIGN FLYER MODAL */}
      {shareModalProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-red-900 via-red-800 to-slate-950 text-white flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-amber-300 border border-white/15">
                  <Share2 size={12} className="text-amber-400" />
                  <span>Official Scheme Flyer · Pan-India Dispatch</span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  Share {shareModalProduct.name}
                </h3>
                <p className="text-xs text-slate-200">
                  Instant promotional links & flyer across all major social networks for staff, postmen & citizens.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShareModalProduct(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Flyer Preview Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                    {shareModalProduct.code}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    100% Sovereign Guarantee
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 leading-snug">
                  {shareModalProduct.name}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Return / Bonus</span>
                    <span className="font-black text-slate-900">{shareModalProduct.interestRateOrBonus}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Tax Benefit</span>
                    <span className="font-bold text-emerald-800">{shareModalProduct.taxBenefits.slice(0, 32)}...</span>
                  </div>
                </div>
              </div>

              {/* Major Social Platform Action Grid */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Globe size={14} className="text-red-700" />
                  <span>Choose Social Platform:</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* 1. WhatsApp */}
                  <a
                    href={getShareUrls(shareModalProduct).whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                    id="share-modal-whatsapp"
                  >
                    <MessageCircle size={16} />
                    <span>WhatsApp</span>
                  </a>

                  {/* 2. Telegram */}
                  <a
                    href={getShareUrls(shareModalProduct).telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                    id="share-modal-telegram"
                  >
                    <Send size={15} />
                    <span>Telegram</span>
                  </a>

                  {/* 3. Facebook */}
                  <a
                    href={getShareUrls(shareModalProduct).facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                    id="share-modal-facebook"
                  >
                    <span className="font-serif font-black text-sm">f</span>
                    <span>Facebook</span>
                  </a>

                  {/* 4. X (Twitter) */}
                  <a
                    href={getShareUrls(shareModalProduct).twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                    id="share-modal-twitter"
                  >
                    <span className="font-mono font-black text-sm">𝕏</span>
                    <span>X (Twitter)</span>
                  </a>
                </div>
              </div>

              {/* Web Share API & Clipboard Copy */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyOrNativeShare(shareModalProduct)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
                  id="share-modal-copy-flyer"
                >
                  {copiedProductCode === shareModalProduct.code ? (
                    <>
                      <Check size={14} className="text-emerald-600" />
                      <span className="text-emerald-700">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Campaign Flyer</span>
                    </>
                  )}
                </button>

                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.share({
                          title: `${shareModalProduct.name} — India Post`,
                          text: buildShareMessage(shareModalProduct),
                          url: `${window.location.origin}/?scheme=${shareModalProduct.code}`,
                        });
                      } catch {
                        // ignore user cancel
                      }
                    }}
                    className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-red-200 cursor-pointer"
                    id="share-modal-native-device"
                  >
                    <Share2 size={14} />
                    <span>Device Share</span>
                  </button>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Official Department of Posts Digital Outreach
              </span>
              <button
                type="button"
                onClick={() => setShareModalProduct(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
