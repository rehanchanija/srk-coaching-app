import { apiCall } from './apiService';

export interface Course {
  _id: string;
  name: string;
  subjectId: string;
  progress: number;
  status: 'not_started' | 'ongoing' | 'completed';
  completionDate?: string;
  isCompleted?: boolean; // Virtual for local UI use
}

export const courseService = {
  getAll: async (): Promise<Course[]> => {
    return apiCall('/courses');
  },

  getBySubject: async (subjectId: string): Promise<Course[]> => {
    return apiCall(`/courses/${subjectId}`);
  },

  create: async (data: { name: string; subjectId: string }): Promise<Course> => {
    return apiCall('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProgress: async (id: string, progress: number): Promise<Course> => {
    return apiCall(`/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ progress }),
    });
  },
};
