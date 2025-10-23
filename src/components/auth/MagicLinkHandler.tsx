import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function MagicLinkHandler() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authComplete, setAuthComplete] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleMagicLink = async () => {
      try {
        console.log('MagicLinkHandler: Current URL:', window.location.href);
        console.log('MagicLinkHandler: Search params:', Object.fromEntries(searchParams.entries()));
        console.log('MagicLinkHandler: Hash:', window.location.hash);
        
        // Check both URL search params and hash for tokens
        let accessToken = searchParams.get('access_token');
        let refreshToken = searchParams.get('refresh_token');
        let type = searchParams.get('type');
        
        // If not found in search params, check the hash
        if (!accessToken || !refreshToken) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          accessToken = accessToken || hashParams.get('access_token');
          refreshToken = refreshToken || hashParams.get('refresh_token');
          type = type || hashParams.get('type');
        }

        console.log('MagicLinkHandler: Tokens found:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          type 
        });

        // Check if this is a magic link (sign in) or recovery link
        if (type !== 'magiclink' && type !== 'recovery') {
          console.log('MagicLinkHandler: Invalid type:', type);
          setError('Invalid magic link. Please request a new one.');
          setLoading(false);
          return;
        }

        if (!accessToken || !refreshToken) {
          console.log('MagicLinkHandler: Missing tokens');
          setError('Invalid magic link. Please request a new one.');
          setLoading(false);
          return;
        }

        // Set the session with the tokens from the magic link
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          console.error('MagicLinkHandler: Session error:', sessionError);
          throw new Error('Invalid or expired magic link. Please request a new one.');
        }

        if (!data.session) {
          throw new Error('Failed to establish session. Please try again.');
        }

        console.log('MagicLinkHandler: Session established successfully');

        // Show success state briefly
        setAuthComplete(true);
        
        // Clear the URL parameters for security
        window.history.replaceState({}, document.title, window.location.pathname);

        // Navigate to dashboard after showing success
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);

      } catch (err) {
        console.error('MagicLinkHandler: Error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while processing the magic link');
        setLoading(false);
      }
    };

    handleMagicLink();
  }, [searchParams, navigate]);

  // Show authentication loading/success page
  if (loading || authComplete) {
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

  return null;
}
