import React from 'react';
import { GraduationCap } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="bg-teal-500 text-white p-1.5 rounded">
        <GraduationCap size={22} />
      </div>
      <span className="font-bold text-xl">EIT Track</span>
    </div>
  );
};

export default Logo;