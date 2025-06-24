import React, { useEffect, useState } from 'react';
import { MessageSquare, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { SAOFeedback } from '../../store/saos';
import { supabase } from '../../lib/supabase';
import DOMPurify from 'dompurify';

interface SAOFeedbackProps {
  feedback: SAOFeedback[];
  onResolve: (feedbackId: string) => Promise<void>;
  onSubmitFeedback: (saoId: string, feedback: string) => Promise<void>;
  isSupervisor: boolean;
  saoContent?: string;
}

const SAOFeedbackComponent: React.FC<SAOFeedbackProps> = ({
  feedback,
  onResolve,
  onSubmitFeedback,
  isSupervisor,
  saoContent
}) => {
  const [newFeedback, setNewFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [annotationCount, setAnnotationCount] = useState(0);

  useEffect(() => {
    // Fetch annotation count for this SAO
    const fetchCount = async () => {
      if (feedback.length > 0) {
        const { count } = await supabase
          .from('sao_annotation')
          .select('id', { count: 'exact', head: true })
          .eq('sao_id', feedback[0].sao_id);
        setAnnotationCount(count || 0);
      }
    };
    fetchCount();
  }, [feedback]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedback.trim() && annotationCount === 0) return;
    setLoading(true);
    try {
      await onSubmitFeedback(feedback[0].sao_id, newFeedback);
      setNewFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <MessageSquare className="text-yellow-500" size={16} />;
      case 'submitted':
        return <CheckCircle2 className="text-green-500" size={16} />;
      case 'resolved':
        return <XCircle className="text-slate-400" size={16} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'submitted':
        return 'Feedback Submitted';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <div key={item.id} className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(item.status)}
            <span className="text-sm font-medium text-slate-700">
              {getStatusText(item.status)}
            </span>
          </div>
          {item.feedback && (
            <div
              className="text-slate-700 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.feedback) }}
            />
          )}
        </div>
      ))}

      {isSupervisor && feedback.length > 0 && feedback[0].status === 'pending' && (
        <form onSubmit={handleSubmitFeedback} className="mt-4">
          <textarea
            value={newFeedback}
            onChange={(e) => setNewFeedback(e.target.value)}
            placeholder="Enter your feedback..."
            className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            rows={4}
            disabled={loading}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || (!newFeedback.trim() && annotationCount === 0)}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SAOFeedbackComponent; 