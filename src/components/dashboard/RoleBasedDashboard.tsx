import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import { clearAllStates } from '../../utils/stateCleanup';
import { useUserProfile } from '../../context/UserProfileContext';

type AccountType = 'eit' | 'supervisor' | null;

const RoleBasedDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading: profileLoading, error: profileError } = useUserProfile();
  const hasNavigated = useRef(false);

  // Wait for UserProfileContext to finish loading before making navigation decisions
  useEffect(() => {
    if (profileLoading) {
      // Still loading, don't do anything yet
      return;
    }

    if (profileError) {
      setError(profileError);
      setLoading(false);
      return;
    }

    if (!profile) {
      // No profile found, redirect to login
      hasNavigated.current = true;
      navigate('/login');
      return;
    }

    // Only navigate if we haven't navigated yet
    if (!hasNavigated.current) {
      if (profile.account_type === 'supervisor') {
        setAccountType('supervisor');
        hasNavigated.current = true;
        navigate('/dashboard/supervisor', { replace: true });
      } else if (profile.account_type === 'eit') {
        setAccountType('eit');
        hasNavigated.current = true;
        navigate('/dashboard', { replace: true });
      } else {
        setError('Invalid account type');
      }
    }
    
    setLoading(false);
  }, [profile, profileLoading, profileError, navigate]);

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearAllStates();
        hasNavigated.current = false; // Reset flag on sign out
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Show loading spinner while either the profile is loading or we're processing the role
  if (profileLoading || loading) {
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