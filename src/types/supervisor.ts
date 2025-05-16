export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  performanceScore?: number;
  lastReviewDate?: Date;
}

export interface Review {
  id: string;
  teamMemberId: string;
  teamMemberName: string;
  status: 'pending' | 'completed' | 'in_progress';
  createdAt: Date;
  updatedAt: Date;
  feedback?: string;
  rating?: number;
}

export interface PerformanceMetric {
  id: string;
  teamMemberId: string;
  metricName: string;
  value: number;
  target: number;
  period: string;
}

export interface SupervisorStats {
  totalTeamMembers: number;
  pendingReviews: number;
  completedReviews: number;
  averageTeamPerformance: number;
} 