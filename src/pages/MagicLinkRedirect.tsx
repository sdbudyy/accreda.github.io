import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AccredaLogo from '../assets/accreda-logo.png';

export default function MagicLinkRedirect() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleMagicLink = async () => {
      try {
        console.log('MagicLinkRedirect: Processing magic link authentication');
        
        // Extract tokens from URL parameters
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');

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

        console.log('MagicLinkRedirect: Authentication successful');
        setStatus('success');

        // Send message to parent window (forgot password tab) to redirect
        if (window.opener) {
          window.opener.postMessage({
            type: 'MAGIC_LINK_AUTH_SUCCESS',
            message: 'Authentication successful, redirecting to dashboard'
          }, window.location.origin);
        }

        // Close this tab after a brief delay
        setTimeout(() => {
          window.close();
        }, 1000);

      } catch (err) {
        console.error('MagicLinkRedirect: Error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while processing the magic link');
        setStatus('error');
        
        // Still try to close the tab even on error
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    };

    handleMagicLink();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <img src={AccredaLogo} alt="Accreda Logo" className="h-24 w-auto mb-6" />
          
          {status === 'processing' && (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                Processing Login...
              </h2>
              <p className="text-sm text-slate-600 text-center">
                Please wait while we authenticate your account and redirect you.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-green-600 text-4xl mb-4">✓</div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                Login Successful!
              </h2>
              <p className="text-sm text-slate-600 text-center">
                Redirecting you to the dashboard. This window will close automatically.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-red-600 text-4xl mb-4">✗</div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                Login Failed
              </h2>
              <p className="text-sm text-red-600 text-center mb-4">
                {error}
              </p>
              <p className="text-xs text-slate-500 text-center">
                This window will close automatically. Please try requesting a new login link.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
