import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if this is a magic link redirect that failed
    const urlParams = new URLSearchParams(location.search);
    const hash = location.hash;
    
    // If there are auth tokens in the URL, try to process them
    if (hash.includes('access_token') || urlParams.get('access_token')) {
      // This might be a magic link that failed to redirect properly
      // Redirect to dashboard to let the auth system handle it
      navigate('/dashboard', { replace: true });
    } else {
      // Regular 404, redirect to homepage
      navigate('/', { replace: true });
    }
  }, [navigate, location]);

  // Show a brief loading message while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Processing login...</p>
      </div>
    </div>
  );
};

export default NotFound;