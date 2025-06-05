import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'eit' | 'supervisor';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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

        // If a specific role is required, check if the user has that role
        if (requiredRole) {
          const isEit = eitProfile.data && eitProfile.data.length > 0;
          const isSupervisor = supervisorProfile.data && supervisorProfile.data.length > 0;

          if (requiredRole === 'eit' && !isEit) {
            navigate('/dashboard/supervisor');
            return;
          }

          if (requiredRole === 'supervisor' && !isSupervisor) {
            navigate('/dashboard');
            return;
          }
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
  }, [navigate, requiredRole]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 