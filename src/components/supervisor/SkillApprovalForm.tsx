import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { sendApprovalNotification } from '../../utils/notifications';

interface SkillApprovalFormProps {
  eitId: string;
  skillId: string;
  skillName: string;
  onApprovalComplete: () => void;
}

const SkillApprovalForm: React.FC<SkillApprovalFormProps> = ({
  eitId,
  skillId,
  skillName,
  onApprovalComplete
}) => {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user's profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Create approval record
      const { error: approvalError } = await supabase
        .from('skill_approvals')
        .insert({
          eit_id: eitId,
          skill_id: skillId,
          supervisor_id: user.id,
          feedback,
          approved_at: new Date().toISOString()
        });

      if (approvalError) throw approvalError;

      // Update skill status
      const { error: skillError } = await supabase
        .from('eit_skills')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('eit_id', eitId)
        .eq('skill_id', skillId);

      if (skillError) throw skillError;

      // Send notification to EIT
      await sendApprovalNotification(eitId, skillName);

      toast.success('Skill approved successfully');
      onApprovalComplete();
    } catch (error) {
      console.error('Error approving skill:', error);
      toast.error('Failed to approve skill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Feedback</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          rows={4}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
      >
        {loading ? 'Approving...' : 'Approve Skill'}
      </button>
    </form>
  );
};

export default SkillApprovalForm; 