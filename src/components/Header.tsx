import React from 'react';
import { Menu, Bell } from 'lucide-react';
import UserMenu from './UserMenu';
import SearchBar from './SearchBar';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 bg-white/80 backdrop-blur-md z-10 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
          aria-label="Menu"
        >
          <Menu size={24} />
        </button>
        <div className="ml-2 md:ml-0">
          <h1 className="text-xl font-semibold text-slate-800">EIT Progress</h1>
        </div>
      </div>
      
      {/* Right side */}
      <div className="flex items-center space-x-2">
        <div className="hidden md:block">
          <SearchBar />
        </div>
        
        <button 
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 relative"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;