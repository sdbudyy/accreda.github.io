import React, { useEffect, useState } from 'react';

interface SupervisorProgressCardProps {
  title: string;
  value: number;
  total?: number;
  description: string;
  color: 'teal' | 'blue' | 'indigo' | 'purple';
  showPercentage?: boolean;
}

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
  
  const colorClasses = {
    teal: {
      bg: 'bg-teal-500',
      text: 'text-teal-700',
      lightBg: 'bg-teal-100'
    },
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-700',
      lightBg: 'bg-blue-100'
    },
    indigo: {
      bg: 'bg-indigo-500',
      text: 'text-indigo-700',
      lightBg: 'bg-indigo-100'
    },
    purple: {
      bg: 'bg-purple-500',
      text: 'text-purple-700',
      lightBg: 'bg-purple-100'
    }
  };

  return (
    <div className="card hover:scale-[1.02] transition-transform duration-200">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-slate-800">{title}</h3>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100">
          <span className={`text-sm font-semibold ${colorClasses[color].text}`}>
            {showPercentage ? `${percentage}%` : value}
          </span>
        </div>
      </div>
      
      {showPercentage && (
        <div className="progress-bar mb-2">
          <div 
            className={`progress-bar-fill ${colorClasses[color].bg}`} 
            style={{ 
              width: `${animatedValue}%`,
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          ></div>
        </div>
      )}
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">{description}</span>
        {total !== 100 && (
          <span className="font-medium text-slate-700">{value}/{total}</span>
        )}
      </div>
    </div>
  );
}

export default SupervisorProgressCard; 