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
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
          navigate('/login');
          return;
        }

        // Check if user has a profile
        const { data: eitProfile } = await supabase
          .from('eit_profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        const { data: supervisorProfile } = await supabase
          .from('supervisor_profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (!eitProfile && !supervisorProfile) {
          // User has no profile, redirect to signup
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
  }, [navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 