import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import SupervisorSidebar from './supervisor/SupervisorSidebar';
import { supabase } from '../lib/supabase';
import AccredaLogo from '../assets/accreda-logo.png';

interface RoleAwareSidebarProps {
  onClose?: () => void;
}

const SidebarSkeleton: React.FC = () => (
  <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col animate-pulse [animation-duration:2s]">
    <div className="p-4 border-b border-slate-800 flex items-center justify-center">
      <img src={AccredaLogo} alt="Accreda Logo" className="h-28 w-auto" />
    </div>
    <div className="flex-1 py-6 space-y-4 px-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-8 bg-slate-800/80 rounded-lg" />
      ))}
    </div>
    <div className="p-4 border-t border-slate-800 bg-slate-900">
      <div className="h-4 bg-slate-800/80 rounded w-1/2 mb-2" />
      <div className="h-2 bg-slate-800/80 rounded w-full" />
    </div>
  </aside>
);

const RoleAwareSidebar: React.FC<RoleAwareSidebarProps> = ({ onClose }) => {
  const [role, setRole] = useState<'eit' | 'supervisor' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check both profile tables
        const { data: eitProfile } = await supabase
          .from('eit_profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        const { data: supervisorProfile } = await supabase
          .from('supervisor_profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        if (supervisorProfile) setRole('supervisor');
        else if (eitProfile) setRole('eit');
        else setRole(null);
      }
      setLoading(false);
    };
    fetchRole();
  }, []);

  if (loading) return <SidebarSkeleton />;
  if (role === 'supervisor') return <SupervisorSidebar onClose={onClose} />;
  return <Sidebar onClose={onClose} />;
};

export default RoleAwareSidebar; 