import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Dashboard from '../../pages/Dashboard';
import LoadingSpinner from '../common/LoadingSpinner';

const EitDashboardGate = () => {
  const [role, setRole] = useState<'eit' | 'supervisor' | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkRole = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      const { data: supervisorProfile } = await supabase
        .from('supervisor_profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      if (supervisorProfile) {
        navigate('/dashboard/supervisor', { replace: true });
      } else {
        setRole('eit');
      }
      setLoading(false);
    };
    checkRole();
  }, [navigate]);

  if (loading) return <LoadingSpinner />;
  if (role === 'eit') return <Dashboard />;
  return null;
};

export default EitDashboardGate; 