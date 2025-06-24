import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import { clearAllStates } from '../../utils/stateCleanup';

type AccountType = 'eit' | 'supervisor' | null;

const RoleBasedDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const navigate = useNavigate();

  const checkUserRole = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error(`Authentication error: ${authError.message}`);
      }
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Check both profile tables in parallel
      const [eitProfile, supervisorProfile] = await Promise.all([
        supabase.from('eit_profiles').select('id').eq('id', user.id).single(),
        supabase.from('supervisor_profiles').select('id').eq('id', user.id).single()
      ]);

      if (eitProfile.error && supervisorProfile.error) {
        throw new Error('Failed to fetch user profiles');
      }

      // Set account type and navigate
      if (supervisorProfile.data) {
        setAccountType('supervisor');
        navigate('/dashboard/supervisor', { replace: true });
      } else if (eitProfile.data) {
        setAccountType('eit');
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error('No profile found for user');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error checking user role:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Check role immediately
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p>Error: {error}</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // No need to render anything, as we redirect
  return null;
};

export default RoleBasedDashboard; 