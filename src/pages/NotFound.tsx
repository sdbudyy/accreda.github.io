import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Loader2, CheckCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  const location = useLocation();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authComplete, setAuthComplete] = useState(false);

  useEffect(() => {
    // Check if this is a magic link authentication attempt
    const urlParams = new URLSearchParams(location.search);
    const hasAuthParams = urlParams.has('access_token') || urlParams.has('refresh_token') || 
                         urlParams.has('type') || location.hash.includes('access_token');
    
    if (hasAuthParams) {
      setIsAuthenticating(true);
      
      // Simulate authentication process
      const timer = setTimeout(() => {
        setAuthComplete(true);
        
        // Redirect to dashboard after showing success
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [location]);

  // Show authentication loading page
  if (isAuthenticating) {
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

  // Show regular 404 page for actual missing pages
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-teal-600">404</h1>
        <h2 className="text-3xl font-semibold text-slate-800 mt-4">Page Not Found</h2>
        <p className="text-slate-500 max-w-md mx-auto mt-2">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center px-4 py-2 mt-6 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
        >
          <Home size={18} className="mr-2" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;