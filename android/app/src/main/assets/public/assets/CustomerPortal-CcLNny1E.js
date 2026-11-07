import { c as createLucideIcon, r as reactExports, ac as POSTAL_PRODUCTS, j as jsxRuntimeExports, aA as Shield, ah as ArrowRight, S as Search, K as Sparkles, p as Phone, aW as Award, C as CircleCheck, q as ChevronRight, ai as Calculator, X, f as UserCheck, b as customerService } from "./index-BWTx-a8O.js";
import { C as CircleQuestionMark } from "./circle-question-mark-DRyUTD-Z.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "m9 15 2 2 4-4", key: "1grp1n" }]
];
const FileCheck = createLucideIcon("file-check", __iconNode);
function CustomerPortal({ onSwitchToStaff, onBackToCRM }) {
  var _a;
  const handleReturnToStaff = onBackToCRM || onSwitchToStaff;
  const [selectedCategory, setSelectedCategory] = reactExports.useState("All");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [selectedProduct, setSelectedProduct] = reactExports.useState(null);
  const [showInquiryModal, setShowInquiryModal] = reactExports.useState(false);
  const [inquiryProduct, setInquiryProduct] = reactExports.useState("");
  const [showTrackerModal, setShowTrackerModal] = reactExports.useState(false);
  const [showAssistantModal, setShowAssistantModal] = reactExports.useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = reactExports.useState(false);
  const [inquiryName, setInquiryName] = reactExports.useState("");
  const [inquiryMobile, setInquiryMobile] = reactExports.useState("");
  const [inquiryAddress, setInquiryAddress] = reactExports.useState("");
  const [inquiryReq, setInquiryReq] = reactExports.useState("");
  const [preferredContact, setPreferredContact] = reactExports.useState("Phone Call");
  const [inquirySuccess, setInquirySuccess] = reactExports.useState(null);
  const [trackPhone, setTrackPhone] = reactExports.useState("");
  const [trackResult, setTrackResult] = reactExports.useState({ searched: false });
  const filteredProducts = POSTAL_PRODUCTS.filter((prod) => {
    const matchesCategory = selectedCategory === "All" || prod.category === selectedCategory;
    const matchesSearch = searchQuery === "" || prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || prod.tagline.toLowerCase().includes(searchQuery.toLowerCase()) || prod.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  const categories = [
    "All",
    "Child & Women Empowerment",
    "Savings & Deposits",
    "Postal Life Insurance",
    "Social Security & Pension",
    "Digital Banking & Aadhaar"
  ];
  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!inquiryName || !inquiryMobile) {
      alert("Please provide your name and mobile number.");
      return;
    }
    const { inquiry } = customerService.submitCustomerInquiry({
      customerName: inquiryName,
      mobile: inquiryMobile,
      productInterested: inquiryProduct || "General Postal Savings",
      requirement: inquiryReq || `Inquiry for ${inquiryProduct || "Postal Services"}`,
      preferredContact,
      address: inquiryAddress
    });
    setInquirySuccess(`Thank you, ${inquiryName}! Your request has been logged under Reference #${inquiry.ticketNumber}. A Postal representative from your local beat will contact you via ${preferredContact}.`);
    setTimeout(() => {
      setInquiryName("");
      setInquiryMobile("");
      setInquiryAddress("");
      setInquiryReq("");
      setInquirySuccess(null);
      setShowInquiryModal(false);
    }, 4e3);
  };
  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!trackPhone) return;
    const cust = customerService.getCustomerByMobile(trackPhone);
    const allInquiries = customerService.getInquiries().filter((i) => i.mobile.includes(trackPhone.slice(-10)));
    const allLeads = customerService.getLeads().filter((l) => l.customerMobile.includes(trackPhone.slice(-10)));
    setTrackResult({
      customer: cust,
      inquiries: allInquiries,
      leads: allLeads,
      searched: true
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-slate-50 text-slate-900 font-sans", id: "customer-portal-root", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-red-800 via-red-700 to-amber-700 text-white px-4 py-2.5 text-xs md:text-sm flex flex-wrap items-center justify-between gap-2 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { size: 16, className: "text-amber-300" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "India Post Official Citizen Services — Dadabari Sub-Post Office & Field Beats" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline-block bg-red-900/60 px-2 py-0.5 rounded text-amber-200", children: "Doorstep Banking & Aadhaar Available" }),
        onSwitchToStaff && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onSwitchToStaff,
            className: "bg-white/15 hover:bg-white/25 text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide border border-white/20 transition",
            id: "switch-to-crm-btn",
            children: "Staff / Admin CRM View →"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-red-700 text-white flex items-center justify-center font-bold text-xl shadow-md", children: "📮" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-bold text-slate-900 text-base md:text-lg leading-tight", children: "Dak Seva & Financial Services" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Government of India Guaranteed Small Savings & Insurance" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 sm:gap-3", children: [
        handleReturnToStaff && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleReturnToStaff,
            className: "px-3 py-2 text-xs md:text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition flex items-center gap-1.5",
            id: "back-to-crm-btn",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 15, className: "rotate-180" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Staff CRM" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowTrackerModal(true),
            className: "px-3 py-2 text-xs md:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5",
            id: "track-request-nav-btn",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 15 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Track Status" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowAssistantModal(true),
            className: "px-3 py-2 text-xs md:text-sm font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition flex items-center gap-1.5 border border-amber-300",
            id: "smart-assistant-nav-btn",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 15, className: "text-amber-700" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Smart Advisor" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setInquiryProduct("General Postal Consultation");
              setShowInquiryModal(true);
            },
            className: "px-3.5 py-2 text-xs md:text-sm font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg shadow-sm transition flex items-center gap-1.5",
            id: "request-callback-nav-btn",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 15 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Request Callback" })
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-gradient-to-b from-red-50/60 to-white py-10 md:py-14 border-b border-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-7 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { size: 14 }),
          " 100% Sovereign Safety Guaranteed by Govt of India"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight", children: "Secure Your Family's Future with Trusted Postal Schemes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-600 text-sm md:text-base leading-relaxed max-w-2xl", children: "Explore high-yield tax-free savings like Sukanya Samriddhi (8.2%), PPF, highest-bonus Postal Life Insurance (PLI), Senior Citizen pension schemes, and doorstep Aadhaar / IPPB digital banking." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 max-w-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 18, className: "absolute left-3.5 text-slate-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              placeholder: "Search by scheme name (e.g. Sukanya, PLI, RD, Senior Citizen)...",
              className: "w-full pl-10 pr-24 py-3 bg-white border border-slate-300 rounded-xl shadow-xs text-sm focus:outline-none focus:ring-2 focus:ring-red-600",
              id: "hero-product-search-input"
            }
          ),
          searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setSearchQuery(""),
              className: "absolute right-3 text-xs text-slate-400 hover:text-slate-700",
              children: "Clear"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 flex flex-wrap gap-4 text-xs text-slate-600 font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 15, className: "text-emerald-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Triple Tax Benefit (EEE)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 15, className: "text-emerald-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Highest Bonus Life Cover" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 15, className: "text-emerald-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Doorstep Postman Assistance" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-lg space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-slate-900 text-base flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Popular Postal Highlights" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-amber-100 text-amber-900 font-semibold px-2.5 py-0.5 rounded-full", children: "Q2 Rates" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              onClick: () => {
                const p = POSTAL_PRODUCTS.find((x) => x.code === "SSA");
                if (p) setSelectedProduct(p);
              },
              className: "p-3 bg-rose-50/70 hover:bg-rose-100/70 rounded-xl border border-rose-100 cursor-pointer transition flex items-center justify-between",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm", children: "SSA" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-slate-900 text-sm", children: "Sukanya Samriddhi (SSA)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-rose-700 font-medium", children: "8.2% Interest • 100% Tax Free for Girls" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 18, className: "text-slate-400" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              onClick: () => {
                const p = POSTAL_PRODUCTS.find((x) => x.code === "PLI_SURAKSHA");
                if (p) setSelectedProduct(p);
              },
              className: "p-3 bg-blue-50/70 hover:bg-blue-100/70 rounded-xl border border-blue-100 cursor-pointer transition flex items-center justify-between",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-sm", children: "PLI" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-slate-900 text-sm", children: "Postal Life Insurance (Suraksha)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-700 font-medium", children: "₹76/₹1,000 Highest Bonus Rate in India" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 18, className: "text-slate-400" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              onClick: () => {
                const p = POSTAL_PRODUCTS.find((x) => x.code === "SCSS");
                if (p) setSelectedProduct(p);
              },
              className: "p-3 bg-amber-50/70 hover:bg-amber-100/70 rounded-xl border border-amber-100 cursor-pointer transition flex items-center justify-between",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-lg bg-amber-700 text-white flex items-center justify-center font-bold text-sm", children: "SCSS" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-slate-900 text-sm", children: "Senior Citizen Savings Scheme" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-800 font-medium", children: "8.2% Quarterly Guaranteed Pension Payout" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 18, className: "text-slate-400" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setShowCalculatorModal(true),
              className: "flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { size: 15 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Return Calculator" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setShowAssistantModal(true),
              className: "flex-1 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 15 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Help Me Choose" })
              ]
            }
          )
        ] })
      ] }) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-slate-900", children: "Explore Government Postal Schemes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs sm:text-sm text-slate-500", children: "Select a category or click on any product for eligibility and documentation" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar", children: categories.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setSelectedCategory(cat),
          className: `px-4 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition ${selectedCategory === cat ? "bg-red-700 text-white shadow-xs" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"}`,
          children: cat
        },
        cat
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredProducts.map((prod) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-white rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md transition flex flex-col justify-between overflow-hidden group",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md", children: prod.category }),
                prod.isPopular && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md", children: "★ Top Recommended" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-bold text-slate-900 group-hover:text-red-700 transition mb-1", children: prod.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 font-medium mb-4 line-clamp-2", children: prod.tagline }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50/60 border border-red-100 rounded-xl p-3.5 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500 font-medium", children: "Interest / Bonus Return" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-extrabold text-red-700", children: prod.interestRateOrBonus })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5 text-xs text-slate-600 mb-2", children: prod.keyBenefits.slice(0, 2).map((b, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14, className: "text-emerald-600 mt-0.5 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1", children: b })
              ] }, idx)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setSelectedProduct(prod),
                  className: "flex-1 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold transition",
                  children: "View Details"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => {
                    setInquiryProduct(prod.name);
                    setShowInquiryModal(true);
                  },
                  className: "flex-1 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Inquire / Apply" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 14 })
                  ]
                }
              )
            ] })
          ]
        },
        prod.id
      )) })
    ] }),
    selectedProduct && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 bg-gradient-to-r from-red-800 to-red-700 text-white flex items-start justify-between sticky top-0 z-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wider text-amber-200 font-semibold mb-1", children: selectedProduct.category }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl md:text-2xl font-bold", children: selectedProduct.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-100 mt-1", children: selectedProduct.tagline })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSelectedProduct(null),
            className: "p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 text-slate-800 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500 font-medium", children: "Interest / Bonus" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold text-red-700", children: selectedProduct.interestRateOrBonus })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500 font-medium", children: "Min Deposit / Sum" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold text-slate-900", children: selectedProduct.minInvestment })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500 font-medium", children: "Tax Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold text-emerald-700", children: selectedProduct.taxBenefits })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-slate-900 mb-1", children: "About This Scheme" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-600 leading-relaxed", children: selectedProduct.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-bold text-slate-900 mb-2 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { size: 16, className: "text-red-700" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Who Is Eligible?" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5 pl-2", children: selectedProduct.eligibility.map((el, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2 text-slate-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-700 font-bold", children: "•" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: el })
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-bold text-slate-900 mb-2 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileCheck, { size: 16, className: "text-red-700" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Required Documents" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5 pl-2", children: selectedProduct.requiredDocuments.map((doc, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2 text-slate-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 15, className: "text-emerald-600 shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: doc })
          ] }, i)) })
        ] }),
        selectedProduct.faqs && selectedProduct.faqs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-bold text-slate-900 mb-2 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleQuestionMark, { size: 16, className: "text-red-700" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Frequently Asked Questions" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5", children: selectedProduct.faqs.map((faq, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 p-3 rounded-lg border border-slate-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-slate-900 text-xs", children: faq.question }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-600 mt-1", children: faq.answer })
          ] }, i)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSelectedProduct(null),
            className: "px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl",
            children: "Close"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setInquiryProduct(selectedProduct.name);
              setSelectedProduct(null);
              setShowInquiryModal(true);
            },
            className: "px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 15 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Apply / Request Callback for ",
                selectedProduct.code
              ] })
            ]
          }
        )
      ] })
    ] }) }),
    showInquiryModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-slate-900", children: "Request Callback / Apply" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Your local beat postman or postal representative will assist you." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowInquiryModal(false), className: "text-slate-400 hover:text-slate-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
      ] }),
      inquirySuccess ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "my-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold flex items-center gap-2 text-emerald-900 mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18 }),
          " Request Submitted Successfully"
        ] }),
        inquirySuccess
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleInquirySubmit, className: "space-y-4 mt-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1", children: "Product of Interest" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: inquiryProduct,
              onChange: (e) => setInquiryProduct(e.target.value),
              className: "w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium",
              placeholder: "e.g. Sukanya Samriddhi, PLI Suraksha, RD"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1", children: "Your Full Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                required: true,
                value: inquiryName,
                onChange: (e) => setInquiryName(e.target.value),
                placeholder: "e.g. Rajendra Sharma",
                className: "w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-600"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1", children: "Mobile Number (10 Digits) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "tel",
                required: true,
                value: inquiryMobile,
                onChange: (e) => setInquiryMobile(e.target.value),
                placeholder: "e.g. 9829012345",
                className: "w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-600"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1", children: "Address / House No. & Sector" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: inquiryAddress,
              onChange: (e) => setInquiryAddress(e.target.value),
              placeholder: "e.g. 445 Keshavpura Sector 7, Kota",
              className: "w-full p-2.5 border border-slate-300 rounded-xl"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1", children: "Specific Requirement or Questions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              rows: 2,
              value: inquiryReq,
              onChange: (e) => setInquiryReq(e.target.value),
              placeholder: "e.g. Need information regarding daughter's age eligibility and doorstep document pickup.",
              className: "w-full p-2.5 border border-slate-300 rounded-xl text-xs"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1", children: "Preferred Mode of Contact" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: ["Phone Call", "WhatsApp", "Doorstep Visit"].map((mode) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setPreferredContact(mode),
              className: `py-2 px-2 text-xs font-medium rounded-lg border transition ${preferredContact === mode ? "bg-red-700 text-white border-red-700" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"}`,
              children: mode
            },
            mode
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-3 flex justify-end gap-2 border-t border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowInquiryModal(false),
              className: "px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              className: "px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-xl shadow-xs",
              children: "Submit Request"
            }
          )
        ] })
      ] })
    ] }) }),
    showTrackerModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-slate-900", children: "Track Inquiries & Account Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Enter your registered 10-digit mobile number" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowTrackerModal(false), className: "text-slate-400 hover:text-slate-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleTrackSubmit, className: "mt-4 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "tel",
            required: true,
            value: trackPhone,
            onChange: (e) => setTrackPhone(e.target.value),
            placeholder: "Enter 10-digit mobile number...",
            className: "flex-1 p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-600"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            className: "px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl",
            children: "Search Records"
          }
        )
      ] }),
      trackResult.searched && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 space-y-4 max-h-72 overflow-y-auto pr-1", children: [
        trackResult.customer ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-900 text-sm", children: trackResult.customer.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded", children: trackResult.customer.verificationStatus })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-slate-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Address:" }),
            " ",
            ((_a = trackResult.customer.address) == null ? void 0 : _a.fullAddress) || trackResult.customer.houseNo || "Not specified"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-slate-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Beat / Post Office:" }),
            " Beat ",
            trackResult.customer.beatNo || "2",
            ", ",
            trackResult.customer.officeId || "DADABARI_SO"
          ] }),
          trackResult.customer.products && trackResult.customer.products.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-800 block mb-1", children: "Active Accounts / Inquiries:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: trackResult.customer.products.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 bg-white rounded border border-slate-200 flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: p.productName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-red-700", children: p.status })
            ] }, i)) })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs", children: [
          "No verified customer record found for mobile ",
          trackPhone,
          ". You can submit a callback inquiry to get started."
        ] }),
        trackResult.inquiries && trackResult.inquiries.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "font-bold text-xs text-slate-700", children: "Submitted Web Inquiries:" }),
          trackResult.inquiries.map((inq) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                inq.ticketNumber,
                " (",
                inq.productInterested,
                ")"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-700", children: inq.status })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-500", children: inq.requirement }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-slate-400", children: [
              "Assigned To: ",
              inq.assignedStaffName
            ] })
          ] }, inq.id))
        ] })
      ] })
    ] }) }),
    showAssistantModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 20, className: "text-amber-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-slate-900", children: "Smart Postal Advisor" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowAssistantModal(false), className: "text-slate-400 hover:text-slate-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Select what describes your goal best for compliant, sovereign-guaranteed scheme recommendations:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5", children: [
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
        ].map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            onClick: () => {
              const p = POSTAL_PRODUCTS.find((x) => x.code === item.code);
              setShowAssistantModal(false);
              if (p) setSelectedProduct(p);
            },
            className: "p-3 bg-slate-50 hover:bg-red-50/60 border border-slate-200 hover:border-red-300 rounded-xl cursor-pointer transition text-left",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-slate-900 text-xs flex justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-700 font-bold text-[11px]", children: item.product })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-500 mt-1", children: item.reason })
            ]
          },
          idx
        )) })
      ] })
    ] }) }),
    showCalculatorModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { size: 20, className: "text-red-700" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-slate-900", children: "Postal Scheme Quick Estimator" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowCalculatorModal(false), className: "text-slate-400 hover:text-slate-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-4 text-xs text-slate-700", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3.5 bg-rose-50 border border-rose-200 rounded-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-rose-900 text-sm mb-1", children: "Sukanya Samriddhi (SSA) Estimate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Deposit ₹10,000 / year for 15 years (Total: ₹1,50,000):" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-extrabold text-rose-700 mt-1", children: "Approx ₹5,10,000 Maturity (100% Tax Free)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3.5 bg-blue-50 border border-blue-200 rounded-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-blue-900 text-sm mb-1", children: "PLI Suraksha (Whole Life) Estimate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Sum Assured ₹10,00,000 (Age 30, premium till age 60):" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-extrabold text-blue-800 mt-1", children: "Accrued Bonus: ₹22,80,000 + ₹10 Lakh Sum Assured = ₹32,80,000 Total Cover" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3.5 bg-amber-50 border border-amber-200 rounded-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-amber-900 text-sm mb-1", children: "MIS Monthly Income Estimate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Joint Deposit of ₹15,00,000 at 7.4% p.a.:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-extrabold text-amber-900 mt-1", children: "₹9,250 Regular Monthly Payout for 5 Years" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setShowCalculatorModal(false),
          className: "px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold",
          children: "Close"
        }
      ) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-white text-sm", children: "Dadabari Sub-Post Office & Beats CRM" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-500 mt-0.5", children: "Keshavpura Sector 2, 4, 6, 7 & Santoshi Nagar, Kota - 324009" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Sovereign Government Safety" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "AePS Doorstep Banking" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Aadhaar CELC Certified" })
      ] })
    ] }) })
  ] });
}
export {
  CustomerPortal as default
};
