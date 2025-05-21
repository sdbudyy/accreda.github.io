import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SupervisorSidebar from './SupervisorSidebar';
import SupervisorHeader from './SupervisorHeader';

interface SupervisorLayoutProps {
  appLoaded: boolean;
}

const SupervisorLayout: React.FC<SupervisorLayoutProps> = ({ appLoaded }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <SupervisorSidebar />
      </div>
      {/* Mobile sidebar - only visible when toggled */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-xl">
            <SupervisorSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
      {/* Main content */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        <SupervisorHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 pt-20 md:pt-24 pb-20 md:pb-6">
          <Outlet context={{ appLoaded }} />
        </main>
      </div>
    </div>
  );
};

export default SupervisorLayout; 