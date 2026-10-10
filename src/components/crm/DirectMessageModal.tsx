import React, { useState, useEffect } from 'react';
import { Customer, ProductDefinition } from '../../types/models';
import { customerService, cleanPhoneNumber } from '../../services/customerService';
import { 
  X, Send, MessageSquare, Phone, MapPin, Check, Copy, 
  ExternalLink, Sparkles, User, FileText, CheckCircle2, 
  Share2, ArrowRight, ShieldCheck, RefreshCw 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialCustomer?: Customer | null;
  initialProduct?: ProductDefinition | null;
  initialMessage?: string;
  initialTemplateKey?: string;
  onSuccess?: () => void;
}

export interface PresetTemplate {
  id: string;
  title: string;
  category: string;
  icon: string;
  generateText: (custName: string, beatNo: string, productTitle?: string) => string;
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'parcel_ready',
    title: '📦 पार्सल डिलीवरी सूचना (Parcel Out for Delivery)',
    category: 'Delivery',
    icon: '📦',
    generateText: (custName, beatNo) => 
      `🇮🇳 *भारतीय डाक - वितरण सूचना (India Post Alert)*\n\nनमस्ते ${custName || 'आदरणीय ग्राहक'},\nआपका स्पीड पोस्ट / रजिस्टर्ड पार्सल वितरण हेतु डाककर्मी द्वारा बीट ${beatNo || '2'} क्षेत्र में ले जाया जा रहा है। कृपया अपना वैध पहचान पत्र तैयार रखें।\n\n📍 *वितरण कार्यालय:* दादाबाड़ी उपडाकघर (Dadabari SO, Kota - 324009)\n📞 संपर्क: बीट डाकिया / 0744-2500123`
  },
  {
    id: 'sukanya_reminder',
    title: '👧 सुकन्या समृद्धि योजना (SSA) वार्षिक अंशदान सूचना',
    category: 'Savings',
    icon: '👧',
    generateText: (custName, beatNo) => 
      `🌸 *सुकन्या समृद्धि योजना (SSA) - डाकघर विशेष सूचना*\n\nनमस्ते ${custName || 'अभिभावक महोदय'},\nअपनी बिटिया के उज्ज्वल भविष्य के लिए चालू वित्तीय वर्ष का अंशदान डाकघर में जमा करवाएं और पाएं *8.2% की उच्चतम ब्याज दर* (100% टैक्स फ्री EEE)।\n\n✅ डाकिया आपके द्वार पर भी पासबुक प्रविष्टि एवं राशि संग्रहण हेतु उपलब्ध है (बीट ${beatNo || '2'}).\n📍 *दादाबाड़ी उपडाकघर, कोटा (324009)*`
  },
  {
    id: 'pli_renewal',
    title: '🛡️ डाक जीवन बीमा (PLI / RPLI) प्रीमियम नवीनीकरण',
    category: 'Insurance',
    icon: '🛡️',
    generateText: (custName) => 
      `🛡️ *डाक जीवन बीमा (Postal Life Insurance) सूचना*\n\nनमस्ते ${custName || 'पॉलिसी धारक'},\nआपकी डाक जीवन बीमा (PLI/RPLI) पॉलिसी का मासिक/तिमाही प्रीमियम देय है। पॉलिसी चालू रखने तथा अधिकतम सरकारी बोनस प्राप्त करने हेतु समय पर प्रीमियम जमा कराएं।\n\n💳 आप नजदीकी डाकघर, डाकिया या IPPB मोबाइल ऐप द्वारा भी भुगतान कर सकते हैं।\n📍 *दादाबाड़ी उपडाकघर कोटा*`
  },
  {
    id: 'aadhaar_camp',
    title: '🆔 डोरस्टेप आधार एवं मोबाइल लिंकिंग शिविर',
    category: 'Aadhaar',
    icon: '🆔',
    generateText: (custName, beatNo) => 
      `📋 *घर बैठे आधार सेवा - भारतीय डाक (India Post)*\n\nनमस्ते ${custName || 'निवासी'},\nडाक विभाग द्वारा आपके क्षेत्र (बीट ${beatNo || '2'}) में डोरस्टेप आधार मोबाइल अपडेशन एवं 0-5 वर्ष के बच्चों के नवीन आधार (CELC) नामांकन की विशेष सुविधा उपलब्ध है।\n\n📌 आवश्यक दस्तावेज: केवल आधार कार्ड / जन्म प्रमाण पत्र।\n📞 संपर्क: बीट डाकिया (दादाबाड़ी उपडाकघर)`
  },
  {
    id: 'ippb_doorstep',
    title: '🏦 IPPB डिजिटल बचत खाता व आधार एटीएम (AePS)',
    category: 'Banking',
    icon: '🏦',
    generateText: (custName) => 
      `🏦 *इंडिया पोस्ट पेमेंट्स बैंक (IPPB) - आपका बैंक आपके द्वार*\n\nनमस्ते ${custName || 'ग्राहक'},\nअब बैंक जाने की जरूरत नहीं! डाकिया आपके घर पर बायोमेट्रिक द्वारा किसी भी बैंक से नकद निकासी (AePS आधार पे) एवं 5 मिनट में जीरो बैलेंस डिजिटल खाता खोलने हेतु उपलब्ध है।\n\n📍 *दादाबाड़ी उपडाकघर, कोटा (324009)*`
  },
  {
    id: 'scss_mis',
    title: '💰 वरिष्ठ नागरिक बचत योजना (SCSS) / MIS 8.2% ब्याज',
    category: 'Investment',
    icon: '💰',
    generateText: (custName) => 
      `🪙 *सुरक्षित सरकारी बचत योजनाएं (8.2% ब्याज दर)*\n\nनमस्ते ${custName || 'आदरणीय'},\nवरिष्ठ नागरिकों के लिए डाकघर की SCSS योजना में पाएं 8.2% त्रैमासिक पेंशन एवं MIS में मासिक सुनिश्चित आय। 100% भारत सरकार द्वारा सुरक्षित।\n\n📍 संपर्क करें: दादाबाड़ी उपडाकघर, कोटा`
  }
];

