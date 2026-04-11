import { apiCall } from './apiService';

export interface DashboardStats {
  totalBatches: number;
  totalStudents: number;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    return apiCall('/dashboard/stats');
  },
};
