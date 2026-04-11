import { apiCall } from './apiService';

export interface Subject {
  _id: string;
  name: string;
  batchId: string;
  totalChapters?: number;
  completedChapters?: number;
  progress?: number;
}

export const subjectService = {
  getAll: async (): Promise<Subject[]> => {
    return apiCall('/subjects');
  },

  getByBatch: async (batchId: string): Promise<Subject[]> => {
    return apiCall(`/subjects/${batchId}`);
  },

  create: async (data: Omit<Subject, '_id'>): Promise<Subject> => {
    return apiCall('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
