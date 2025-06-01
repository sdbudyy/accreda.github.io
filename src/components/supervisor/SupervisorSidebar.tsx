import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, FileText, ClipboardList, Settings, HelpCircle, Home, LogOut, BookOpen, CheckCircle2 } from 'lucide-react';
import AccredaLogo from '../../assets/accreda-logo.png';
import { supabase } from '../../lib/supabase';
import { useNotificationsStore } from '../../store/notifications';

interface SupervisorSidebarProps {
  onClose?: () => void;
}

const navItems = [
  { to: '/dashboard/supervisor', label: 'Dashboard', icon: <Home size={20} /> },
  { to: '/dashboard/supervisor/skills', label: 'Skills', icon: <BookOpen size={20} /> },
  { to: '/dashboard/supervisor/team', label: 'Team', icon: <Users size={20} /> },
  { to: '/dashboard/supervisor/reviews', label: 'Reviews', icon: <ClipboardList size={20} /> },
  { to: '/dashboard/supervisor/documents', label: 'Documents', icon: <FileText size={20} /> },
  { to: '/dashboard/supervisor/settings', label: 'Settings', icon: <Settings size={20} /> },
];

const supportNavItems = [
  { to: '/dashboard/supervisor/support', label: 'Help & Support', icon: <HelpCircle size={20} /> },
];

const SupervisorSidebar: React.FC<SupervisorSidebarProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const unreadCount = useNotificationsStore(state => state.unreadCount);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-center">
        <NavLink to="/dashboard/supervisor" className="cursor-pointer">
          <img src={AccredaLogo} alt="Accreda Logo" className="h-28 w-auto" />
        </NavLink>
      </div>
      {/* Navigation */}
      <nav className="flex-1 py-6">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.to} className="relative">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg transition-colors font-medium ${
                    isActive
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`
                }
                end={item.to === '/dashboard/supervisor'}
                onClick={onClose}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
                {/* Red dot for unread notifications on Reviews */}
                {item.label === 'Reviews' && unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="mt-10 px-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 px-3">
            Help & Support
          </h3>
          <ul className="space-y-1 px-3">
            {supportNavItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg transition-colors font-medium ${
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`
                  }
                  onClick={onClose}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
            <li>
              <button
                onClick={() => {
                  handleSignOut();
                  onClose?.();
                }}
                className="flex items-center px-3 py-2.5 rounded-lg transition-colors w-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <LogOut size={20} className="mr-3" />
                <span>Sign Out</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
};

export default SupervisorSidebar; 