export default function DirectMessageModal({
  isOpen,
  onClose,
  initialCustomer,
  initialProduct,
  initialMessage,
  initialTemplateKey = 'parcel_ready',
  onSuccess
}: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialCustomer?.id || initialCustomer?.masterId || '');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedBeat, setSelectedBeat] = useState<string>('All');
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>(initialTemplateKey);
  const [messageText, setMessageText] = useState<string>(initialMessage || '');
  const [copied, setCopied] = useState(false);
  const [dispatchedNotice, setDispatchedNotice] = useState<string | null>(null);

  // Sync customers
  useEffect(() => {
    setCustomers(customerService.getCustomers());
  }, [isOpen]);

  // Selected customer object
  const activeCustomer = customers.find(c => (c.id === selectedCustomerId || c.masterId === selectedCustomerId)) || initialCustomer || null;

  // Initialize or update message when customer, template, or product changes
  useEffect(() => {
    if (initialMessage && !selectedTemplate) {
      setMessageText(initialMessage);
      return;
    }

    const tpl = PRESET_TEMPLATES.find(t => t.id === selectedTemplate);
    if (tpl) {
      const generated = tpl.generateText(
        activeCustomer?.name || '',
        activeCustomer?.beatNo || '2',
        initialProduct?.name
      );
      setMessageText(generated);
    }
  }, [selectedTemplate, activeCustomer, initialProduct]);

  if (!isOpen) return null;

  const rawMobile = activeCustomer?.whatsapp || activeCustomer?.mobile || '';
  const cleanedMobile = cleanPhoneNumber(rawMobile);
  const beatNo = activeCustomer?.beatNo || '2';

  // Filters for customer dropdown
  const filteredCustomers = customers.filter(c => {
    const s = customerSearch.toLowerCase();
    const matchSearch = !s || 
      (c.name && c.name.toLowerCase().includes(s)) ||
      (c.mobile && c.mobile.includes(s)) ||
      (c.houseNo && c.houseNo.toLowerCase().includes(s));
    const matchBeat = selectedBeat === 'All' || c.beatNo === selectedBeat;
    return matchSearch && matchBeat;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    if (!cleanedMobile) {
      alert('कृपया मान्य मोबाइल नंबर दर्ज करें!');
      return;
    }
    const url = `https://wa.me/${cleanedMobile}?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');

    // Auto log to communication hub
    customerService.addCommunicationLog({
      recipientName: activeCustomer?.name || 'Customer',
      mobile: rawMobile || cleanedMobile,
      channel: 'WhatsApp',
      type: PRESET_TEMPLATES.find(t => t.id === selectedTemplate)?.title.split(' ')[1] || 'Direct Message',
      content: messageText,
      status: 'Delivered',
      beatNo: beatNo,
      customerId: activeCustomer?.id || activeCustomer?.masterId
    });

    setDispatchedNotice('WhatsApp संदेश सफलतापूर्वक प्रेषित एवं लॉग किया गया!');
    setTimeout(() => {
      setDispatchedNotice(null);
      if (onSuccess) onSuccess();
    }, 2500);
  };

  const handleSendSMS = () => {
    if (!rawMobile) {
      alert('कृपया मान्य मोबाइल नंबर दर्ज करें!');
      return;
    }
    // Mobile SMS Intent
    const smsUrl = `sms:${rawMobile}?body=${encodeURIComponent(messageText)}`;
    window.open(smsUrl, '_self');

    // Auto log
    customerService.addCommunicationLog({
      recipientName: activeCustomer?.name || 'Customer',
      mobile: rawMobile,
      channel: 'SMS',
      type: PRESET_TEMPLATES.find(t => t.id === selectedTemplate)?.title.split(' ')[1] || 'SMS Notification',
      content: messageText,
      status: 'Sent',
      beatNo: beatNo,
      customerId: activeCustomer?.id || activeCustomer?.masterId
    });

    setDispatchedNotice('SMS ऐप्लिकेशन ट्रिगर किया गया एवं रिकॉर्ड दर्ज किया गया!');
    setTimeout(() => {
      setDispatchedNotice(null);
      if (onSuccess) onSuccess();
    }, 2500);
  };

  const handleSaveOnly = () => {
    customerService.addCommunicationLog({
      recipientName: activeCustomer?.name || 'Customer',
      mobile: rawMobile || '9829012345',
      channel: 'Physical Notice',
      type: 'Direct Notice',
      content: messageText,
      status: 'Completed',
      beatNo: beatNo,
      customerId: activeCustomer?.id || activeCustomer?.masterId
    });

    setDispatchedNotice('संचार रिकॉर्ड सफलतापूर्वक सेव किया गया!');
    setTimeout(() => {
      setDispatchedNotice(null);
      onClose();
      if (onSuccess) onSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-800 to-red-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white font-bold">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Direct Messaging & Communication Hub</h3>
              <p className="text-xs text-red-100">
                Single-Click WhatsApp (wa.me) & Native SMS Gateway with Preset Templates
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

        {/* Feedback Alert */}
        {dispatchedNotice && (
          <div className="bg-emerald-600 text-white px-5 py-2.5 text-xs font-semibold flex items-center gap-2 transition animate-in slide-in-from-top duration-200">
            <CheckCircle2 size={16} />
            <span>{dispatchedNotice}</span>
          </div>
        )}

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Customer Selection or Confirmation */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User size={14} className="text-red-700" />
                <span>Recipient Customer Details</span>
              </span>
              {activeCustomer && (
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-red-100 text-red-800 rounded">
                  {activeCustomer.masterId || activeCustomer.id}
                </span>
              )}
            </div>

            {/* If initialCustomer is fixed, show details card, otherwise allow search */}
            {initialCustomer ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{initialCustomer.name}</div>
                  <div className="text-slate-500">
                    {initialCustomer.houseNo || 'Plot'}, {initialCustomer.sector ? `Sector ${initialCustomer.sector}` : initialCustomer.area || 'Keshavpura'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded font-mono font-bold text-slate-800">
                    📞 {rawMobile || 'No Phone'}
                  </span>
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded font-semibold text-slate-700">
                    Beat {beatNo}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Search customer by name or phone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <select
                      value={selectedBeat}
                      onChange={(e) => setSelectedBeat(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700"
                    >
                      <option value="All">All Beats</option>
                      <option value="1">Beat 1 (Dadabari)</option>
                      <option value="2">Beat 2 (Keshavpura)</option>
                      <option value="6">Beat 6 (Keshavpura Sec 4)</option>
                      <option value="Mandaliya">Mandaliya BO</option>
                    </select>
                  </div>
                </div>

                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-900"
                >
                  <option value="">Select Recipient Customer ({filteredCustomers.length} available)...</option>
                  {filteredCustomers.slice(0, 40).map(c => (
                    <option key={c.id || c.masterId} value={c.id || c.masterId}>
                      {c.name} - {c.mobile || 'No Mobile'} (H.No {c.houseNo || 'NA'}, Beat {c.beatNo || '2'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Preset Templates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                <span>Select Official Preset Template (सरकारी टेम्पलेट)</span>
              </label>
              <span className="text-[11px] text-slate-400">Click to load pre-formatted notice</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition flex flex-col justify-between ${
                    selectedTemplate === tpl.id
                      ? 'bg-red-50/80 border-red-500 text-red-950 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm mb-1">{tpl.icon}</span>
                  <span className="line-clamp-2 text-[11px] leading-tight">{tpl.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Message Text Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <FileText size={14} className="text-slate-500" />
                <span>Message Text (Editable / संपादन योग्य)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  {messageText.length} chars
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs text-red-700 hover:text-red-900 font-semibold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded border border-red-200"
                >
                  {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={6}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50/60 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none font-sans leading-relaxed text-slate-900"
              placeholder="Type or customize your official postal message here..."
            />
          </div>

          {/* Recipient Contact Status Preview */}
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600">WhatsApp Target:</span>
              <span className="font-mono font-bold text-slate-900">
                {cleanedMobile ? `+${cleanedMobile}` : 'नंबर अनुपलब्ध'}
              </span>
            </div>
            <div className="text-slate-500 text-[11px]">
              Dadabari SO Dispatch Gateway
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSaveOnly}
            className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition"
          >
            Save to Log Only
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSendSMS}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
              id="send-sms-btn"
            >
              <Phone size={14} />
              <span>Send SMS (sms:)</span>
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
              id="send-whatsapp-btn"
            >
              <Send size={14} />
              <span>Send WhatsApp (wa.me)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
