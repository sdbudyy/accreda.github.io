import { create } from 'zustand';

interface RealtimeState {
  supervisorReviews: any[];
  saoFeedback: any[];
  relationships: any[];
  userSkills: any[];
  addSupervisorReview: (review: any) => void;
  updateSupervisorReview: (review: any) => void;
  removeSupervisorReview: (id: string) => void;
  addSaoFeedback: (feedback: any) => void;
  updateSaoFeedback: (feedback: any) => void;
  removeSaoFeedback: (id: string) => void;
  updateRelationship: (relationship: any) => void;
  updateUserSkill: (skill: any) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  supervisorReviews: [],
  saoFeedback: [],
  relationships: [],
  userSkills: [],

  addSupervisorReview: (review) =>
    set((state) => ({
      supervisorReviews: [...state.supervisorReviews, review],
    })),

  updateSupervisorReview: (review) =>
    set((state) => ({
      supervisorReviews: state.supervisorReviews.map((r) =>
        r.id === review.id ? review : r
      ),
    })),

  removeSupervisorReview: (id) =>
    set((state) => ({
      supervisorReviews: state.supervisorReviews.filter((r) => r.id !== id),
    })),

  addSaoFeedback: (feedback) =>
    set((state) => ({
      saoFeedback: [...state.saoFeedback, feedback],
    })),

  updateSaoFeedback: (feedback) =>
    set((state) => ({
      saoFeedback: state.saoFeedback.map((f) =>
        f.id === feedback.id ? feedback : f
      ),
    })),

  removeSaoFeedback: (id) =>
    set((state) => ({
      saoFeedback: state.saoFeedback.filter((f) => f.id !== id),
    })),

  updateRelationship: (relationship) =>
    set((state) => ({
      relationships: state.relationships.map((r) =>
        r.id === relationship.id ? relationship : r
      ),
    })),

  updateUserSkill: (skill) =>
    set((state) => ({
      userSkills: state.userSkills.map((s) =>
        s.id === skill.id ? skill : s
      ),
    })),
})); 