import React, { useState } from 'react';
import { Briefcase, Calculator, CheckCircle2, Shield, ArrowRight, Award, Plus, Share2, MessageSquare, Send } from 'lucide-react';
import { POSTAL_PRODUCTS } from '../../data/productsData';
import { ProductDefinition } from '../../types/models';
import ProductShareModal from './ProductShareModal';

export default function ServicesCatalogView({ onSelectProductForLead }: { onSelectProductForLead?: (prod: ProductDefinition) => void }) {
  const [selectedProduct, setSelectedProduct] = useState<ProductDefinition>(POSTAL_PRODUCTS[0]);
  const [sharingProduct, setSharingProduct] = useState<ProductDefinition | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [calcAmount, setCalcAmount] = useState<number>(50000);
  const [calcYears, setCalcYears] = useState<number>(5);

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

  const handleContactClick = (productName: string) => {
    const message = `Namaste! I am interested in knowing more about [Product: ${productName}]. Can you please provide more details?`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6" id="services-catalog-view-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase size={22} className="text-red-700" />
            <span>Postal Services & Financial Products Catalog</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete Small Savings, Postal Life Insurance, IPPB Banking & Aadhaar Doorstep Services
          </p>
        </div>
      </div>

      {/* Catalog Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Product Selector List */}
        <div className="lg:col-span-5 space-y-3">
          {POSTAL_PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              onClick={() => setSelectedProduct(prod)}
              className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                selectedProduct.id === prod.id
                  ? 'bg-red-50/70 border-red-400 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{prod.name}</span>
                  <span className="text-[11px] font-mono font-bold bg-white text-red-700 px-2 py-0.5 rounded border border-red-200">
                    {prod.code}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">{prod.category}</div>
                <div className="text-xs font-bold text-red-700 mt-1">{prod.interestRateOrBonus}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSharingProduct(prod);
                    setShowShareModal(true);
                  }}
                  className="p-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 rounded-lg border border-slate-200 transition"
                  title={`Share ${prod.name} via WhatsApp / SMS`}
                >
                  <Share2 size={14} />
                </button>
                <ArrowRight size={18} className={selectedProduct.id === prod.id ? 'text-red-700' : 'text-slate-300'} />
              </div>
            </div>
          ))}
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

            <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap gap-3">
              <button 
                type="button"
                onClick={() => {
                  setSharingProduct(selectedProduct);
                  setShowShareModal(true);
                }}
                className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
                id="share-selected-product-btn"
              >
                <Share2 size={16} />
                <span>Share Product (WhatsApp / SMS / Broadcast)</span>
              </button>

              <button 
                type="button"
                onClick={() => handleContactClick(selectedProduct.name)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Inquiry
              </button>
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
