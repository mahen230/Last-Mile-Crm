import React, { useState, useEffect } from 'react';
import { Building, Users, QrCode, MoreVertical, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './auth/FirebaseAuthProvider';
import { featureVisibilityService } from '../services/featureVisibilityService';

export default function MobileFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [, setVisTick] = useState(0);

  useEffect(() => {
    return featureVisibilityService.subscribe(() => setVisTick((v) => v + 1));
  }, []);

  const showProperty = featureVisibilityService.isFeatureVisible(userProfile, 'property');
  const showMembers = featureVisibilityService.isFeatureVisible(userProfile, 'members');
  const showVerification = featureVisibilityService.isFeatureVisible(userProfile, 'dailyVerification');

  const actions = [
    ...(showProperty
      ? [{ name: 'Property Directory', icon: Building, action: () => navigate('/properties') }]
      : []),
    ...(showMembers
      ? [{ name: 'Members Directory', icon: Users, action: () => navigate('/customers') }]
      : []),
    ...(showVerification
      ? [{ name: 'Verification Queue', icon: QrCode, action: () => navigate('/verifications') }]
      : []),
  ];

  if (actions.length === 0) return null;

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
            {actions.map((action) => (
              <button
                key={action.name}
                onClick={() => {
                  action.action();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-lg border border-slate-200 font-bold text-xs"
              >
                {action.name}
                <action.icon size={16} className="text-red-700" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-800 text-white p-4 rounded-full shadow-xl hover:bg-red-900 transition"
      >
        {isOpen ? <X size={22} /> : <MoreVertical size={22} />}
      </button>
    </div>
  );
}
