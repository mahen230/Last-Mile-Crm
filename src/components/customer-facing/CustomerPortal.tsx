import React, { useState } from 'react';
import { 
  Shield, PiggyBank, HeartHandshake, Award, FileCheck, CheckCircle2, 
  HelpCircle, ArrowRight, Phone, MessageSquare, Search, Sparkles, 
  Calculator, UserCheck, AlertCircle, RefreshCw, ChevronRight, X
} from 'lucide-react';
import { POSTAL_PRODUCTS } from '../../data/productsData';
import { ProductDefinition, Customer } from '../../types/models';
import { customerService } from '../../services/customerService';

export default function CustomerPortal({ onSwitchToStaff, onBackToCRM }: { onSwitchToStaff?: () => void; onBackToCRM?: () => void }) {
  const handleReturnToStaff = onBackToCRM || onSwitchToStaff;
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<ProductDefinition | null>(null);
  const [showInquiryModal, setShowInquiryModal] = useState<boolean>(false);
  const [inquiryProduct, setInquiryProduct] = useState<string>('');
  const [showTrackerModal, setShowTrackerModal] = useState<boolean>(false);
  const [showAssistantModal, setShowAssistantModal] = useState<boolean>(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState<boolean>(false);

  // Form State
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryMobile, setInquiryMobile] = useState('');
  const [inquiryAddress, setInquiryAddress] = useState('');
  const [inquiryReq, setInquiryReq] = useState('');
  const [preferredContact, setPreferredContact] = useState<'Phone Call' | 'WhatsApp' | 'Doorstep Visit'>('Phone Call');
  const [inquirySuccess, setInquirySuccess] = useState<string | null>(null);

  // Tracker State
  const [trackPhone, setTrackPhone] = useState('');
  const [trackResult, setTrackResult] = useState<{
    customer?: Customer;
    inquiries?: any[];
    leads?: any[];
    searched: boolean;
  }>({ searched: false });

  // Filter products
  const filteredProducts = POSTAL_PRODUCTS.filter(prod => {
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      prod.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    'All',
    'Child & Women Empowerment',
    'Savings & Deposits',
    'Postal Life Insurance',
    'Social Security & Pension',
    'Digital Banking & Aadhaar'
  ];

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryMobile) {
      alert('Please provide your name and mobile number.');
      return;
    }

    const { inquiry } = customerService.submitCustomerInquiry({
      customerName: inquiryName,
      mobile: inquiryMobile,
      productInterested: inquiryProduct || 'General Postal Savings',
      requirement: inquiryReq || `Inquiry for ${inquiryProduct || 'Postal Services'}`,
      preferredContact,
      address: inquiryAddress
    });

    setInquirySuccess(`Thank you, ${inquiryName}! Your request has been logged under Reference #${inquiry.ticketNumber}. A Postal representative from your local beat will contact you via ${preferredContact}.`);
    
    setTimeout(() => {
      setInquiryName('');
      setInquiryMobile('');
      setInquiryAddress('');
      setInquiryReq('');
      setInquirySuccess(null);
      setShowInquiryModal(false);
    }, 4000);
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackPhone) return;

    const cust = customerService.getCustomerByMobile(trackPhone);
    const allInquiries = customerService.getInquiries().filter(i => i.mobile.includes(trackPhone.slice(-10)));
    const allLeads = customerService.getLeads().filter(l => l.customerMobile.includes(trackPhone.slice(-10)));

    setTrackResult({
      customer: cust,
      inquiries: allInquiries,
      leads: allLeads,
      searched: true
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans" id="customer-portal-root">
      {/* Top Notification Banner */}
      <div className="bg-gradient-to-r from-red-800 via-red-700 to-amber-700 text-white px-4 py-2.5 text-xs md:text-sm flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 font-medium">
          <Shield size={16} className="text-amber-300" />
          <span>India Post Official Citizen Services — Dadabari Sub-Post Office & Field Beats</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block bg-red-900/60 px-2 py-0.5 rounded text-amber-200">Doorstep Banking & Aadhaar Available</span>
          {onSwitchToStaff && (
            <button 
              onClick={onSwitchToStaff}
              className="bg-white/15 hover:bg-white/25 text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide border border-white/20 transition"
              id="switch-to-crm-btn"
            >
              Staff / Admin CRM View →
            </button>
          )}
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-700 text-white flex items-center justify-center font-bold text-xl shadow-md">
              📮
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base md:text-lg leading-tight">Dak Seva & Financial Services</h1>
              <p className="text-xs text-slate-500">Government of India Guaranteed Small Savings & Insurance</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {handleReturnToStaff && (
              <button
                onClick={handleReturnToStaff}
                className="px-3 py-2 text-xs md:text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition flex items-center gap-1.5"
                id="back-to-crm-btn"
              >
                <ArrowRight size={15} className="rotate-180" />
                <span>Staff CRM</span>
              </button>
            )}

            <button
              onClick={() => setShowTrackerModal(true)}
              className="px-3 py-2 text-xs md:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5"
              id="track-request-nav-btn"
            >
              <Search size={15} />
              <span className="hidden sm:inline">Track Status</span>
            </button>

            <button
              onClick={() => setShowAssistantModal(true)}
              className="px-3 py-2 text-xs md:text-sm font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition flex items-center gap-1.5 border border-amber-300"
              id="smart-assistant-nav-btn"
            >
              <Sparkles size={15} className="text-amber-700" />
              <span>Smart Advisor</span>
            </button>

            <button
              onClick={() => {
                setInquiryProduct('General Postal Consultation');
                setShowInquiryModal(true);
              }}
              className="px-3.5 py-2 text-xs md:text-sm font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-sm transition flex items-center gap-1.5"
              id="request-callback-nav-btn"
            >
              <Phone size={15} />
              <span>Request Callback</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-red-50/60 to-white py-10 md:py-14 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                <Award size={14} /> 100% Sovereign Safety Guaranteed by Govt of India
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Secure Your Family's Future with Trusted Postal Schemes
              </h2>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-2xl">
                Explore high-yield tax-free savings like Sukanya Samriddhi (8.2%), PPF, highest-bonus Postal Life Insurance (PLI), Senior Citizen pension schemes, and doorstep Aadhaar / IPPB digital banking.
              </p>

              {/* Quick Search Bar */}
              <div className="pt-2 max-w-xl">
                <div className="relative flex items-center">
                  <Search size={18} className="absolute left-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by scheme name (e.g. Sukanya, PLI, RD, Senior Citizen)..."
                    className="w-full pl-10 pr-24 py-3 bg-white border border-slate-300 rounded-xl shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                    id="hero-product-search-input"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 text-xs text-slate-400 hover:text-slate-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>Triple Tax Benefit (EEE)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>Highest Bonus Life Cover</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>Doorstep Postman Assistance</span>
                </div>
              </div>
            </div>

            {/* Quick Service Highlights Box */}
            <div className="lg:col-span-5">
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-lg space-y-4">
                <h3 className="font-bold text-slate-900 text-base flex items-center justify-between">
                  <span>Popular Postal Highlights</span>
                  <span className="text-xs bg-amber-100 text-amber-900 font-semibold px-2.5 py-0.5 rounded-full">Q2 Rates</span>
                </h3>

                <div className="space-y-3">
                  <div 
                    onClick={() => {
                      const p = POSTAL_PRODUCTS.find(x => x.code === 'SSA');
                      if (p) setSelectedProduct(p);
                    }}
                    className="p-3 bg-rose-50/70 hover:bg-rose-100/70 rounded-xl border border-rose-100 cursor-pointer transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm">
                        SSA
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">Sukanya Samriddhi (SSA)</h4>
                        <p className="text-xs text-rose-700 font-medium">8.2% Interest • 100% Tax Free for Girls</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>

                  <div 
                    onClick={() => {
                      const p = POSTAL_PRODUCTS.find(x => x.code === 'PLI_SURAKSHA');
                      if (p) setSelectedProduct(p);
                    }}
                    className="p-3 bg-blue-50/70 hover:bg-blue-100/70 rounded-xl border border-blue-100 cursor-pointer transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-sm">
                        PLI
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">Postal Life Insurance (Suraksha)</h4>
                        <p className="text-xs text-blue-700 font-medium">₹76/₹1,000 Highest Bonus Rate in India</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>

                  <div 
                    onClick={() => {
                      const p = POSTAL_PRODUCTS.find(x => x.code === 'SCSS');
                      if (p) setSelectedProduct(p);
                    }}
                    className="p-3 bg-amber-50/70 hover:bg-amber-100/70 rounded-xl border border-amber-100 cursor-pointer transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-700 text-white flex items-center justify-center font-bold text-sm">
                        SCSS
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">Senior Citizen Savings Scheme</h4>
                        <p className="text-xs text-amber-800 font-medium">8.2% Quarterly Guaranteed Pension Payout</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setShowCalculatorModal(true)}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Calculator size={15} />
                    <span>Return Calculator</span>
                  </button>
                  <button
                    onClick={() => setShowAssistantModal(true)}
                    className="flex-1 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Sparkles size={15} />
                    <span>Help Me Choose</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs & Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Explore Government Postal Schemes</h3>
            <p className="text-xs sm:text-sm text-slate-500">Select a category or click on any product for eligibility and documentation</p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition ${
                selectedCategory === cat 
                  ? 'bg-red-700 text-white shadow-xs' 
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                    {prod.category}
                  </span>
                  {prod.isPopular && (
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md">
                      ★ Top Recommended
                    </span>
                  )}
                </div>

                <h4 className="text-lg font-bold text-slate-900 group-hover:text-red-700 transition mb-1">
                  {prod.name}
                </h4>
                <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-2">
                  {prod.tagline}
                </p>

                {/* Key Metric Highlight */}
                <div className="bg-red-50/60 border border-red-100 rounded-xl p-3.5 mb-4">
                  <div className="text-xs text-slate-500 font-medium">Interest / Bonus Return</div>
                  <div className="text-base font-extrabold text-red-700">
                    {prod.interestRateOrBonus}
                  </div>
                </div>

                {/* Key Benefits snippet */}
                <ul className="space-y-1.5 text-xs text-slate-600 mb-2">
                  {prod.keyBenefits.slice(0, 2).map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                      <span className="line-clamp-1">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setSelectedProduct(prod)}
                  className="flex-1 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  View Details
                </button>
                <button
                  onClick={() => {
                    setInquiryProduct(prod.name);
                    setShowInquiryModal(true);
                  }}
                  className="flex-1 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1"
                >
                  <span>Inquire / Apply</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 bg-gradient-to-r from-red-800 to-red-700 text-white flex items-start justify-between sticky top-0 z-10">
              <div>
                <div className="text-xs uppercase tracking-wider text-amber-200 font-semibold mb-1">
                  {selectedProduct.category}
                </div>
                <h3 className="text-xl md:text-2xl font-bold">{selectedProduct.name}</h3>
                <p className="text-xs text-red-100 mt-1">{selectedProduct.tagline}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 text-slate-800 text-sm">
              {/* Highlight Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Interest / Bonus</div>
                  <div className="text-sm font-bold text-red-700">{selectedProduct.interestRateOrBonus}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Min Deposit / Sum</div>
                  <div className="text-sm font-bold text-slate-900">{selectedProduct.minInvestment}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Tax Status</div>
                  <div className="text-sm font-bold text-emerald-700">{selectedProduct.taxBenefits}</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1">About This Scheme</h4>
                <p className="text-slate-600 leading-relaxed">{selectedProduct.description}</p>
              </div>

              {/* Eligibility */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <UserCheck size={16} className="text-red-700" />
                  <span>Who Is Eligible?</span>
                </h4>
                <ul className="space-y-1.5 pl-2">
                  {selectedProduct.eligibility.map((el, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600">
                      <span className="text-red-700 font-bold">•</span>
                      <span>{el}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required Documents */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <FileCheck size={16} className="text-red-700" />
                  <span>Required Documents</span>
                </h4>
                <ul className="space-y-1.5 pl-2">
                  {selectedProduct.requiredDocuments.map((doc, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* FAQs */}
              {selectedProduct.faqs && selectedProduct.faqs.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <HelpCircle size={16} className="text-red-700" />
                    <span>Frequently Asked Questions</span>
                  </h4>
                  <div className="space-y-2.5">
                    {selectedProduct.faqs.map((faq, i) => (
                      <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="font-semibold text-slate-900 text-xs">{faq.question}</div>
                        <div className="text-xs text-slate-600 mt-1">{faq.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setInquiryProduct(selectedProduct.name);
                  setSelectedProduct(null);
                  setShowInquiryModal(true);
                }}
                className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2"
              >
                <Phone size={15} />
                <span>Apply / Request Callback for {selectedProduct.code}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry / Callback Form Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Request Callback / Apply</h3>
                <p className="text-xs text-slate-500">Your local beat postman or postal representative will assist you.</p>
              </div>
              <button onClick={() => setShowInquiryModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            {inquirySuccess ? (
              <div className="my-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">
                <div className="font-bold flex items-center gap-2 text-emerald-900 mb-1">
                  <CheckCircle2 size={18} /> Request Submitted Successfully
                </div>
                {inquirySuccess}
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4 mt-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product of Interest</label>
                  <input
                    type="text"
                    value={inquiryProduct}
                    onChange={(e) => setInquiryProduct(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    placeholder="e.g. Sukanya Samriddhi, PLI Suraksha, RD"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="e.g. Rajendra Sharma"
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (10 Digits) *</label>
                    <input
                      type="tel"
                      required
                      value={inquiryMobile}
                      onChange={(e) => setInquiryMobile(e.target.value)}
                      placeholder="e.g. 9829012345"
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Address / House No. & Sector</label>
                  <input
                    type="text"
                    value={inquiryAddress}
                    onChange={(e) => setInquiryAddress(e.target.value)}
                    placeholder="e.g. 445 Keshavpura Sector 7, Kota"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Specific Requirement or Questions</label>
                  <textarea
                    rows={2}
                    value={inquiryReq}
                    onChange={(e) => setInquiryReq(e.target.value)}
                    placeholder="e.g. Need information regarding daughter's age eligibility and doorstep document pickup."
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Mode of Contact</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Phone Call', 'WhatsApp', 'Doorstep Visit'] as const).map((mode) => (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => setPreferredContact(mode)}
                        className={`py-2 px-2 text-xs font-medium rounded-lg border transition ${
                          preferredContact === mode 
                            ? 'bg-red-700 text-white border-red-700' 
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowInquiryModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-xl shadow-xs"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Tracker Modal */}
      {showTrackerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Track Inquiries & Account Status</h3>
                <p className="text-xs text-slate-500">Enter your registered 10-digit mobile number</p>
              </div>
              <button onClick={() => setShowTrackerModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTrackSubmit} className="mt-4 flex gap-2">
              <input
                type="tel"
                required
                value={trackPhone}
                onChange={(e) => setTrackPhone(e.target.value)}
                placeholder="Enter 10-digit mobile number..."
                className="flex-1 p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-600"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl"
              >
                Search Records
              </button>
            </form>

            {trackResult.searched && (
              <div className="mt-5 space-y-4 max-h-72 overflow-y-auto pr-1">
                {trackResult.customer ? (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{trackResult.customer.name}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded">
                        {trackResult.customer.verificationStatus}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      <strong>Address:</strong> {trackResult.customer.address?.fullAddress || trackResult.customer.houseNo || 'Not specified'}
                    </div>
                    <div className="text-slate-600">
                      <strong>Beat / Post Office:</strong> Beat {trackResult.customer.beatNo || '2'}, {trackResult.customer.officeId || 'DADABARI_SO'}
                    </div>

                    {trackResult.customer.products && trackResult.customer.products.length > 0 && (
                      <div className="pt-2">
                        <span className="font-semibold text-slate-800 block mb-1">Active Accounts / Inquiries:</span>
                        <div className="space-y-1">
                          {trackResult.customer.products.map((p, i) => (
                            <div key={i} className="p-2 bg-white rounded border border-slate-200 flex justify-between">
                              <span>{p.productName}</span>
                              <span className="font-semibold text-red-700">{p.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                    No verified customer record found for mobile {trackPhone}. You can submit a callback inquiry to get started.
                  </div>
                )}

                {trackResult.inquiries && trackResult.inquiries.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-bold text-xs text-slate-700">Submitted Web Inquiries:</h5>
                    {trackResult.inquiries.map((inq: any) => (
                      <div key={inq.id} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span>{inq.ticketNumber} ({inq.productInterested})</span>
                          <span className="text-blue-700">{inq.status}</span>
                        </div>
                        <p className="text-slate-500">{inq.requirement}</p>
                        <p className="text-[11px] text-slate-400">Assigned To: {inq.assignedStaffName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Smart Assistant Modal */}
      {showAssistantModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-amber-600" />
                <h3 className="font-bold text-lg text-slate-900">Smart Postal Advisor</h3>
              </div>
              <button onClick={() => setShowAssistantModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <p className="text-xs text-slate-500">
                Select what describes your goal best for compliant, sovereign-guaranteed scheme recommendations:
              </p>

              <div className="space-y-2.5">
                {[
                  {
                    title: "I want to save for my daughter's future (0-10 yrs)",
                    code: "SSA",
                    product: "Sukanya Samriddhi Account (SSA)",
                    reason: "Provides highest 8.2% tax-free compounding interest specifically tailored for girl children."
                  },
                  {
                    title: "I want highest bonus life insurance cover with lowest premium",
                    code: "PLI_SURAKSHA",
                    product: "Postal Life Insurance (Suraksha)",
                    reason: "Government whole-life policy with an exceptional ₹76/₹1,000 Sum Assured bonus rate."
                  },
                  {
                    title: "I am a Senior Citizen looking for guaranteed quarterly income",
                    code: "SCSS",
                    product: "Senior Citizen Savings Scheme (SCSS)",
                    reason: "Guaranteed 8.2% quarterly pension payout with 80C tax deduction."
                  },
                  {
                    title: "I want predictable monthly cash flow into my account",
                    code: "MIS",
                    product: "Monthly Income Scheme (MIS)",
                    reason: "Dependable 7.4% monthly payout credited directly to your savings account for 5 years."
                  },
                  {
                    title: "I need doorstep Child Aadhaar (0-5 yrs) or Mobile link",
                    code: "CELC_AADHAAR",
                    product: "Aadhaar & CELC Doorstep Service",
                    reason: "Child enrolment is 100% free; Postman visits your home with biometric verification."
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const p = POSTAL_PRODUCTS.find(x => x.code === item.code);
                      setShowAssistantModal(false);
                      if (p) setSelectedProduct(p);
                    }}
                    className="p-3 bg-slate-50 hover:bg-red-50/60 border border-slate-200 hover:border-red-300 rounded-xl cursor-pointer transition text-left"
                  >
                    <div className="font-semibold text-slate-900 text-xs flex justify-between">
                      <span>{item.title}</span>
                      <span className="text-red-700 font-bold text-[11px]">{item.product}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">{item.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Calculator Modal */}
      {showCalculatorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Calculator size={20} className="text-red-700" />
                <h3 className="font-bold text-lg text-slate-900">Postal Scheme Quick Estimator</h3>
              </div>
              <button onClick={() => setShowCalculatorModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-700">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl">
                <div className="font-bold text-rose-900 text-sm mb-1">Sukanya Samriddhi (SSA) Estimate</div>
                <p>Deposit ₹10,000 / year for 15 years (Total: ₹1,50,000):</p>
                <div className="text-base font-extrabold text-rose-700 mt-1">Approx ₹5,10,000 Maturity (100% Tax Free)</div>
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="font-bold text-blue-900 text-sm mb-1">PLI Suraksha (Whole Life) Estimate</div>
                <p>Sum Assured ₹10,00,000 (Age 30, premium till age 60):</p>
                <div className="text-base font-extrabold text-blue-800 mt-1">
                  Accrued Bonus: ₹22,80,000 + ₹10 Lakh Sum Assured = ₹32,80,000 Total Cover
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="font-bold text-amber-900 text-sm mb-1">MIS Monthly Income Estimate</div>
                <p>Joint Deposit of ₹15,00,000 at 7.4% p.a.:</p>
                <div className="text-base font-extrabold text-amber-900 mt-1">₹9,250 Regular Monthly Payout for 5 Years</div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowCalculatorModal(false)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-white text-sm">Dadabari Sub-Post Office & Beats CRM</span>
            <p className="text-slate-500 mt-0.5">Keshavpura Sector 2, 4, 6, 7 & Santoshi Nagar, Kota - 324009</p>
          </div>
          <div className="flex items-center gap-6">
            <span>Sovereign Government Safety</span>
            <span>AePS Doorstep Banking</span>
            <span>Aadhaar CELC Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
