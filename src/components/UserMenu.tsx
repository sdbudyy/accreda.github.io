import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../context/UserProfileContext';

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { profile, loading } = useUserProfile();

  const userName = profile?.full_name || profile?.email?.split('@')[0] || 'User';
  const userEmail = profile?.email || '';
  const userRole = profile?.account_type || null;
  // Optionally, add avatarUrl if you store it in the profile
  const avatarUrl = '';

  const handleMenuToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      // You may want to clear context here if needed
      await import('../lib/supabase').then(({ supabase }) => supabase.auth.signOut());
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [navigate]);

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const handleSettingsClick = useCallback(() => {
    const settingsPath = userRole === 'supervisor' ? '/dashboard/supervisor/settings' : '/dashboard/settings';
    navigate(settingsPath);
    setIsOpen(false);
  }, [navigate, userRole]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center space-x-2 focus:outline-none"
        onClick={handleMenuToggle}
        disabled={loading}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover bg-teal-500 text-white"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white">
            <span className="text-sm font-semibold">{getInitials(userName)}</span>
          </div>
        )}
        <span className="hidden md:block text-sm font-medium">{userName}</span>
        <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-slate-200 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="px-4 py-2 border-b border-slate-200">
            <p className="text-sm font-semibold">{userName}</p>
            <p className="text-xs text-slate-500">{userEmail}</p>
          </div>
          
          <ul>
            <li>
              <button 
                onClick={handleSettingsClick}
                className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Settings size={16} className="mr-2" />
                Settings
              </button>
            </li>
            <li className="border-t border-slate-200 mt-1">
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} className="mr-2" />
                Sign out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default React.memo(UserMenu);