import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../common/LoadingSpinner';
import { clearAllStates } from '../../utils/stateCleanup';
import { useUserProfile } from '../../context/UserProfileContext';
import { CheckCircle, Loader2 } from 'lucide-react';

type AccountType = 'eit' | 'supervisor' | null;

const RoleBasedDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [authComplete, setAuthComplete] = useState(false);
  const [isProcessingMagicLink, setIsProcessingMagicLink] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading: profileLoading, error: profileError } = useUserProfile();
  const hasNavigated = useRef(false);

  // Check for magic link authentication tokens first
  useEffect(() => {
    const checkForMagicLink = async () => {
      const urlParams = new URLSearchParams(location.search);
      const hash = location.hash;
      
      // Check if there are auth tokens in URL or hash
      if (hash.includes('access_token') || urlParams.get('access_token')) {
        setIsProcessingMagicLink(true);
        
        try {
          // Extract tokens from URL or hash
          let accessToken = urlParams.get('access_token');
          let refreshToken = urlParams.get('refresh_token');
          let type = urlParams.get('type');
          
          // If not found in search params, check the hash
          if (!accessToken || !refreshToken) {
            const hashParams = new URLSearchParams(hash.substring(1));
            accessToken = accessToken || hashParams.get('access_token');
            refreshToken = refreshToken || hashParams.get('refresh_token');
            type = type || hashParams.get('type');
          }

          // Check if this is a magic link
          if (type !== 'magiclink' && type !== 'recovery') {
            throw new Error('Invalid magic link type');
          }

          if (!accessToken || !refreshToken) {
            throw new Error('Missing authentication tokens');
          }

          // Set the session with the tokens from the magic link
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            throw new Error('Invalid or expired magic link');
          }

          if (!data.session) {
            throw new Error('Failed to establish session');
          }

          console.log('Magic link authentication successful');
          
          // Show success state briefly
          setAuthComplete(true);
          
          // Clear the URL parameters for security
          window.history.replaceState({}, document.title, window.location.pathname);

          // Wait a moment then proceed with normal role-based routing
          setTimeout(() => {
            setIsProcessingMagicLink(false);
            setAuthComplete(false);
          }, 1500);

        } catch (err) {
          console.error('Magic link processing error:', err);
          setError(err instanceof Error ? err.message : 'Magic link authentication failed');
          setIsProcessingMagicLink(false);
        }
      }
    };
    
    checkForMagicLink();
  }, [location]);

  // Wait for UserProfileContext to finish loading before making navigation decisions
  useEffect(() => {
    if (profileLoading || isProcessingMagicLink) {
      // Still loading or processing magic link, don't do anything yet
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
  }, [profile, profileLoading, profileError, navigate, isProcessingMagicLink]);

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

  // Show magic link processing screen
  if (isProcessingMagicLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8">
            {authComplete ? (
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto animate-pulse" />
            ) : (
              <Loader2 className="w-20 h-20 text-teal-600 mx-auto animate-spin" />
            )}
          </div>
          
          <h1 className="text-4xl font-bold text-teal-600 mb-4">
            {authComplete ? 'Welcome Back!' : 'Logging you in...'}
          </h1>
          
          <p className="text-slate-600 text-lg mb-6">
            {authComplete 
              ? 'Authentication successful! Redirecting to your dashboard...'
              : 'Please wait while we securely log you into your Accreda account.'
            }
          </p>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-teal-100">
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
              <span>Securing your connection</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading spinner while either the profile is loading or we're processing the role
  if (profileLoading || loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-red-600 mb-4">Authentication Failed</h1>
          
          <p className="text-slate-600 text-lg mb-6">
            {error}
          </p>
          
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
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