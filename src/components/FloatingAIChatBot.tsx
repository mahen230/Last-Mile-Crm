import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { processChat } from '../lib/aiChat';

export default function FloatingAIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'bot' | 'user', text: string }[]>([
    { role: 'bot', text: 'Hello! I am your India Post CRM AI Agent. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    const context = `
      Total verified customers: ${customerService.getCustomers().length}.
      Active leads: ${customerService.getLeads().length}.
      Available actions: Navigate to Dashboard, Customers, Properties.
    `;

    const response = await processChat(userText, context);
    
    // Simulate Admin Approval flow if data entry requested
    let botResponse = response;
    if (userText.toLowerCase().includes('add') || userText.toLowerCase().includes('update')) {
      botResponse += "\n\n(Action submitted for Admin Approval)";
      // In a real app, we would add to a pending_approvals collection here
    }

    setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            <div className="p-4 bg-red-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Sparkles size={16} /> AI Assistant
              </div>
              <button onClick={() => setIsOpen(false)}><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {messages.map((m, i) => (
                <div key={i} className={`text-xs p-2 rounded-xl ${m.role === 'bot' ? 'bg-slate-200 text-slate-800' : 'bg-red-600 text-white ml-auto'}`}>
                  {m.text}
                </div>
              ))}
              {loading && <div className="text-xs text-slate-500 italic">AI Agent is thinking...</div>}
            </div>
            <div className="p-3 border-t flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 border rounded-lg p-2 text-xs"
              />
              <button onClick={handleSend} className="p-2 bg-red-700 text-white rounded-lg"><Send size={14} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-red-700 rounded-full text-white shadow-lg flex items-center justify-center hover:bg-red-800 transition"
      >
        <MessageSquare />
      </button>
    </div>
  );
}
