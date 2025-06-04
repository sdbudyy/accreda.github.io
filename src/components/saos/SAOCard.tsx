import React, { useEffect, useRef, useState } from 'react';
import { FileEdit, Edit3, Trash2 } from 'lucide-react';
import { SAO } from '../../types/sao';
import SAOFeedbackComponent from './SAOFeedback';
import { useSAOsStore } from '../../store/saos';
import { supabase } from '../../lib/supabase';
import SAOAnnotation from './SAOAnnotation';
import DOMPurify from 'dompurify';

interface SAOCardProps {
  sao: SAO;
  onEdit: (sao: SAO) => void;
  onDelete: (id: string) => void;
}

const SAOCard: React.FC<SAOCardProps> = ({ sao, onEdit, onDelete }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const { resolveFeedback, submitFeedback } = useSAOsStore();

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('supervisor_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      setIsSupervisor(!!profile);
    };

    checkUserRole();
  }, []);

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
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg text-slate-800">{sao.title}</h3>
        <div className="flex items-center space-x-2">
          {/* Status Tag */}
          {sao.status === 'draft' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">Draft</span>
          )}
          {sao.status === 'complete' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Complete</span>
          )}
          {sao.feedback && sao.feedback.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {sao.feedback.some(f => f.status === 'pending') ? 'Feedback Pending' : 'Has Feedback'}
            </span>
          )}
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
      <div
        className="text-slate-600 whitespace-pre-wrap mb-4 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(sao.content) }}
      />

      {/* Annotation UI for both EIT and Supervisor */}
      <SAOAnnotation saoId={sao.id} content={sao.content} />

      {sao.feedback && (
        <SAOFeedbackComponent
          feedback={sao.feedback}
          onResolve={resolveFeedback}
          onSubmitFeedback={submitFeedback}
          isSupervisor={isSupervisor}
        />
      )}

      <div className="mt-4 text-sm text-slate-500">
        Created: {new Date(sao.created_at).toLocaleDateString()}
      </div>
    </div>
  );
};

export default SAOCard; 