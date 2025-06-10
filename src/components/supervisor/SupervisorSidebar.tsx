import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, FileText, ClipboardList, Settings, HelpCircle, Home, LogOut, BookOpen, CheckCircle2 } from 'lucide-react';
import AccredaLogo from '../../assets/accreda-logo.png';
import WhiteAccredaLogo from '../../assets/white-accreda.png';
import { supabase } from '../../lib/supabase';
import { useNotificationsStore } from '../../store/notifications';

interface SupervisorSidebarProps {
  onClose?: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
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

const SupervisorSidebar: React.FC<SupervisorSidebarProps> = ({ onClose, onCollapseChange }) => {
  const navigate = useNavigate();
  const unreadCount = useNotificationsStore(state => state.unreadCount);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (onCollapseChange) onCollapseChange(collapsed);
  }, [collapsed, onCollapseChange]);

  const handleMouseEnter = () => setCollapsed(false);
  const handleMouseLeave = () => setCollapsed(true);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 bg-slate-900 text-white flex flex-col transition-all duration-200 border-r border-slate-800 h-screen"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        width: collapsed ? 60 : 256,
        minWidth: collapsed ? 60 : 256,
        maxWidth: collapsed ? 60 : 256,
        transform: collapsed ? 'translateX(0)' : 'translateX(0)',
        transition: 'width 0.2s ease-in-out, min-width 0.2s ease-in-out, max-width 0.2s ease-in-out'
      }}
    >
      {/* Logo area always present, show small logo when collapsed, full logo when expanded */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-center transition-all duration-300 relative" style={{ height: '7rem' }}>
        <NavLink to="/dashboard/supervisor" className="cursor-pointer block w-full h-full">
          <img
            src={WhiteAccredaLogo}
            alt="Accreda Small Logo"
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${collapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
            style={{ width: collapsed ? '44px' : 32, height: 'auto', maxWidth: '90%', maxHeight: '90%' }}
          />
          <img
            src={AccredaLogo}
            alt="Accreda Logo"
            className={`transition-all duration-300 mx-auto ${collapsed ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
            style={{ height: '7rem', width: 'auto' }}
          />
        </NavLink>
      </div>
      {/* Navigation */}
      <nav className="flex-1 py-6">
        <ul className="space-y-1 px-1">
          {navItems.map((item) => (
            <li key={item.to} className="relative">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center rounded-lg transition-colors px-2 py-2.5 ${
                    isActive
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`
                }
                end={item.to === '/dashboard/supervisor'}
                onClick={onClose}
              >
                <span className="flex-shrink-0 mr-0.5">{item.icon}</span>
                <span
                  className={`ml-3 whitespace-nowrap transition-all duration-200 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}
                  style={{ transition: 'opacity 0.2s, width 0.2s' }}
                >
                  {item.label}
                </span>
                {/* Red dot for unread notifications on Reviews */}
                {item.label === 'Reviews' && unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="mt-10 px-1">
          <h3 className={`text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 px-3 transition-all duration-200 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}>Help & Support</h3>
          <ul className="space-y-1 px-1">
            {supportNavItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center rounded-lg transition-colors px-2 py-2.5 ${
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`
                  }
                  onClick={onClose}
                >
                  <span className="flex-shrink-0 mr-0.5">{item.icon}</span>
                  <span
                    className={`ml-3 whitespace-nowrap transition-all duration-200 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}
                    style={{ transition: 'opacity 0.2s, width 0.2s' }}
                  >
                    {item.label}
                  </span>
                </NavLink>
              </li>
            ))}
            <li>
              <button
                onClick={() => {
                  handleSignOut();
                  onClose?.();
                }}
                className="flex items-center rounded-lg transition-colors w-full px-2 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <LogOut size={20} className="flex-shrink-0 mr-0.5" />
                <span
                  className={`ml-3 whitespace-nowrap transition-all duration-200 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}
                  style={{ transition: 'opacity 0.2s, width 0.2s' }}
                >
                  Sign Out
                </span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
};

export default SupervisorSidebar; 