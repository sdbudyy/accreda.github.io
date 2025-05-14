import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, FileText, Settings, HelpCircle, LogOut, FileEdit, Bookmark } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useProgressStore } from '../store/progress';
import AccredaLogo from '../assets/accreda-logo.png';

interface SidebarProps {
  onClose?: () => void;
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

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { overallProgress, loading } = useProgressStore();
  const location = useLocation();

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
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-center">
        <img src={AccredaLogo} alt="Accreda Logo" className="h-28 w-auto" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive: navIsActive }) => 
                  `flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-teal-600 text-white' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`
                }
                onClick={onClose}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-10 px-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 px-3">
            Support
          </h3>
          <ul className="space-y-1 px-3">
            {secondaryNavItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive: navIsActive }) => 
                    `flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-slate-800 text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`
                  }
                  onClick={onClose}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
            <li>
              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2.5 rounded-lg transition-colors w-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <LogOut size={20} className="mr-3" />
                <span>Sign Out</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Program progress */}
      <div className="p-4 border-t border-slate-800 sticky bottom-0 bg-slate-900">
        <div className="mb-2 flex justify-between items-center">
          <h3 className="text-sm font-medium text-slate-300">Program Progress</h3>
          <span className="text-sm font-semibold text-teal-400">
            {loading ? <span className="animate-pulse">...</span> : `${overallProgress}%`}
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-teal-500 rounded-full transition-all duration-300" 
            style={{ width: loading ? '0%' : `${overallProgress}%` }}
          ></div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;