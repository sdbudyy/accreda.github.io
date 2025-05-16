import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import EITDashboard from './EITDashboard';
import SupervisorDashboard from './SupervisorDashboard';
import LoadingSpinner from '../common/LoadingSpinner';
import { clearAllStates } from '../../utils/stateCleanup';

const RoleBasedDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [accountType, setAccountType] = useState<'eit' | 'supervisor' | null>(null);
  const navigate = useNavigate();

  const checkUserRole = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!user) {
        navigate('/login');
        return;
      }

      // Check both profile tables
      const [eitProfile, supervisorProfile] = await Promise.all([
        supabase.from('eit_profiles').select('account_type').eq('id', user.id).single(),
        supabase.from('supervisor_profiles').select('account_type').eq('id', user.id).single()
      ]);

      if (eitProfile.data) {
        setAccountType('eit');
      } else if (supervisorProfile.data) {
        setAccountType('supervisor');
      } else {
        console.error('No profile found for user');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkUserRole();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearAllStates();
        navigate('/login');
      } else if (event === 'SIGNED_IN') {
        checkUserRole();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkUserRole, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!accountType) {
    return null;
  }

  return accountType === 'supervisor' ? <SupervisorDashboard /> : <EITDashboard />;
};

export default RoleBasedDashboard; 