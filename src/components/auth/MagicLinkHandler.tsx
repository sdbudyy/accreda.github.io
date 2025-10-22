import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../common/LoadingSpinner';

export default function MagicLinkHandler() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

        // Clear the URL parameters for security
        window.history.replaceState({}, document.title, window.location.pathname);

        // Navigate to dashboard - the RoleBasedDashboard will handle the role-based routing
        navigate('/dashboard', { replace: true });

      } catch (err) {
        console.error('MagicLinkHandler: Error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while processing the magic link');
        setLoading(false);
      }
    };

    handleMagicLink();
  }, [searchParams, navigate]);

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

  return <LoadingSpinner />;
}
