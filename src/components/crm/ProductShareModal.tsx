import React, { useState, useEffect } from 'react';
import { Customer, ProductDefinition } from '../../types/models';
import { customerService, cleanPhoneNumber } from '../../services/customerService';
import { 
  X, Share2, Send, Phone, Copy, Check, Users, 
  CheckCircle2, Sparkles, Filter, Search, Building 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductDefinition;
  preselectedProduct?: ProductDefinition;
  onSuccess?: () => void;
}

export default function ProductShareModal({ isOpen, onClose, product, preselectedProduct, onSuccess }: Props) {
  const currentProduct = product || preselectedProduct;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedBeat, setSelectedBeat] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [mode, setMode] = useState<'individual' | 'multi'>('individual');
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load customers
  useEffect(() => {
    setCustomers(customerService.getCustomers());
  }, [isOpen]);

  // Generate standard pre-filled product details message
  const generateBrochureMessage = (custName?: string) => {
    if (!currentProduct) return '';
    const greeting = custName ? `नमस्ते ${custName} जी,` : 'नमस्ते,';
    const benefitsList = currentProduct.keyBenefits?.slice(0, 3).map(b => `• ${b}`).join('\n') || '';
    const docsList = currentProduct.requiredDocuments?.slice(0, 3).map(d => `• ${d}`).join('\n') || '';

    return `🇮🇳 *भारतीय डाक विभाग - आधिकारिक योजना विवरण*\n\n${greeting}\n\n✨ *${currentProduct.name}* (${currentProduct.code})\n📢 *टैगलाइन:* ${currentProduct.tagline}\n\n💰 *ब्याज दर / लाभ:* ${currentProduct.interestRateOrBonus}\n🛡️ *सुरक्षा:* भारत सरकार द्वारा 100% संप्रभु गारंटी\n🔖 *कर लाभ:* ${currentProduct.taxBenefits}\n\n📌 *मुख्य विशेषताएं:*\n${benefitsList}\n\n📋 *आवश्यक दस्तावेज:*\n${docsList}\n\n🏠 *डोरस्टेप सेवा व खाता खोलने हेतु संपर्क करें:*\n📍 दादाबाड़ी उपडाकघर (Dadabari SO, Kota - 324009)\n📞 संपर्क: आपका बीट डाकिया / 0744-2500123\n🌐 India Post: https://www.indiapost.gov.in`;
  };

  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    if (currentProduct) {
      setCustomMessage(generateBrochureMessage());
    }
  }, [currentProduct]);

  if (!currentProduct) return null;

  if (!isOpen) return null;

  // Filtered customer list
  const filteredCustomers = customers.filter(c => {
    const s = searchQuery.toLowerCase();
    const matchesSearch = !s ||
      (c.name && c.name.toLowerCase().includes(s)) ||
      (c.mobile && c.mobile.includes(s)) ||
      (c.houseNo && c.houseNo.toLowerCase().includes(s));
    const matchesBeat = selectedBeat === 'All' || c.beatNo === selectedBeat;
    return matchesSearch && matchesBeat;
  });

  const handleToggleCustomer = (id: string) => {
    if (mode === 'individual') {
      setSelectedCustomerIds([id]);
      const cust = customers.find(c => c.id === id || c.masterId === id);
      if (cust) {
        setCustomMessage(generateBrochureMessage(cust.name));
      }
    } else {
      if (selectedCustomerIds.includes(id)) {
        setSelectedCustomerIds(selectedCustomerIds.filter(i => i !== id));
      } else {
        setSelectedCustomerIds([...selectedCustomerIds, id]);
      }
    }
  };

  const handleSelectAllInBeat = () => {
    const ids = filteredCustomers.slice(0, 50).map(c => c.id || c.masterId || '');
    setSelectedCustomerIds(ids);
  };

  const handleDeselectAll = () => {
    setSelectedCustomerIds([]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // WhatsApp send
  const handleShareWhatsApp = () => {
    if (selectedCustomerIds.length === 1) {
      const cust = customers.find(c => c.id === selectedCustomerIds[0] || c.masterId === selectedCustomerIds[0]);
      const phone = cleanPhoneNumber(cust?.whatsapp || cust?.mobile);
      if (!phone) {
        alert('चयनित ग्राहक का मान्य मोबाइल नंबर उपलब्ध नहीं है!');
        return;
      }
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(customMessage)}`;
      window.open(url, '_blank');

      customerService.addCommunicationLog({
        recipientName: cust?.name || 'Customer',
        mobile: cust?.mobile || phone,
        channel: 'WhatsApp',
        type: `Scheme: ${product.code}`,
        content: customMessage,
        status: 'Delivered',
        beatNo: cust?.beatNo || '2',
        customerId: cust?.id || cust?.masterId,
        productCode: product.code
      });
      setStatusMessage(`योजना विवरण WhatsApp पर ${cust?.name} को प्रेषित किया गया!`);
    } else {
      // General WhatsApp share intent
      const url = `https://wa.me/?text=${encodeURIComponent(customMessage)}`;
      window.open(url, '_blank');
      setStatusMessage('WhatsApp शेयर विंडो सफलतापूर्वक खोल दी गई!');
    }

    setTimeout(() => {
      setStatusMessage(null);
      if (onSuccess) onSuccess();
    }, 2500);
  };

  // Native SMS
  const handleShareSMS = () => {
    if (selectedCustomerIds.length === 1) {
      const cust = customers.find(c => c.id === selectedCustomerIds[0] || c.masterId === selectedCustomerIds[0]);
      const rawMobile = cust?.mobile;
      if (!rawMobile) {
        alert('मोबाइल नंबर उपलब्ध नहीं है!');
        return;
      }
      window.open(`sms:${rawMobile}?body=${encodeURIComponent(customMessage)}`, '_self');
      customerService.addCommunicationLog({
        recipientName: cust?.name || 'Customer',
        mobile: rawMobile,
        channel: 'SMS',
        type: `Scheme: ${product.code}`,
        content: customMessage,
        status: 'Sent',
        beatNo: cust?.beatNo || '2',
        customerId: cust?.id || cust?.masterId,
        productCode: product.code
      });
      setStatusMessage(`SMS ऐप्लिकेशन लोड किया गया!`);
    } else {
      window.open(`sms:?body=${encodeURIComponent(customMessage)}`, '_self');
      setStatusMessage('SMS ऐप्लिकेशन ट्रिगर किया गया!');
    }

    setTimeout(() => setStatusMessage(null), 2500);
  };

  // Copy Broadcast Phone Numbers
  const handleCopyBroadcastNumbers = () => {
    const numbers = selectedCustomerIds
      .map(id => customers.find(c => c.id === id || c.masterId === id)?.mobile)
      .filter(Boolean);

    if (numbers.length === 0) {
      alert('कृपया कम से कम एक ग्राहक चुनें!');
      return;
    }

    navigator.clipboard.writeText(numbers.join(', '));
    setStatusMessage(`${numbers.length} ग्राहकों के नंबर क्लिपबोर्ड में कॉपी कर लिए गए!`);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-800 to-rose-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-bold">
              <Share2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Share Product / Postal Scheme</h3>
                <span className="text-[11px] font-mono font-bold bg-white text-red-800 px-2 py-0.5 rounded">
                  {product.code}
                </span>
              </div>
              <p className="text-xs text-rose-100">
                Multi-Channel Customer Sharing via WhatsApp, SMS & Broadcast Queue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition text-white/80 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className="bg-emerald-600 text-white px-5 py-2 text-xs font-semibold flex items-center gap-2 transition">
            <CheckCircle2 size={15} />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Product Overview Card */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {product.category}
              </span>
              <h4 className="font-bold text-slate-900 text-base">{product.name}</h4>
              <p className="text-xs text-slate-600 mt-0.5">{product.tagline}</p>
            </div>
            <div className="sm:text-right shrink-0">
              <span className="text-[11px] text-slate-500 block">Sovereign Interest / Bonus</span>
              <span className="text-base font-black text-red-700">{product.interestRateOrBonus}</span>
            </div>
          </div>

          {/* Customer Selection Section */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Users size={14} className="text-red-700" />
                <span>Select Target Customer / Beat Recipients</span>
              </label>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setMode('individual')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    mode === 'individual' ? 'bg-red-700 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Single Customer
                </button>
                <button
                  type="button"
                  onClick={() => setMode('multi')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    mode === 'multi' ? 'bg-red-700 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Multi / Beat Broadcast
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2 relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customer by name, phone or house..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>
              <div>
                <select
                  value={selectedBeat}
                  onChange={(e) => setSelectedBeat(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
                >
                  <option value="All">All Beats (Dadabari SO)</option>
                  <option value="1">Beat 1 (Dadabari Circle)</option>
                  <option value="2">Beat 2 (Keshavpura / Santoshi Nagar)</option>
                  <option value="6">Beat 6 (Keshavpura Sec 4 & 2)</option>
                  <option value="Mandaliya">Mandaliya B.O.</option>
                </select>
              </div>
            </div>

            {/* Quick Multi selection tools */}
            {mode === 'multi' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 font-medium">
                  Selected: <strong className="text-slate-900">{selectedCustomerIds.length}</strong> recipients
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllInBeat}
                    className="text-red-700 font-bold hover:underline"
                  >
                    Select All in Beat
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            {/* Customer List Scrollbox */}
            <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
              {filteredCustomers.slice(0, 35).map(c => {
                const isSelected = selectedCustomerIds.includes(c.id || c.masterId || '');
                return (
                  <div
                    key={c.id || c.masterId}
                    onClick={() => handleToggleCustomer(c.id || c.masterId || '')}
                    className={`p-2.5 flex items-center justify-between cursor-pointer transition text-xs ${
                      isSelected ? 'bg-red-50/80 font-semibold text-red-950' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type={mode === 'individual' ? 'radio' : 'checkbox'}
                        checked={isSelected}
                        onChange={() => {}}
                        className="text-red-700 focus:ring-red-600 rounded"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-[11px] text-slate-400">
                          H.No {c.houseNo || 'NA'}, {c.sector ? `Sec ${c.sector}` : c.area || 'Dadabari'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-slate-700">{c.mobile || 'No Mobile'}</div>
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 rounded text-slate-500">
                        Beat {c.beatNo || '2'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pre-filled Message Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                <span>Custom Share Message / Brochure Text (सम्पादन करें)</span>
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-red-700 hover:text-red-900 font-semibold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded border border-red-200"
              >
                {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span>{copied ? 'Copied!' : 'Copy Brochure'}</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50/60 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none font-sans leading-relaxed text-slate-900"
            />
          </div>

        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {mode === 'multi' ? (
            <button
              type="button"
              onClick={handleCopyBroadcastNumbers}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition flex items-center gap-1.5"
            >
              <Copy size={14} />
              <span>Copy {selectedCustomerIds.length} Mobile Numbers</span>
            </button>
          ) : (
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Building size={14} className="text-slate-400" />
              <span>Dadabari SO Direct Channel</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareSMS}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <Phone size={14} />
              <span>Share via SMS</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Send size={14} />
              <span>Share on WhatsApp</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
