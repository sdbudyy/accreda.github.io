import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { sendScoreNotification } from '../../utils/notifications';
import { AlertTriangle } from 'lucide-react';

interface SkillValidationFormProps {
  eitId: string;
  skillId: string;
  skillName: string;
  onValidationComplete: () => void;
}

interface ValidationWarningProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ValidationWarning: React.FC<ValidationWarningProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-yellow-500 mt-0.5 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Warning: Skill Already Validated</h3>
            <p className="text-gray-600 mb-4">
              This skill has already been validated. Changing the score will create a new validation record.
              Are you sure you want to proceed?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [isValidated, setIsValidated] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<{ score: number; feedback: string } | null>(null);

  useEffect(() => {
    const checkValidationStatus = async () => {
      console.log('Checking validation status for:', { eitId, skillId });
      const { data: validations, error } = await supabase
        .from('skill_validations')
        .select('*')
        .eq('eit_id', eitId)
        .eq('skill_id', skillId)
        .order('validated_at', { ascending: false })
        .limit(1);

      console.log('Validation status check result:', { validations, error });
      if (!error && validations && validations.length > 0) {
        console.log('Found existing validation, setting isValidated to true');
        setIsValidated(true);
      } else {
        console.log('No existing validation found, setting isValidated to false');
        setIsValidated(false);
      }
    };

    checkValidationStatus();
  }, [eitId, skillId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, isValidated:', isValidated);
    
    if (isValidated) {
      console.log('Skill is validated, showing warning');
      setPendingSubmission({ score, feedback });
      setShowWarning(true);
      return;
    }

    console.log('Skill is not validated, proceeding with submission');
    await submitValidation(score, feedback);
  };

  const submitValidation = async (scoreToSubmit: number, feedbackToSubmit: string) => {
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
          score: scoreToSubmit,
          feedback: feedbackToSubmit,
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
      console.log('About to send score notification', eitId, skillName, scoreToSubmit);
      await sendScoreNotification(eitId, skillName, scoreToSubmit);
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

  const handleWarningConfirm = () => {
    if (pendingSubmission) {
      submitValidation(pendingSubmission.score, pendingSubmission.feedback);
    }
    setShowWarning(false);
    setPendingSubmission(null);
  };

  const handleWarningCancel = () => {
    setShowWarning(false);
    setPendingSubmission(null);
  };

  return (
    <>
      <ValidationWarning
        isOpen={showWarning}
        onConfirm={handleWarningConfirm}
        onCancel={handleWarningCancel}
      />
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
    </>
  );
};

export default SkillValidationForm; 