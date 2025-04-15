export interface Project {
  id: string;
  name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export interface Investment {
  id: string;
  project_id: string;
  investor_id: string;
  amount: number;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
} 