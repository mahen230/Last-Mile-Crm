import React, { useState } from 'react';
import { Briefcase, Calculator, CheckCircle2, Shield, ArrowRight, Award, Plus, Share2, MessageSquare, Send } from 'lucide-react';
import { POSTAL_PRODUCTS } from '../../data/productsData';
import { ProductDefinition } from '../../types/models';
import ProductShareModal from './ProductShareModal';

export default function ServicesCatalogView({ onSelectProductForLead }: { onSelectProductForLead?: (prod: ProductDefinition) => void }) {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'SAVINGS' | 'INSURANCE' | 'IPPB_AADHAAR' | 'COMMERCIAL'>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<ProductDefinition>(POSTAL_PRODUCTS[0]);
  const [sharingProduct, setSharingProduct] = useState<ProductDefinition | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [calcAmount, setCalcAmount] = useState<number>(50000);
  const [calcYears, setCalcYears] = useState<number>(5);
  const [pitchLang, setPitchLang] = useState<'hi' | 'en'>('hi');
  const [whatsappTarget, setWhatsappTarget] = useState<'918769706002' | '919460020640'>('918769706002');

  const filteredProducts = POSTAL_PRODUCTS.filter((prod) => {
    if (activeCategory === 'ALL') return true;
    const cat = prod.category.toLowerCase();
    if (activeCategory === 'COMMERCIAL') return cat.includes('commercial') || cat.includes('merchandise');
    if (activeCategory === 'INSURANCE') return cat.includes('insurance') && !cat.includes('ippb');
    if (activeCategory === 'IPPB_AADHAAR') return cat.includes('ippb') || cat.includes('aadhaar');
    return cat.includes('savings') || cat.includes('pension') || cat.includes('child');
  });

  const handleCategoryChange = (cat: typeof activeCategory) => {
    setActiveCategory(cat);
    const nextList = POSTAL_PRODUCTS.filter((prod) => {
      if (cat === 'ALL') return true;
      const c = prod.category.toLowerCase();
      if (cat === 'COMMERCIAL') return c.includes('commercial') || c.includes('merchandise');
      if (cat === 'INSURANCE') return c.includes('insurance') && !c.includes('ippb');
      if (cat === 'IPPB_AADHAAR') return c.includes('ippb') || c.includes('aadhaar');
      return c.includes('savings') || c.includes('pension') || c.includes('child');
    });
    if (nextList.length > 0 && !nextList.some((p) => p.id === selectedProduct.id)) {
      setSelectedProduct(nextList[0]);
    }
  };

  const calculateReturn = () => {
    if (selectedProduct.code === 'SSA') {
      const rate = 0.082;
      const totalDep = calcAmount * 15;
      const approxMaturity = calcAmount * 15 * 3.4;
      return {
        type: 'Sukanya Samriddhi Maturity (21 Yrs)',
        invested: totalDep,
        maturity: Math.round(approxMaturity),
        taxBenefit: '100% Tax Free (Triple EEE)'
      };
    } else if (selectedProduct.code === 'PPF') {
      const rate = 0.071;
      const approxMaturity = calcAmount * calcYears * 1.7;
      return {
        type: 'PPF Maturity',
        invested: calcAmount * calcYears,
        maturity: Math.round(approxMaturity),
        taxBenefit: 'Exempt under 80C + Tax Free Returns'
      };
    } else if (selectedProduct.code === 'SCSS') {
      const quarterlyPayout = (calcAmount * 0.082) / 4;
      return {
        type: 'Senior Citizen Regular Quarterly Payout',
        invested: calcAmount,
        maturity: Math.round(quarterlyPayout * 20),
        regularPayout: Math.round(quarterlyPayout),
        taxBenefit: 'Section 80C Deduction'
      };
    } else if (selectedProduct.code === 'MIS') {
      const monthlyPayout = (calcAmount * 0.074) / 12;
      return {
        type: 'Monthly Income Scheme (5 Years)',
        invested: calcAmount,
        maturity: calcAmount,
        monthlyPayout: Math.round(monthlyPayout),
        taxBenefit: 'Direct credit to Savings Account'
      };
    } else {
      return {
        type: 'Government Sovereign Small Savings',
        invested: calcAmount,
        maturity: Math.round(calcAmount * 1.4),
        taxBenefit: 'Guaranteed by Govt of India'
      };
    }
  };

  const calcResult = calculateReturn();

  const buildWhatsappPitchUrl = (prod: ProductDefinition) => {
    const deskLabel = whatsappTarget === '918769706002' ? 'Beat 2 (Mahendra Kumar Meena)' : 'Dadabari S.O. Desk';
    const message =
      pitchLang === 'hi'
        ? `नमस्ते ${deskLabel}! मुझे India Post योजना "${prod.name}" (${prod.code}) — लाभ: ${prod.interestRateOrBonus}, न्यूनतम: ${prod.minInvestment} के बारे में पूरी जानकारी और होम विजिट बुकिंग चाहिए। (XPOKART · PIN 324009)`
        : `Namaste ${deskLabel}! I am interested in "${prod.name}" (${prod.code}) — Highlight: ${prod.interestRateOrBonus}, Min: ${prod.minInvestment}. Please share enrollment details / Speed Post COD pickup info. (XPOKART · PIN 324009)`;
    return `https://api.whatsapp.com/send?phone=${whatsappTarget}&text=${encodeURIComponent(message)}`;
  };

  const getProductTheme = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('insurance')) return { grad: 'from-indigo-600 to-violet-700', border: 'border-indigo-200', activeBg: 'bg-indigo-50/80 border-indigo-400', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    if (c.includes('ippb') || c.includes('aadhaar')) return { grad: 'from-sky-600 to-blue-700', border: 'border-sky-200', activeBg: 'bg-sky-50/80 border-sky-400', badge: 'bg-sky-100 text-sky-800 border-sky-200' };
    if (c.includes('commercial') || c.includes('merchandise')) return { grad: 'from-amber-500 to-orange-600', border: 'border-amber-200', activeBg: 'bg-amber-50/80 border-amber-400', badge: 'bg-amber-100 text-amber-900 border-amber-200' };
    return { grad: 'from-emerald-600 to-teal-700', border: 'border-emerald-200', activeBg: 'bg-emerald-50/80 border-emerald-400', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  return (
    <div className="space-y-6" id="services-catalog-view-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-red-800 via-rose-700 to-amber-700 text-white p-6 rounded-3xl shadow-md">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Briefcase size={22} className="text-amber-300" />
            <span>Postal Services, Financial Schemes &amp; Commercial Catalog</span>
          </h2>
          <p className="text-xs text-rose-100 mt-1">
            Small Savings, PLI/RPLI, IPPB Banking, Aadhaar &amp; Commercial Merchandise (MyStamp, Gangajal, Speed Post COD)
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'ALL' as const, label: `All (${POSTAL_PRODUCTS.length})` },
            { id: 'SAVINGS' as const, label: 'Savings & Pension' },
            { id: 'INSURANCE' as const, label: 'PLI / RPLI' },
            { id: 'IPPB_AADHAAR' as const, label: 'IPPB & Aadhaar' },
            { id: 'COMMERCIAL' as const, label: 'Commercial & Retail' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleCategoryChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Product Selector List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredProducts.map((prod) => {
            const theme = getProductTheme(prod.category);
            const isSelected = selectedProduct.id === prod.id;
            return (
              <div
                key={prod.id}
                onClick={() => setSelectedProduct(prod)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-2xs hover:shadow-md ${
                  isSelected ? theme.activeBg : `bg-white ${theme.border}`
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-900 text-sm">{prod.name}</span>
                    <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full border ${theme.badge}`}>
                      {prod.code}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{prod.category}</div>
                  <div className="text-xs font-black text-red-700 mt-1 tabular-nums">{prod.interestRateOrBonus}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSharingProduct(prod);
                      setShowShareModal(true);
                    }}
                    className="p-2 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-xl border border-slate-200 transition cursor-pointer"
                    title={`Share ${prod.name} via WhatsApp / SMS`}
                  >
                    <Share2 size={14} />
                  </button>
                  <ArrowRight size={18} className={isSelected ? 'text-red-700' : 'text-slate-300'} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Detailed View & Calculator */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400">{selectedProduct.category}</span>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">{selectedProduct.name}</h3>
                <p className="text-xs text-slate-600 font-medium mt-1">{selectedProduct.tagline}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 font-medium block">Interest / Bonus</span>
                <span className="text-lg font-black text-red-700">{selectedProduct.interestRateOrBonus}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Min Deposit</span>
                <span className="font-bold text-slate-900">{selectedProduct.minInvestment}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Max Limit</span>
                <span className="font-bold text-slate-900">{selectedProduct.maxInvestment || 'No limit'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Tax Benefit</span>
                <span className="font-bold text-emerald-700">{selectedProduct.taxBenefits}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Description & Objectives</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedProduct.description}</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Key Customer Benefits</h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {selectedProduct.keyBenefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Eligibility Rules</h4>
              <ul className="space-y-1 text-xs text-slate-600 list-disc pl-4">
                {selectedProduct.eligibility.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>

            {/* Interactive Return Estimator */}
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5 text-amber-300">
                  <Calculator size={15} /> Interactive Returns Calculator
                </span>
                <span className="text-xs text-slate-400 font-mono">{selectedProduct.code}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Annual / Lump-Sum Amount (₹)</label>
                  <input
                    type="number"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Tenure (Years)</label>
                  <input
                    type="number"
                    value={calcYears}
                    onChange={(e) => setCalcYears(Number(e.target.value))}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-800/90 rounded-lg border border-slate-700 text-xs space-y-1">
                <div className="text-slate-400">{calcResult.type}</div>
                <div className="text-base font-black text-amber-400">
                  Estimated Value: ₹{calcResult.maturity.toLocaleString('en-IN')}
                </div>
                {calcResult.monthlyPayout && (
                  <div className="text-emerald-400 font-semibold">
                    Monthly Payout: ₹{calcResult.monthlyPayout.toLocaleString('en-IN')} / month
                  </div>
                )}
                {calcResult.regularPayout && (
                  <div className="text-emerald-400 font-semibold">
                    Quarterly Pension Payout: ₹{calcResult.regularPayout.toLocaleString('en-IN')} / quarter
                  </div>
                )}
                <div className="text-[11px] text-slate-400">Tax Note: {calcResult.taxBenefit}</div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
              {/* Bilingual WhatsApp Pitch & Desk Routing */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-50/70 border border-emerald-200 p-3 rounded-2xl text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-emerald-950">WhatsApp Desk:</span>
                  <select
                    value={whatsappTarget}
                    onChange={(e) => setWhatsappTarget(e.target.value as '918769706002' | '919460020640')}
                    className="px-2.5 py-1 bg-white border border-emerald-300 rounded-lg font-bold text-emerald-900 cursor-pointer"
                  >
                    <option value="918769706002">Beat 2 · 8769706002</option>
                    <option value="919460020640">Dadabari S.O. · 9460020640</option>
                  </select>
                </div>
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-emerald-200">
                  <button
                    type="button"
                    onClick={() => setPitchLang('hi')}
                    className={`px-2 py-1 rounded-md font-bold cursor-pointer ${
                      pitchLang === 'hi' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    हिंदी
                  </button>
                  <button
                    type="button"
                    onClick={() => setPitchLang('en')}
                    className={`px-2 py-1 rounded-md font-bold cursor-pointer ${
                      pitchLang === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSharingProduct(selectedProduct);
                    setShowShareModal(true);
                  }}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  id="share-selected-product-btn"
                >
                  <Share2 size={15} />
                  <span>Broadcast / CRM Share</span>
                </button>

                <a
                  href={buildWhatsappPitchUrl(selectedProduct)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
                >
                  <Send size={15} />
                  <span>WhatsApp Pitch ({pitchLang === 'hi' ? 'हिंदी' : 'EN'})</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product & Scheme Share Modal */}
      {showShareModal && (
        <ProductShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSharingProduct(null);
          }}
          preselectedProduct={sharingProduct || selectedProduct}
        />
      )}
    </div>
  );
}
