import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SupervisorNotificationPreferences {
  eitRequests: boolean;
  skillValidationRequests: boolean;
  saoFeedback: boolean;
  weeklyDigest: boolean;
  toggleEitRequests: () => void;
  toggleSkillValidationRequests: () => void;
  toggleSaoFeedback: () => void;
  toggleWeeklyDigest: () => void;
}

export const useSupervisorNotificationPreferences = create<SupervisorNotificationPreferences>()(
  persist(
    (set) => ({
      eitRequests: true,
      skillValidationRequests: true,
      saoFeedback: true,
      weeklyDigest: true,
      toggleEitRequests: () =>
        set((state) => ({ eitRequests: !state.eitRequests })),
      toggleSkillValidationRequests: () =>
        set((state) => ({ skillValidationRequests: !state.skillValidationRequests })),
      toggleSaoFeedback: () =>
        set((state) => ({ saoFeedback: !state.saoFeedback })),
      toggleWeeklyDigest: () =>
        set((state) => ({ weeklyDigest: !state.weeklyDigest })),
    }),
    {
      name: 'supervisor-notification-preferences',
    }
  )
); 