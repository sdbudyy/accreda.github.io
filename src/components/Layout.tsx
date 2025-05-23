import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import ScrollToTop from './ScrollToTop';
import RoleAwareSidebar from './RoleAwareSidebar';

interface LayoutProps {
  appLoaded: boolean;
}

const Layout: React.FC<LayoutProps> = ({ appLoaded }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <RoleAwareSidebar />
      </div>
      
      {/* Mobile sidebar - only visible when toggled */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-xl">
            <RoleAwareSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 pt-20 md:pt-24 pb-20 md:pb-6">
          <Outlet context={{ appLoaded }} />
        </main>
        
        {/* Mobile navigation - only visible on mobile */}
        <div className="md:hidden">
          <MobileNav />
        </div>

        {/* Scroll to top button */}
        <ScrollToTop />
      </div>
    </div>
  );
};

export default Layout;