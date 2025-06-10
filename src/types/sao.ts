export interface SAOAnnotation {
  id: string;
  sao_id: string;
  supervisor_id: string | null;
  created_by: string;
  author_name: string;
  author_role: 'supervisor' | 'eit';
  location: any; // JSON object, e.g., { start: number, end: number }
  annotation: string;
  created_at: string;
  updated_at: string;
  status?: string;
  resolved?: boolean;
}

export interface SAO {
  id: string;
  title: string;
  situation: string;
  action: string;
  outcome: string;
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
  annotations?: SAOAnnotation[];
} 