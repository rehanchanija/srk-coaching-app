import { apiCall } from './apiService';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  phone?: string;
  address?: string;
  password?: string;
  batchId?: any; // can be string or object
  image?: string;
  joinBatchDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const studentService = {
  getAll: async (batchId?: string): Promise<User[]> => {
    const endpoint = batchId ? `/users?batchId=${batchId}` : '/users';
    return apiCall(endpoint);
  },

  create: async (data: Partial<Omit<User, '_id'>>): Promise<User> => {
    return apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getById: async (id: string): Promise<User> => {
    return apiCall(`/users/${id}`);
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    return apiCall(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
