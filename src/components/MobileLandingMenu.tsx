import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProfile } from '../context/UserProfileContext';

interface MobileLandingMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileLandingMenu: React.FC<MobileLandingMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useUserProfile();

  const handlePricingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    if (window.location.pathname === '/') {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = '/?scroll=pricing';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Menu */}
          <motion.div
            className="fixed top-0 right-0 h-full w-80 max-w-[80vw] bg-white shadow-xl z-50"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-6">
              <ul className="space-y-4">
                <li>
                  <button
                    className="block py-3 text-lg font-medium text-slate-700 hover:text-slate-900 transition-colors w-full text-left"
                    onClick={() => {
                      onClose();
                      if (profileLoading) return;
                      if (profile) {
                        if (profile.account_type === 'supervisor') {
                          navigate('/dashboard/supervisor');
                        } else {
                          navigate('/dashboard');
                        }
                      } else {
                        navigate('/login');
                      }
                    }}
                  >
                    Sign In
                  </button>
                </li>
                <li>
                  <Link
                    to="/"
                    className="block py-3 text-lg font-medium text-slate-700 hover:text-slate-900 transition-colors"
                    onClick={onClose}
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <a
                    href="/?scroll=pricing"
                    className="block w-full text-left py-3 text-lg font-medium text-slate-700 hover:text-slate-900 transition-colors"
                    onClick={e => { e.preventDefault(); navigate('/?scroll=pricing'); onClose(); }}
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <Link
                    to="/enterprise"
                    className="block py-3 text-lg font-medium text-slate-700 hover:text-slate-900 transition-colors"
                    onClick={onClose}
                  >
                    Enterprise
                  </Link>
                </li>
                <li className="pt-4">
                  <Link
                    to="/signup"
                    className="block w-full bg-black text-white text-lg font-medium py-3 px-6 rounded-lg text-center hover:bg-slate-800 transition-colors"
                    onClick={onClose}
                  >
                    Join Today
                  </Link>
                </li>
              </ul>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileLandingMenu; 