export interface SAO {
  id: string;
  title: string;
  description: string;
  content: string;
  status: 'draft' | 'in-review' | 'approved' | 'rejected';
  eit_id: string;
  created_at: string;
  updated_at: string;
} 