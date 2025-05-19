import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get session and check profiles in parallel
        const [sessionResult, eitProfile, supervisorProfile] = await Promise.all([
          supabase.auth.getSession(),
          supabase.from('eit_profiles').select('id').limit(1),
          supabase.from('supervisor_profiles').select('id').limit(1)
        ]);
        
        const { data: { session }, error } = sessionResult;
        
        if (error) throw error;
        
        if (!session) {
          navigate('/login');
          return;
        }

        // Check if user has any profile
        if (!eitProfile.data?.length && !supervisorProfile.data?.length) {
          navigate('/signup');
          return;
        }

      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 