import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to landing page instead of showing 404
    navigate('/', { replace: true });
  }, [navigate]);

  // Show a brief loading message while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Redirecting to homepage...</p>
      </div>
    </div>
  );
};

export default NotFound;