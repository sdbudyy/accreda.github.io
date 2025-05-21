export interface SAO {
  id: string;
  title: string;
  description: string;
  content: string;
  status: 'draft' | 'complete';
  eit_id: string;
  created_at: string;
  updated_at: string;
  feedback?: Array<{
    id: string;
    sao_id: string;
    supervisor_id: string;
    feedback: string;
    status: 'pending' | 'submitted' | 'resolved';
    created_at: string;
    updated_at: string;
  }>;
} 