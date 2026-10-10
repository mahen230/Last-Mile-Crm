import React, { useState } from 'react';
import { Plus, QrCode, Phone, MoreVertical, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function MobileFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { name: 'Add Customer', icon: Plus, action: () => navigate('/customers') },
    { name: 'Scan QR', icon: QrCode, action: () => alert('Scan feature coming soon') },
    { name: 'Call Support', icon: Phone, action: () => window.location.href = 'tel:18001234567' },
  ];

  return (
    <div className="md:hidden fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2"
          >
            {actions.map((action, idx) => (
              <button
                key={action.name}
                onClick={() => { action.action(); setIsOpen(false); }}
                className="flex items-center gap-2 bg-white text-slate-900 px-4 py-3 rounded-full shadow-lg border border-slate-200 font-bold text-sm"
              >
                {action.name}
                <action.icon size={18} className="text-red-700" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-700 text-white p-4 rounded-full shadow-xl hover:bg-red-800 transition"
      >
        {isOpen ? <X size={24} /> : <MoreVertical size={24} />}
      </button>
    </div>
  );
}
