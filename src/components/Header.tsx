import React from 'react';
import { Menu } from 'lucide-react';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';
import NotificationsDropdown from './common/NotificationsDropdown';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between w-full">
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
        
        <NotificationsDropdown />
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;