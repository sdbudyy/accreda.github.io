import React, { useState } from 'react';
import { MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
import { SAOFeedback } from '../../store/saos';
import { supabase } from '../../lib/supabase';

interface SAOFeedbackProps {
  feedback: SAOFeedback[];
  onResolve: (feedbackId: string) => Promise<void>;
  onSubmitFeedback: (saoId: string, feedback: string) => Promise<void>;
  isSupervisor: boolean;
}

const SAOFeedbackComponent: React.FC<SAOFeedbackProps> = ({
  feedback,
  onResolve,
  onSubmitFeedback,
  isSupervisor
}) => {
  const [newFeedback, setNewFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedback.trim()) return;

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
                {isSupervisor && item.status === 'submitted' && (
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
              disabled={loading || !newFeedback.trim()}
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