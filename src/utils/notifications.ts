import { supabase } from '../lib/supabase';

export const sendNotification = async (
  userId: string,
  type: 'request' | 'score' | 'approval' | 'validation_request',
  title: string,
  message: string,
  data?: any
) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data,
        read: false
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

// Helper functions for common notification types
export const sendSupervisorRequestNotification = async (supervisorId: string, eitName: string) => {
  return sendNotification(
    supervisorId,
    'request',
    'New EIT Connection Request',
    `${eitName} has requested to connect with you as their supervisor.`,
    { type: 'supervisor_request' }
  );
};

export const sendScoreNotification = async (eitId: string, skillName: string, score: number) => {
  return sendNotification(
    eitId,
    'score',
    'New Skill Score',
    `You received a score of ${score} for ${skillName}.`,
    { type: 'skill_score', skillName, score }
  );
};

export const sendApprovalNotification = async (eitId: string, skillName: string) => {
  return sendNotification(
    eitId,
    'approval',
    'Skill Approved',
    `Your ${skillName} has been approved by your supervisor.`,
    { type: 'skill_approval', skillName }
  );
};

export const sendValidationRequestNotification = async (supervisorId: string, eitName: string, skillName: string) => {
  return sendNotification(
    supervisorId,
    'validation_request',
    'New Skill Validation Request',
    `${eitName} has requested your validation for ${skillName}.`,
    { type: 'validation_request', skillName }
  );
}; 