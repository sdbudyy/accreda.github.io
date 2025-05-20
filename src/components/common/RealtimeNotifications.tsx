import React from 'react';
import { useRealtime } from '../../hooks/useRealtime';
import { useRealtimeStore } from '../../store/realtime';
import { useNotificationPreferences } from '../../store/notificationPreferences';
import toast from 'react-hot-toast';

interface RealtimeNotificationsProps {
  userId: string;
}

const RealtimeNotifications: React.FC<RealtimeNotificationsProps> = ({ userId }) => {
  const {
    addSupervisorReview,
    updateSupervisorReview,
    addSaoFeedback,
    updateSaoFeedback,
    updateRelationship,
    updateUserSkill,
  } = useRealtimeStore();

  const {
    supervisorReviews,
    saoFeedback,
    relationships,
    userSkills,
  } = useNotificationPreferences();

  useRealtime([
    {
      table: 'supervisor_reviews',
      filter: `eit_id=eq.${userId}`,
      callback: (payload) => {
        if (!supervisorReviews) return;
        
        if (payload.eventType === 'INSERT') {
          addSupervisorReview(payload.new);
          toast.success('New review received!');
        } else if (payload.eventType === 'UPDATE') {
          updateSupervisorReview(payload.new);
          toast.success('Review updated!');
        }
      },
    },
    {
      table: 'sao_feedback',
      filter: `sao_id=in.(select id from saos where user_id=eq.${userId})`,
      callback: (payload) => {
        if (!saoFeedback) return;
        
        if (payload.eventType === 'INSERT') {
          addSaoFeedback(payload.new);
          toast.success('New SAO feedback received!');
        } else if (payload.eventType === 'UPDATE') {
          updateSaoFeedback(payload.new);
          toast.success('SAO feedback updated!');
        }
      },
    },
    {
      table: 'supervisor_eit_relationships',
      filter: `eit_id=eq.${userId}`,
      callback: (payload) => {
        if (!relationships) return;
        
        if (payload.eventType === 'UPDATE') {
          updateRelationship(payload.new);
          toast.success('Relationship status updated!');
        }
      },
    },
    {
      table: 'user_skills',
      filter: `user_id=eq.${userId}`,
      callback: (payload) => {
        if (!userSkills) return;
        
        if (payload.eventType === 'UPDATE') {
          updateUserSkill(payload.new);
          toast.success('Skill status updated!');
        }
      },
    },
  ]);

  return null; // This component doesn't render anything visible
};

export default RealtimeNotifications; 