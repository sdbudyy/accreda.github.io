import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, FileText, Settings, HelpCircle, LogOut, FileEdit, Bookmark } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useProgressStore } from '../store/progress';
import AccredaLogo from '../assets/accreda-logo.png';

interface SidebarProps {
  onClose?: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
  { name: 'Skills', path: '/dashboard/skills', icon: <BookOpen size={20} /> },
  { name: 'SAOs', path: '/dashboard/saos', icon: <FileEdit size={20} /> },
  { name: 'Documents', path: '/dashboard/documents', icon: <FileText size={20} /> },
  { name: 'Jobs', path: '/dashboard/references', icon: <Bookmark size={20} /> },
  { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={20} /> },
];

const secondaryNavItems = [
  { name: 'Help & Support', path: '/dashboard/help', icon: <HelpCircle size={20} /> },
];

const Sidebar: React.FC<SidebarProps> = ({ onClose, onCollapseChange }) => {
  const { overallProgress, loading } = useProgressStore();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (onCollapseChange) onCollapseChange(collapsed);
  }, [collapsed, onCollapseChange]);

  const handleMouseEnter = () => setCollapsed(false);
  const handleMouseLeave = () => setCollapsed(true);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-900 text-white flex flex-col transition-all duration-200 border-r border-slate-800 h-screen`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ minWidth: collapsed ? 60 : 256, width: collapsed ? 60 : 256, height: '100vh' }}
    >
      {/* Logo area always present, only show logo when expanded */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-center transition-all duration-300" style={{ height: '7rem' }}>
        {!collapsed && (
          <NavLink to="/dashboard" className="cursor-pointer">
            <img src={AccredaLogo} alt="Accreda Logo" className="h-28 w-auto transition-all duration-300 mx-auto" />
          </NavLink>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        <ul className="space-y-1 px-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive: navIsActive }) =>
                  `flex items-center rounded-lg transition-colors px-2 py-2.5 ${
                    isActive(item.path)
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`
                }
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  onClose?.();
                }}
              >
                <span className="flex-shrink-0 mr-0.5">{item.icon}</span>
                <span
                  className={`ml-3 whitespace-nowrap transition-all duration-200 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}
                  style={{ transition: 'opacity 0.2s, width 0.2s' }}
                >
                  {item.name}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-10 px-1">
          <h3 className={`text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 px-3 transition-all duration-200 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}>Support</h3>
          <ul className="space-y-1 px-1">
            {secondaryNavItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive: navIsActive }) =>
                    `flex items-center rounded-lg transition-colors px-2 py-2.5 ${
                      isActive(item.path)
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`
                  }
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onClose?.();
                  }}
                >
                  <span className="flex-shrink-0 mr-0.5">{item.icon}</span>
                  <span
                    className={`ml-3 whitespace-nowrap transition-all duration-200 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}
                    style={{ transition: 'opacity 0.2s, width 0.2s' }}
                  >
                    {item.name}
                  </span>
                </NavLink>
              </li>
            ))}
            <li>
              <button
                onClick={handleSignOut}
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

      {/* Program progress */}
      <div className={`p-4 border-t border-slate-800 sticky bottom-0 bg-slate-900 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
        style={{ minWidth: collapsed ? 60 : 256 }}
      >
        <div className={`mb-2 flex items-center transition-all duration-200 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <h3 className="text-sm font-medium text-slate-300 transition-all duration-200">Program Progress</h3>
          )}
          <span className={`text-sm font-semibold text-teal-400 transition-all duration-200`}>
            {loading ? <span className="animate-pulse">...</span> : `${overallProgress}%`}
          </span>
        </div>
        {!collapsed && (
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden transition-all duration-200">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-200"
              style={{ width: loading ? '0%' : `${overallProgress}%` }}
            ></div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;