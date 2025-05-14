import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, GraduationCap, FileText, PenTool, HelpCircle } from 'lucide-react';

const MobileNav: React.FC = () => {
  const navItems = [
    { name: 'Home', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Skills', path: '/dashboard/skills', icon: <GraduationCap size={20} /> },
    { name: 'Documents', path: '/dashboard/documents', icon: <FileText size={20} /> },
    { name: 'Essays', path: '/dashboard/essays', icon: <PenTool size={20} /> },
    { name: 'Help', path: '/dashboard/help', icon: <HelpCircle size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 z-10">
      <ul className="flex justify-around">
        {navItems.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.path}
              className={({ isActive }) => 
                `flex flex-col items-center p-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-teal-600' 
                    : 'text-slate-500 hover:text-teal-600'
                }`
              }
            >
              <span>{item.icon}</span>
              <span className="text-xs mt-1">{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MobileNav;