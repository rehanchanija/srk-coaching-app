import { apiCall } from './apiService';

export interface Batch {
  _id: string;
  name: string;
  type: 'morning' | 'evening';
  startDate: string; // ISO Date
  completionDate: string; // ISO Date
  progress?: number;
}

export const batchService = {
  getAll: async (type?: string): Promise<Batch[]> => {
    const endpoint = type ? `/batches?type=${type}` : '/batches';
    return apiCall(endpoint);
  },

  create: async (data: Omit<Batch, '_id'>): Promise<Batch> => {
    return apiCall('/batches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  findById: async (id: string): Promise<Batch> => {
    return apiCall(`/batches/${id}`);
  },
};
