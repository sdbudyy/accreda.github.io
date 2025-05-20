import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SupervisorNotificationPreferences {
  eitRequests: boolean;
  skillValidationRequests: boolean;
  saoFeedback: boolean;
  toggleEitRequests: () => void;
  toggleSkillValidationRequests: () => void;
  toggleSaoFeedback: () => void;
}

export const useSupervisorNotificationPreferences = create<SupervisorNotificationPreferences>()(
  persist(
    (set) => ({
      eitRequests: true,
      skillValidationRequests: true,
      saoFeedback: true,
      toggleEitRequests: () =>
        set((state) => ({ eitRequests: !state.eitRequests })),
      toggleSkillValidationRequests: () =>
        set((state) => ({ skillValidationRequests: !state.skillValidationRequests })),
      toggleSaoFeedback: () =>
        set((state) => ({ saoFeedback: !state.saoFeedback })),
    }),
    {
      name: 'supervisor-notification-preferences',
    }
  )
); 