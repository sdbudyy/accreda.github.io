import React, { useEffect, useState } from 'react';
import SAOFeedbackComponent from '../components/saos/SAOFeedback';
import { supabase } from '../lib/supabase';

interface SAOFeedback {
  id: string;
  sao_id: string;
  supervisor_id: string;
  feedback: string;
  status: 'pending' | 'submitted' | 'resolved';
  created_at: string;
  updated_at: string;
  sao?: {
    title: string;
    content: string;
    created_at: string;
    eit_id: string;
  };
}

const SupervisorSAOFeedback: React.FC = () => {
  const [feedbackRequests, setFeedbackRequests] = useState<SAOFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbackRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No authenticated user');
        const { data, error } = await supabase
          .from('sao_feedback')
          .select(`*, sao:saos (title, content, created_at, eit_id)`) // join with SAO details
          .eq('supervisor_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setFeedbackRequests(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load feedback requests');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbackRequests();
  }, []);

  const handleResolve = async (feedbackId: string) => {
    await supabase
      .from('sao_feedback')
      .update({ status: 'resolved' })
      .eq('id', feedbackId);
    setFeedbackRequests((prev) =>
      prev.map((f) => (f.id === feedbackId ? { ...f, status: 'resolved' } : f))
    );
  };

  const handleSubmitFeedback = async (saoId: string, feedback: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('sao_feedback')
      .update({ feedback, status: 'submitted' })
      .eq('sao_id', saoId)
      .eq('supervisor_id', user.id);
    setFeedbackRequests((prev) =>
      prev.map((f) =>
        f.sao_id === saoId ? { ...f, feedback, status: 'submitted' } : f
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">SAO Feedback Requests</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : feedbackRequests.length === 0 ? (
        <div className="text-slate-500">No feedback requests assigned to you.</div>
      ) : (
        <div className="space-y-8">
          {feedbackRequests.map((req) => (
            <div key={req.id} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-2">{req.sao?.title || 'Untitled SAO'}</h2>
              <div className="mb-2 text-slate-600 whitespace-pre-wrap">{req.sao?.content}</div>
              <div className="mb-2 text-xs text-slate-500">Created: {req.sao ? new Date(req.sao.created_at).toLocaleDateString() : ''}</div>
              <SAOFeedbackComponent
                feedback={[req]}
                onResolve={handleResolve}
                onSubmitFeedback={handleSubmitFeedback}
                isSupervisor={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupervisorSAOFeedback; 