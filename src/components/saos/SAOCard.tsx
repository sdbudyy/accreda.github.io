import React, { useEffect, useRef } from 'react';
import { FileEdit, Edit3, Trash2 } from 'lucide-react';
import { SAO } from '../../types/sao';

interface SAOCardProps {
  sao: SAO;
  onEdit: (sao: SAO) => void;
  onDelete: (id: string) => void;
}

const SAOCard: React.FC<SAOCardProps> = ({ sao, onEdit, onDelete }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleHighlight = (e: CustomEvent) => {
      if (e.detail.saoId === sao.id) {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cardRef.current?.classList.add('ring', 'ring-teal-400');
        setTimeout(() => {
          cardRef.current?.classList.remove('ring', 'ring-teal-400');
        }, 1500);
      }
    };

    window.addEventListener('highlight-sao', handleHighlight as EventListener);
    return () => window.removeEventListener('highlight-sao', handleHighlight as EventListener);
  }, [sao.id]);

  return (
    <div 
      ref={cardRef}
      className="card hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between">
        <h3 className="font-semibold text-lg text-slate-800">{sao.title}</h3>
        <div className="flex space-x-1">
          <button 
            onClick={() => onEdit(sao)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={() => onDelete(sao.id)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <p className="text-sm text-slate-600 mt-2">{sao.description}</p>
      
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          <span>Updated {new Date(sao.updated_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}</span>
        </div>
        
        <button className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700">
          <FileEdit size={16} />
        </button>
      </div>
    </div>
  );
};

export default SAOCard; 