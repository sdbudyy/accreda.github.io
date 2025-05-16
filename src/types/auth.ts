export type AccountType = 'eit' | 'supervisor';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  account_type: AccountType;
  created_at: string;
  updated_at: string;
} 