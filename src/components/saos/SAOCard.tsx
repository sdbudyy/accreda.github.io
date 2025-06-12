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
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{sao.title}</h3>
          <p className="text-sm text-slate-500 mt-1">Employer: {sao.employer}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(sao)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit SAO"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={() => onDelete(sao.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete SAO"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="font-semibold text-slate-700 mb-1">Situation</div>
          <div className="text-slate-600 whitespace-pre-wrap prose prose-sm max-w-none">{sao.situation}</div>
        </div>
        <div>
          <div className="font-semibold text-slate-700 mb-1">Action</div>
          <div className="text-slate-600 whitespace-pre-wrap prose prose-sm max-w-none">{sao.action}</div>
        </div>
        <div>
          <div className="font-semibold text-slate-700 mb-1">Outcome</div>
          <div className="text-slate-600 whitespace-pre-wrap prose prose-sm max-w-none">{sao.outcome}</div>
        </div>
      </div>
      {/* Annotation UI for both EIT and Supervisor */}
      <SAOAnnotation saoId={sao.id} content={sao.situation + '\n' + sao.action + '\n' + sao.outcome} />
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