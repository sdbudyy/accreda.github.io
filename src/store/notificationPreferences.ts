import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationPreferences {
  supervisorReviews: boolean;
  saoFeedback: boolean;
  relationships: boolean;
  userSkills: boolean;
  toggleSupervisorReviews: () => void;
  toggleSaoFeedback: () => void;
  toggleRelationships: () => void;
  toggleUserSkills: () => void;
}

export const useNotificationPreferences = create<NotificationPreferences>()(
  persist(
    (set) => ({
      supervisorReviews: true,
      saoFeedback: true,
      relationships: true,
      userSkills: true,

      toggleSupervisorReviews: () =>
        set((state) => ({
          supervisorReviews: !state.supervisorReviews,
        })),

      toggleSaoFeedback: () =>
        set((state) => ({
          saoFeedback: !state.saoFeedback,
        })),

      toggleRelationships: () =>
        set((state) => ({
          relationships: !state.relationships,
        })),

      toggleUserSkills: () =>
        set((state) => ({
          userSkills: !state.userSkills,
        })),
    }),
    {
      name: 'notification-preferences',
    }
  )
); 