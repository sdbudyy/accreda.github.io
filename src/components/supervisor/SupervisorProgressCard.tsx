import React, { useEffect, useState, ReactNode } from 'react';

interface SupervisorProgressCardProps {
  title: string;
  value: number;
  total?: number;
  description: string;
  color: 'teal' | 'blue' | 'indigo' | 'purple';
  showPercentage?: boolean;
}

const cardIcons: Record<string, ReactNode> = {
  teal: <svg className="w-7 h-7 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>,
  blue: <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" /></svg>,
  indigo: <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12,2 22,22 2,22" /></svg>,
  purple: <svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="10" ry="6" /></svg>
};

const colorClasses = {
  teal: {
    border: 'border-l-8 border-teal-500',
    bg: 'bg-teal-500',
    text: 'text-teal-700',
    lightBg: 'bg-teal-100'
  },
  blue: {
    border: 'border-l-8 border-blue-500',
    bg: 'bg-blue-500',
    text: 'text-blue-700',
    lightBg: 'bg-blue-100'
  },
  indigo: {
    border: 'border-l-8 border-indigo-500',
    bg: 'bg-indigo-500',
    text: 'text-indigo-700',
    lightBg: 'bg-indigo-100'
  },
  purple: {
    border: 'border-l-8 border-purple-500',
    bg: 'bg-purple-500',
    text: 'text-purple-700',
    lightBg: 'bg-purple-100'
  }
};

const SupervisorProgressCard: React.FC<SupervisorProgressCardProps> = ({ 
  title, 
  value, 
  total = 100, 
  description,
  color,
  showPercentage = true
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.round((value / total) * 100);
  
  useEffect(() => {
    // Animate to the new value with a small delay
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        setAnimatedValue(percentage);
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);
  
  return (
    <div className={`card shadow-lg ${colorClasses[color].border} hover:scale-[1.03] transition-transform duration-200 bg-white`}> 
      <div className="flex items-center gap-4 mb-4">
        <div>{cardIcons[color]}</div>
        <div>
          <h3 className="font-semibold text-lg text-slate-800 mb-1">{title}</h3>
          <span className="block text-3xl font-extrabold text-slate-900 leading-tight">{showPercentage ? `${percentage}%` : value}</span>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-slate-500 font-medium">{description}</span>
        {total !== 100 && (
          <span className="font-semibold text-slate-700">{value}/{total}</span>
        )}
      </div>
      {showPercentage && (
        <div className="w-full h-2 rounded bg-slate-100 mt-2">
          <div 
            className={`${colorClasses[color].bg} h-2 rounded transition-all duration-700`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}

export default SupervisorProgressCard; 