import { r as reactExports, aa as POSTAL_PRODUCTS, b as customerService, j as jsxRuntimeExports, ab as Share2, X, C as CircleCheck, U as Users, S as Search, I as Sparkles, Y as Check, ac as Copy, p as Building, n as Phone, ad as Send, ae as cleanPhoneNumber, af as Briefcase, ag as ArrowRight, ah as Calculator } from "./index-u5ATSoh6.js";
function ProductShareModal({ isOpen, onClose, product, preselectedProduct, onSuccess }) {
  const initialProduct = product || preselectedProduct || POSTAL_PRODUCTS[0];
  const [selectedProductCode, setSelectedProductCode] = reactExports.useState((initialProduct == null ? void 0 : initialProduct.code) || POSTAL_PRODUCTS[0].code);
  reactExports.useEffect(() => {
    const incoming = product || preselectedProduct;
    if (incoming == null ? void 0 : incoming.code) {
      setSelectedProductCode(incoming.code);
    }
  }, [product, preselectedProduct, isOpen]);
  const currentProduct = POSTAL_PRODUCTS.find((p) => p.code === selectedProductCode) || product || preselectedProduct || POSTAL_PRODUCTS[0];
  const [customers, setCustomers] = reactExports.useState([]);
  const [selectedBeat, setSelectedBeat] = reactExports.useState("All");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [selectedCustomerIds, setSelectedCustomerIds] = reactExports.useState([]);
  const [mode, setMode] = reactExports.useState("individual");
  const [copied, setCopied] = reactExports.useState(false);
  const [statusMessage, setStatusMessage] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (isOpen) {
      setCustomers(customerService.getCustomers());
    }
  }, [isOpen]);
  const generateBrochureMessage = (custName, prod = currentProduct) => {
    var _a, _b;
    if (!prod) return "";
    const greeting = custName ? `नमस्ते ${custName} जी,` : "नमस्ते,";
    const benefitsList = ((_a = prod.keyBenefits) == null ? void 0 : _a.slice(0, 3).map((b) => `• ${b}`).join("\n")) || "";
    const docsList = ((_b = prod.requiredDocuments) == null ? void 0 : _b.slice(0, 3).map((d) => `• ${d}`).join("\n")) || "";
    const portalUrl = typeof window !== "undefined" ? window.location.origin : "https://www.indiapost.gov.in";
    return `🇮🇳 *भारतीय डाक विभाग - आधिकारिक योजना विवरण*

${greeting}

✨ *${prod.name}* (${prod.code})
📢 *टैगलाइन:* ${prod.tagline}

💰 *ब्याज दर / लाभ:* ${prod.interestRateOrBonus}
🛡️ *सुरक्षा:* भारत सरकार द्वारा 100% संप्रभु गारंटी
🔖 *कर लाभ:* ${prod.taxBenefits}

📌 *मुख्य विशेषताएं:*
${benefitsList}

📋 *आवश्यक दस्तावेज:*
${docsList}

🏠 *डोरस्टेप सेवा व खाता खोलने हेतु संपर्क करें:*
🌐 पोर्टल लिंक: ${portalUrl}`;
  };
  const [customMessage, setCustomMessage] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (currentProduct) {
      const selectedCust = selectedCustomerIds.length === 1 ? customers.find((c) => c.id === selectedCustomerIds[0] || c.masterId === selectedCustomerIds[0]) : void 0;
      setCustomMessage(generateBrochureMessage(selectedCust == null ? void 0 : selectedCust.name, currentProduct));
    }
  }, [currentProduct]);
  if (!isOpen || !currentProduct) return null;
  const filteredCustomers = customers.filter((c) => {
    const s = searchQuery.toLowerCase();
    const matchesSearch = !s || c.name && c.name.toLowerCase().includes(s) || c.mobile && c.mobile.includes(s) || c.houseNo && c.houseNo.toLowerCase().includes(s);
    const matchesBeat = selectedBeat === "All" || c.beatNo === selectedBeat;
    return matchesSearch && matchesBeat;
  });
  const handleToggleCustomer = (id) => {
    if (mode === "individual") {
      setSelectedCustomerIds([id]);
      const cust = customers.find((c) => c.id === id || c.masterId === id);
      if (cust) {
        setCustomMessage(generateBrochureMessage(cust.name, currentProduct));
      }
    } else {
      if (selectedCustomerIds.includes(id)) {
        setSelectedCustomerIds(selectedCustomerIds.filter((i) => i !== id));
      } else {
        setSelectedCustomerIds([...selectedCustomerIds, id]);
      }
    }
  };
  const handleSelectAllInBeat = () => {
    const ids = filteredCustomers.slice(0, 50).map((c) => c.id || c.masterId || "");
    setSelectedCustomerIds(ids);
  };
  const handleDeselectAll = () => {
    setSelectedCustomerIds([]);
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  const handleShareWhatsApp = () => {
    if (selectedCustomerIds.length === 1) {
      const cust = customers.find((c) => c.id === selectedCustomerIds[0] || c.masterId === selectedCustomerIds[0]);
      const phone = cleanPhoneNumber((cust == null ? void 0 : cust.whatsapp) || (cust == null ? void 0 : cust.mobile));
      if (!phone) {
        setStatusMessage("चयनित ग्राहक का मान्य मोबाइल नंबर उपलब्ध नहीं है!");
        return;
      }
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(customMessage)}`;
      window.open(url, "_blank");
      customerService.addCommunicationLog({
        recipientName: (cust == null ? void 0 : cust.name) || "Customer",
        mobile: (cust == null ? void 0 : cust.mobile) || phone,
        channel: "WhatsApp",
        type: `Scheme: ${currentProduct.code}`,
        content: customMessage,
        status: "Delivered",
        beatNo: (cust == null ? void 0 : cust.beatNo) || "2",
        customerId: (cust == null ? void 0 : cust.id) || (cust == null ? void 0 : cust.masterId),
        productCode: currentProduct.code
      });
      setStatusMessage(`योजना विवरण WhatsApp पर ${cust == null ? void 0 : cust.name} को प्रेषित किया गया!`);
    } else {
      const url = `https://wa.me/?text=${encodeURIComponent(customMessage)}`;
      window.open(url, "_blank");
      setStatusMessage("WhatsApp शेयर विंडो सफलतापूर्वक खोल दी गई!");
    }
    setTimeout(() => {
      setStatusMessage(null);
      if (onSuccess) onSuccess();
    }, 2500);
  };
  const handleShareSMS = () => {
    if (selectedCustomerIds.length === 1) {
      const cust = customers.find((c) => c.id === selectedCustomerIds[0] || c.masterId === selectedCustomerIds[0]);
      const rawMobile = cust == null ? void 0 : cust.mobile;
      if (!rawMobile) {
        setStatusMessage("मोबाइल नंबर उपलब्ध नहीं है!");
        return;
      }
      window.open(`sms:${rawMobile}?body=${encodeURIComponent(customMessage)}`, "_self");
      customerService.addCommunicationLog({
        recipientName: (cust == null ? void 0 : cust.name) || "Customer",
        mobile: rawMobile,
        channel: "SMS",
        type: `Scheme: ${currentProduct.code}`,
        content: customMessage,
        status: "Sent",
        beatNo: (cust == null ? void 0 : cust.beatNo) || "2",
        customerId: (cust == null ? void 0 : cust.id) || (cust == null ? void 0 : cust.masterId),
        productCode: currentProduct.code
      });
      setStatusMessage(`SMS ऐप्लिकेशन लोड किया गया!`);
    } else {
      window.open(`sms:?body=${encodeURIComponent(customMessage)}`, "_self");
      setStatusMessage("SMS ऐप्लिकेशन ट्रिगर किया गया!");
    }
    setTimeout(() => setStatusMessage(null), 2500);
  };
  const handleCopyBroadcastNumbers = () => {
    const numbers = selectedCustomerIds.map((id) => {
      var _a;
      return (_a = customers.find((c) => c.id === id || c.masterId === id)) == null ? void 0 : _a.mobile;
    }).filter(Boolean);
    if (numbers.length === 0) {
      setStatusMessage("कृपया कम से कम एक ग्राहक चुनें!");
      return;
    }
    navigator.clipboard.writeText(numbers.join(", "));
    setStatusMessage(`${numbers.length} ग्राहकों के नंबर क्लिपबोर्ड में कॉपी कर लिए गए!`);
    setTimeout(() => setStatusMessage(null), 2500);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 bg-gradient-to-r from-red-800 to-rose-700 text-white flex items-center justify-between shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-bold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { size: 20 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold", children: "Share Product / Postal Scheme" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-mono font-bold bg-white text-red-800 px-2 py-0.5 rounded", children: currentProduct.code })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-rose-100", children: "Multi-Channel Customer Sharing via WhatsApp, SMS & Broadcast Queue" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onClose,
          className: "p-2 hover:bg-white/10 rounded-full transition text-white/80 hover:text-white cursor-pointer",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 })
        }
      )
    ] }),
    statusMessage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-emerald-600 text-white px-5 py-2 text-xs font-semibold flex items-center gap-2 transition", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 15 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: statusMessage })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 overflow-y-auto space-y-4 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-slate-700", children: "Select Postal Scheme to Share:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: currentProduct.code,
              onChange: (e) => setSelectedProductCode(e.target.value),
              className: "px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600",
              children: POSTAL_PRODUCTS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: p.code, children: [
                p.name,
                " (",
                p.interestRateOrBonus,
                ")"
              ] }, p.code))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400", children: currentProduct.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-slate-900 text-base", children: currentProduct.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-600 mt-0.5", children: currentProduct.tagline })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:text-right shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-500 block", children: "Sovereign Interest / Bonus" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-black text-red-700", children: currentProduct.interestRateOrBonus })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-bold text-slate-800 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 14, className: "text-red-700" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Select Target Customer / Beat Recipients" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setMode("individual"),
                className: `px-2.5 py-1 rounded-lg font-semibold transition ${mode === "individual" ? "bg-red-700 text-white" : "bg-slate-100 text-slate-700"}`,
                children: "Single Customer"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setMode("multi"),
                className: `px-2.5 py-1 rounded-lg font-semibold transition ${mode === "multi" ? "bg-red-700 text-white" : "bg-slate-100 text-slate-700"}`,
                children: "Multi / Beat Broadcast"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14, className: "absolute left-3 top-2.5 text-slate-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                placeholder: "Search customer by name, phone or house...",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className: "w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: selectedBeat,
              onChange: (e) => setSelectedBeat(e.target.value),
              className: "w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "All", children: "All Beats (Dadabari SO)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "1", children: "Beat 1 (Dadabari Circle)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "2", children: "Beat 2 (Keshavpura / Santoshi Nagar)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "6", children: "Beat 6 (Keshavpura Sec 4 & 2)" })
              ]
            }
          ) })
        ] }),
        mode === "multi" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-500 font-medium", children: [
            "Selected: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-slate-900", children: selectedCustomerIds.length }),
            " recipients"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: handleSelectAllInBeat,
                className: "text-red-700 font-bold hover:underline",
                children: "Select All in Beat"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-300", children: "|" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: handleDeselectAll,
                className: "text-slate-500 hover:text-slate-700",
                children: "Clear Selection"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-36 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white", children: filteredCustomers.slice(0, 35).map((c) => {
          const isSelected = selectedCustomerIds.includes(c.id || c.masterId || "");
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              onClick: () => handleToggleCustomer(c.id || c.masterId || ""),
              className: `p-2.5 flex items-center justify-between cursor-pointer transition text-xs ${isSelected ? "bg-red-50/80 font-semibold text-red-950" : "hover:bg-slate-50 text-slate-700"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: mode === "individual" ? "radio" : "checkbox",
                      checked: isSelected,
                      onChange: () => {
                      },
                      className: "text-red-700 focus:ring-red-600 rounded"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-900", children: c.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-400", children: [
                      "H.No ",
                      c.houseNo || "NA",
                      ", ",
                      c.sector ? `Sec ${c.sector}` : c.area || "Dadabari"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-slate-700", children: c.mobile || "No Mobile" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] px-1.5 py-0.2 bg-slate-100 rounded text-slate-500", children: [
                    "Beat ",
                    c.beatNo || "2"
                  ] })
                ] })
              ]
            },
            c.id || c.masterId
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-bold text-slate-800 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 14, className: "text-amber-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Custom Share Message / Brochure Text (सम्पादन करें)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: handleCopy,
              className: "text-xs text-red-700 hover:text-red-900 font-semibold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded border border-red-200",
              children: [
                copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 12, className: "text-emerald-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 12 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: copied ? "Copied!" : "Copy Brochure" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            rows: 6,
            value: customMessage,
            onChange: (e) => setCustomMessage(e.target.value),
            className: "w-full p-3 text-xs bg-slate-50/60 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none font-sans leading-relaxed text-slate-900"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0", children: [
      mode === "multi" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: handleCopyBroadcastNumbers,
          className: "px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition flex items-center gap-1.5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 14 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Copy ",
              selectedCustomerIds.length,
              " Mobile Numbers"
            ] })
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-slate-500 flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { size: 14, className: "text-slate-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Dadabari SO Direct Channel" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: handleShareSMS,
            className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 14 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Share via SMS" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: handleShareWhatsApp,
            className: "px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 14 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Share on WhatsApp" })
            ]
          }
        )
      ] })
    ] })
  ] }) });
}
function ServicesCatalogView({ onSelectProductForLead }) {
  const [selectedProduct, setSelectedProduct] = reactExports.useState(POSTAL_PRODUCTS[0]);
  const [sharingProduct, setSharingProduct] = reactExports.useState(null);
  const [showShareModal, setShowShareModal] = reactExports.useState(false);
  const [calcAmount, setCalcAmount] = reactExports.useState(5e4);
  const [calcYears, setCalcYears] = reactExports.useState(5);
  const calculateReturn = () => {
    if (selectedProduct.code === "SSA") {
      const totalDep = calcAmount * 15;
      const approxMaturity = calcAmount * 15 * 3.4;
      return {
        type: "Sukanya Samriddhi Maturity (21 Yrs)",
        invested: totalDep,
        maturity: Math.round(approxMaturity),
        taxBenefit: "100% Tax Free (Triple EEE)"
      };
    } else if (selectedProduct.code === "PPF") {
      const approxMaturity = calcAmount * calcYears * 1.7;
      return {
        type: "PPF Maturity",
        invested: calcAmount * calcYears,
        maturity: Math.round(approxMaturity),
        taxBenefit: "Exempt under 80C + Tax Free Returns"
      };
    } else if (selectedProduct.code === "SCSS") {
      const quarterlyPayout = calcAmount * 0.082 / 4;
      return {
        type: "Senior Citizen Regular Quarterly Payout",
        invested: calcAmount,
        maturity: Math.round(quarterlyPayout * 20),
        regularPayout: Math.round(quarterlyPayout),
        taxBenefit: "Section 80C Deduction"
      };
    } else if (selectedProduct.code === "MIS") {
      const monthlyPayout = calcAmount * 0.074 / 12;
      return {
        type: "Monthly Income Scheme (5 Years)",
        invested: calcAmount,
        maturity: calcAmount,
        monthlyPayout: Math.round(monthlyPayout),
        taxBenefit: "Direct credit to Savings Account"
      };
    } else {
      return {
        type: "Government Sovereign Small Savings",
        invested: calcAmount,
        maturity: Math.round(calcAmount * 1.4),
        taxBenefit: "Guaranteed by Govt of India"
      };
    }
  };
  const calcResult = calculateReturn();
  const handleContactClick = (productName) => {
    const message = `Namaste! I am interested in knowing more about [Product: ${productName}]. Can you please provide more details?`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", id: "services-catalog-view-root", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold text-slate-900 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { size: 22, className: "text-red-700" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Postal Services & Financial Products Catalog" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Complete Small Savings, Postal Life Insurance, IPPB Banking & Aadhaar Doorstep Services" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-5 space-y-3", children: POSTAL_PRODUCTS.map((prod) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          onClick: () => setSelectedProduct(prod),
          className: `p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${selectedProduct.id === prod.id ? "bg-red-50/70 border-red-400 shadow-xs" : "bg-white border-slate-200 hover:border-slate-300"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-900 text-sm", children: prod.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-mono font-bold bg-white text-red-700 px-2 py-0.5 rounded border border-red-200", children: prod.code })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500 mt-1", children: prod.category }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-red-700 mt-1", children: prod.interestRateOrBonus })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: (e) => {
                    e.stopPropagation();
                    setSharingProduct(prod);
                    setShowShareModal(true);
                  },
                  className: "p-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 rounded-lg border border-slate-200 transition",
                  title: `Share ${prod.name} via WhatsApp / SMS`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { size: 14 })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 18, className: selectedProduct.id === prod.id ? "text-red-700" : "text-slate-300" })
            ] })
          ]
        },
        prod.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-7 space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase font-bold text-slate-400", children: selectedProduct.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-black text-slate-900 mt-0.5", children: selectedProduct.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-600 font-medium mt-1", children: selectedProduct.tagline })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-slate-500 font-medium block", children: "Interest / Bonus" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-black text-red-700", children: selectedProduct.interestRateOrBonus })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 block font-medium", children: "Min Deposit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-900", children: selectedProduct.minInvestment })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 block font-medium", children: "Max Limit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-900", children: selectedProduct.maxInvestment || "No limit" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 block font-medium", children: "Tax Benefit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-emerald-700", children: selectedProduct.taxBenefits })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-slate-900 text-xs uppercase tracking-wider mb-2", children: "Description & Objectives" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-600 leading-relaxed", children: selectedProduct.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-slate-900 text-xs uppercase tracking-wider mb-2", children: "Key Customer Benefits" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5 text-xs text-slate-700", children: selectedProduct.keyBenefits.map((b, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14, className: "text-emerald-600 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: b })
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-slate-900 text-xs uppercase tracking-wider mb-2", children: "Eligibility Rules" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1 text-xs text-slate-600 list-disc pl-4", children: selectedProduct.eligibility.map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: e }, i)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-slate-900 text-white rounded-xl space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold flex items-center gap-1.5 text-amber-300", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { size: 15 }),
              " Interactive Returns Calculator"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-slate-400 font-mono", children: selectedProduct.code })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-slate-300 mb-1", children: "Annual / Lump-Sum Amount (₹)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  value: calcAmount,
                  onChange: (e) => setCalcAmount(Number(e.target.value)),
                  className: "w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-slate-300 mb-1", children: "Tenure (Years)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  value: calcYears,
                  onChange: (e) => setCalcYears(Number(e.target.value)),
                  className: "w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-slate-800/90 rounded-lg border border-slate-700 text-xs space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-slate-400", children: calcResult.type }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-base font-black text-amber-400", children: [
              "Estimated Value: ₹",
              calcResult.maturity.toLocaleString("en-IN")
            ] }),
            calcResult.monthlyPayout && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-emerald-400 font-semibold", children: [
              "Monthly Payout: ₹",
              calcResult.monthlyPayout.toLocaleString("en-IN"),
              " / month"
            ] }),
            calcResult.regularPayout && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-emerald-400 font-semibold", children: [
              "Quarterly Pension Payout: ₹",
              calcResult.regularPayout.toLocaleString("en-IN"),
              " / quarter"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-400", children: [
              "Tax Note: ",
              calcResult.taxBenefit
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 mt-4 border-t border-slate-100 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => {
                setSharingProduct(selectedProduct);
                setShowShareModal(true);
              },
              className: "flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2",
              id: "share-selected-product-btn",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { size: 16 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Share Product (WhatsApp / SMS / Broadcast)" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => handleContactClick(selectedProduct.name),
              className: "px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition",
              children: "Inquiry"
            }
          )
        ] })
      ] }) })
    ] }),
    showShareModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ProductShareModal,
      {
        isOpen: showShareModal,
        onClose: () => {
          setShowShareModal(false);
          setSharingProduct(null);
        },
        preselectedProduct: sharingProduct || selectedProduct
      }
    )
  ] });
}
export {
  ServicesCatalogView as default
};
