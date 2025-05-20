import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { sendScoreNotification } from '../../utils/notifications';

interface SkillValidationFormProps {
  eitId: string;
  skillId: string;
  skillName: string;
  onValidationComplete: () => void;
}

const SkillValidationForm: React.FC<SkillValidationFormProps> = ({
  eitId,
  skillId,
  skillName,
  onValidationComplete
}) => {
  console.log('SkillValidationForm rendered');
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit called');
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user's profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Create validation record
      const { error: validationError } = await supabase
        .from('skill_validations')
        .insert({
          eit_id: eitId,
          skill_id: skillId,
          validator_id: user.id,
          score,
          feedback,
          validated_at: new Date().toISOString()
        });

      if (validationError) throw validationError;

      // Update skill status
      const { error: skillError } = await supabase
        .from('eit_skills')
        .update({
          status: 'validated',
          validated_at: new Date().toISOString()
        })
        .eq('eit_id', eitId)
        .eq('skill_id', skillId);

      if (skillError) throw skillError;

      // Send notification to EIT
      console.log('About to send score notification', eitId, skillName, score);
      await sendScoreNotification(eitId, skillName, score);
      console.log('Score notification sent!');

      toast.success('Skill validated successfully');
      onValidationComplete();
    } catch (error) {
      console.error('Error validating skill:', error);
      toast.error('Failed to validate skill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Score</label>
        <input
          type="number"
          min="0"
          max="5"
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          required
        />
      </div>

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
        {loading ? 'Validating...' : 'Submit Validation'}
      </button>
    </form>
  );
};

export default SkillValidationForm; 