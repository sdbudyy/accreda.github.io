import { supabase } from '../lib/supabase';
import { EmailNotificationService } from '../services/emailNotificationService';

export async function sendNotification({
  userId,
  type,
  title,
  message = '',
  data = {}
}: {
  userId: string;
  type: string;
  title: string;
  message?: string;
  data?: Record<string, any>;
}) {
  console.log('Sending notification to userId:', userId);
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      data,
      read: false,
      created_at: new Date().toISOString()
    });
  if (error) {
    console.error('Error inserting notification:', error);
  } else {
    console.log('Notification inserted successfully');
  }
}

export async function fetchNotifications(userId: string) {
  console.log('Fetching notifications for user:', userId);
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching notifications:', error);
  } else {
    console.log('Fetched notifications:', notifications);
  }
  return notifications;
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);
  if (error) throw error;
}

// Helper functions for common notification types
export const sendSupervisorRequestNotification = async (supervisorId: string, eitName: string) => {
  // Send in-app notification
  await sendNotification({
    userId: supervisorId,
    type: 'request',
    title: 'New EIT Connection Request',
    message: `${eitName} has requested to connect with you as their supervisor.`,
    data: { type: 'supervisor_request' }
  });

  // Send email notification
  try {
    await EmailNotificationService.sendSupervisorReviewEmail(supervisorId, 'New EIT Connection Request', eitName);
  } catch (error) {
    console.error('Failed to send supervisor request email:', error);
  }
};

export const sendScoreNotification = async (eitId: string, skillName: string, score: number) => {
  return sendNotification({
    userId: eitId,
    type: 'score',
    title: 'New Skill Score',
    message: `You received a score of ${score} for ${skillName}.`,
    data: { type: 'skill_score', skillName, score }
  });
};

export const sendApprovalNotification = async (eitId: string, skillName: string) => {
  return sendNotification({
    userId: eitId,
    type: 'approval',
    title: 'Skill Approved',
    message: `Your ${skillName} has been approved by your supervisor.`,
    data: { type: 'skill_approval', skillName }
  });
};

export const sendValidationRequestNotification = async (supervisorId: string, eitName: string, skillName: string) => {
  return sendNotification({
    userId: supervisorId,
    type: 'validation_request',
    title: 'New Skill Validation Request',
    message: `${eitName} has requested your validation for ${skillName}.`,
    data: { type: 'validation_request', skillName }
  });
};

export const sendSAOScoreNotification = async (eitId: string, saoTitle: string, score: number) => {
  return sendNotification({
    userId: eitId,
    type: 'score',
    title: 'New SAO Score',
    message: `You received a score of ${score} for your SAO: "${saoTitle}".`,
    data: { type: 'sao_score', saoTitle, score }
  });
};

export const sendSAOValidationRequestNotification = async (supervisorId: string, eitName: string, saoTitle: string) => {
  return sendNotification({
    userId: supervisorId,
    type: 'validation_request',
    title: 'New SAO Validation Request',
    message: `${eitName} has requested your validation for SAO: "${saoTitle}".`,
    data: { type: 'sao_validation_request', saoTitle }
  });
};

export const sendNudgeNotification = async (userId: string, senderName: string) => {
  return sendNotification({
    userId,
    type: 'nudge',
    title: 'You have been nudged!',
    message: `${senderName} sent you a nudge.`,
    data: { type: 'nudge' }
  });
};

export const sendSAOFeedbackNotification = async (eitId: string, saoTitle: string) => {
  // Send in-app notification
  await sendNotification({
    userId: eitId,
    type: 'sao_feedback',
    title: 'New SAO Feedback',
    message: `You received feedback on your SAO: "${saoTitle}".`,
    data: { type: 'sao_feedback', saoTitle }
  });

  // Send email notification
  try {
    await EmailNotificationService.sendSAOFeedbackEmail(eitId, saoTitle, 'New feedback has been provided on your SAO.');
  } catch (error) {
    console.error('Failed to send SAO feedback email:', error);
  }
};

export const sendDocumentSharedNotification = async (recipientId: string, documentName: string, senderName: string) => {
  return sendNotification({
    userId: recipientId,
    type: 'document_shared',
    title: 'Document Shared',
    message: `${senderName} shared a document with you: "${documentName}".`,
    data: { type: 'document_shared', documentName, senderName }
  });
};

export const sendCustomValidationRequestNotification = async (supervisorId: string, eitName: string, skillName: string) => {
  return sendNotification({
    userId: supervisorId,
    type: 'custom_validation_request',
    title: 'New Validation Request',
    message: `${eitName} has requested validation for the skill: "${skillName}".`,
    data: { type: 'custom_validation_request', skillName, eitName }
  });
}; 