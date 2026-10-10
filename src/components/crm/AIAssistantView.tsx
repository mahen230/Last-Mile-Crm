import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, Calculator, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { customerService } from '../../services/customerService';
import { POSTAL_PRODUCTS } from '../../data/productsData';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  options?: string[];
  productCard?: any;
}

export default function AIAssistantView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: 'Namaskar! I am your India Post CRM AI Operations Assistant. How can I help you today? You can search customer records, calculate scheme maturities, generate outreach scripts, or analyze beat coverage.',
      options: [
        'Calculate Sukanya Samriddhi 8.2% Maturity',
        'Find High-Value PLI Suraksha Quotes',
        'Check Beat 2 Customer Demographics',
        'Generate SMS Reminder for Senior Citizens'
      ]
    }
  ]);

  const [input, setInput] = useState('');

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Generate intelligent contextual response
    setTimeout(() => {
      let aiReply: Message;
      const lower = query.toLowerCase();

      if (lower.includes('sukanya') || lower.includes('ssa')) {
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'Sukanya Samriddhi Account (SSA) is currently offering 8.2% p.a. compound interest (Triple Tax Free EEE under Sec 80C).\n\n• Minimum annual deposit: ₹250\n• Maximum annual deposit: ₹1,50,000\n• Deposit period: 15 Years\n• Total Maturity period: 21 Years from account opening\n• Doorstep document verification available for Beat 2 & 6.',
          productCard: POSTAL_PRODUCTS.find(p => p.code === 'SSA')
        };
      } else if (lower.includes('pli') || lower.includes('suraksha') || lower.includes('insurance')) {
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'Postal Life Insurance (PLI Suraksha - Whole Life Assurance) offers the highest sovereign bonus in India at ₹76 per ₹1,000 Sum Assured per year.\n\n• Lowest premium rates compared to commercial insurers\n• Eligible for Govt/Semi-Govt employees, Professionals, and Accredited entities\n• Loan facility available after 4 years.',
          productCard: POSTAL_PRODUCTS.find(p => p.code === 'PLI_SURAKSHA')
        };
      } else if (lower.includes('add new lead') || lower.includes('add lead')) {
        // Simple command parsing: "Add new lead <name>, <mobile>, living at <address>, Near <landmark>, <area>, <beat>, <n> family members"
        // This is a naive implementation
        const parts = query.split(',');
        const name = parts[0].replace(/(Add new lead|Add lead)/gi, '').trim();
        const mobile = parts[1]?.trim() || '0000000000';
        const addressPart = parts[2]?.trim() || ''; // e.g., "living at House 42"
        const houseNumber = addressPart.replace(/living at/gi, '').trim();
        const landmark = parts[3]?.trim() || '';
        const area = parts[4]?.trim() || 'Keshavpura';
        const beatNo = parts[5]?.trim() || 'Beat 1';
        const membersCount = parseInt(parts[6]?.trim() || '0');
        
        customerService.addOrUpdateCustomer({
          name,
          mobile,
          address: {
            houseNumber,
            sectorLocality: area,
            area,
            pincode: '324009',
            landmark
          },
          beatNo,
          householdMembers: Array.from({ length: membersCount }, (_, i) => ({ name: `Member ${i + 1}` }))
        }, 'AI Assistant');
        
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `I have added a new lead for ${name} (${mobile}) living at ${houseNumber}, ${area}. Assigned to ${beatNo} with ${membersCount} family members.`
        };
      } else if (lower.includes('find') || lower.includes('search')) {
        const followUps = customerService.getFollowUps();
        const searchTerm = query.replace(/(find|search|follow-ups|followups)/gi, '').trim();
        const results = followUps.filter(f => f.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
        
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: results.length > 0 
            ? `I found ${results.length} follow-up(s) for "${searchTerm}":\n\n${results.map(r => `• ${r.customerName} (${r.scheduledDate}) - ${r.nextAction}`).join('\n')}`
            : `No follow-ups found for "${searchTerm}".`
        };
      } else {
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Based on your query "${query}", I analyzed the Master Source database. All records are normalized with strict duplicate prevention rules active. Would you like me to schedule a follow-up or generate a product comparison?`,
          options: [
            'Compare SSA vs PPF',
            'Compare PLI vs Commercial Insurance',
            'View Pending Conflict Flags'
          ]
        };
      }

      setMessages(prev => [...prev, aiReply]);
    }, 600);
  };

  return (
    <div className="space-y-6" id="ai-assistant-view-root">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles size={22} className="text-amber-600" />
            <span>Postal Operations AI Assistant</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Intelligent queries across Master records, returns calculator, and outreach generator
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
        
        {/* Message Thread */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-red-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  <Bot size={18} />
                </div>
              )}

              <div className={`max-w-xl space-y-3 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-slate-100/80 text-slate-800 rounded-tl-none border border-slate-200/80 whitespace-pre-wrap'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Optional Product Card Attachment */}
                {msg.productCard && (
                  <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl text-xs space-y-1.5">
                    <div className="font-bold text-red-900 flex justify-between">
                      <span>{msg.productCard.name}</span>
                      <span className="font-mono text-red-700">{msg.productCard.code}</span>
                    </div>
                    <div className="text-slate-600 text-[11px]">{msg.productCard.tagline}</div>
                    <div className="text-xs font-bold text-red-700">Returns: {msg.productCard.interestRateOrBonus}</div>
                  </div>
                )}

                {/* Quick Prompts Options */}
                {msg.options && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(opt)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-semibold rounded-lg transition shadow-xs text-left"
                      >
                        {opt} →
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ask AI Assistant about schemes, customer lookups, maturity calculations..."
            className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-600 font-medium"
            id="ai-assistant-input"
          />
          <button
            onClick={() => handleSend()}
            className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            id="ai-assistant-send-btn"
          >
            <Send size={15} />
            <span>Ask</span>
          </button>
        </div>
      </div>
    </div>
  );
}
