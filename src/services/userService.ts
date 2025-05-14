import axios from 'axios';

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

const API_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get<User[]>(`${API_URL}/users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}; 