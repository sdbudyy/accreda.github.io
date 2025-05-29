import React, { useEffect, useState } from 'react';
import { MessageSquare, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { SAOFeedback } from '../../store/saos';
import { supabase } from '../../lib/supabase';
import { enhanceSAOClarity } from '../../lib/webllm';

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
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedText, setEnhancedText] = useState<string | null>(null);

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

  const handleEnhanceClarity = async () => {
    if (!saoContent) return;
    
    setIsEnhancing(true);
    try {
      const enhanced = await enhanceSAOClarity(saoContent);
      setEnhancedText(enhanced);
    } catch (error) {
      console.error('Error in handleEnhanceClarity:', error);
      alert(error instanceof Error ? error.message : 'Failed to enhance text. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAcceptEnhancement = () => {
    if (enhancedText) {
      setNewFeedback(prev => {
        const enhancedContent = enhancedText.replace(/~~(.*?)~~/g, '').replace(/\*\*(.*?)\*\*/g, '$1');
        return prev ? `${prev}\n\nEnhanced Version:\n${enhancedContent}` : `Enhanced Version:\n${enhancedContent}`;
      });
      setEnhancedText(null);
    }
  };

  const handleDeclineEnhancement = () => {
    setEnhancedText(null);
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
    <div className="mt-6 border-t pt-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Supervisor Feedback</h3>
      
      {feedback.length > 0 ? (
        <div className="space-y-4">
          {feedback.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <span className="text-sm font-medium text-slate-700">
                    {getStatusText(item.status)}
                  </span>
                </div>
                {isSupervisor && item.status === 'submitted' && false && (
                  <button
                    onClick={() => onResolve(item.id)}
                    className="text-sm text-teal-600 hover:text-teal-700"
                    disabled={loading}
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
              
              {item.feedback && (
                <p className="text-slate-600 whitespace-pre-wrap">{item.feedback}</p>
              )}
              
              <div className="mt-2 text-xs text-slate-500">
                {new Date(item.updated_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 italic">No feedback yet.</p>
      )}

      {isSupervisor && feedback.length > 0 && feedback[0].status === 'pending' && (
        <form onSubmit={handleSubmitFeedback} className="mt-4">
          {saoContent && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleEnhanceClarity}
                disabled={!saoContent || loading || isEnhancing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={16} className={isEnhancing ? 'animate-pulse' : ''} />
                {isEnhancing ? 'Enhancing...' : 'Enhance Clarity'}
              </button>
            </div>
          )}
          
          {enhancedText && (
            <div className="mb-4 p-4 bg-slate-50 rounded-lg">
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: enhancedText }} />
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAcceptEnhancement}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Accept Changes
                </button>
                <button
                  type="button"
                  onClick={handleDeclineEnhancement}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Decline
                </button>
              </div>
            </div>
          )}

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