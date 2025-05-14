import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
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