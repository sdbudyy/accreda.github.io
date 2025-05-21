import { TeamMember, Review, PerformanceMetric, SupervisorStats } from '../types/supervisor';

export interface SupervisorCategoryAverage {
  category: string;
  average_score: number;
  num_eits: number;
  num_skill_entries: number;
}

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

  async getCategoryAverages(supervisorId: string): Promise<SupervisorCategoryAverage[]> {
    const { data, error } = await (await import('../lib/supabase')).supabase
      .rpc('get_supervisor_category_averages', { supervisor_uuid: supervisorId });
    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data as SupervisorCategoryAverage[];
  }
}

export const supervisorService = new SupervisorService(); 