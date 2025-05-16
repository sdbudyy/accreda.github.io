import { TeamMember, Review, PerformanceMetric, SupervisorStats } from '../types/supervisor';

class SupervisorService {
  async getTeamMembers(): Promise<TeamMember[]> {
    // TODO: Implement API call to fetch team members
    return [];
  }

  async getPendingReviews(): Promise<Review[]> {
    // TODO: Implement API call to fetch pending reviews
    return [];
  }

  async getTeamPerformance(): Promise<PerformanceMetric[]> {
    // TODO: Implement API call to fetch team performance metrics
    return [];
  }

  async getSupervisorStats(): Promise<SupervisorStats> {
    // TODO: Implement API call to fetch supervisor dashboard stats
    return {
      totalTeamMembers: 0,
      pendingReviews: 0,
      completedReviews: 0,
      averageTeamPerformance: 0,
    };
  }

  async submitReview(reviewId: string, feedback: string, rating: number): Promise<void> {
    // TODO: Implement API call to submit review
  }

  async updateTeamMember(teamMemberId: string, data: Partial<TeamMember>): Promise<void> {
    // TODO: Implement API call to update team member
  }
}

export const supervisorService = new SupervisorService(); 