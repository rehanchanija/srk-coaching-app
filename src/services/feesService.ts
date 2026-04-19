import { apiCall } from './apiService';

export interface Fee {
  _id: string;
  studentId: string | any;
  month: string;
  amount: number;
  status: 'paid' | 'unpaid';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

const feesService = {
  getStudentFees: async (studentId: string): Promise<Fee[]> => {
    try {
      return await apiCall(`/fees/student/${studentId}`);
    } catch (error) {
      console.error('Error fetching student fees:', error);
      throw error;
    }
  },

  createOrUpdateFee: async (feeData: Partial<Fee>): Promise<Fee> => {
    try {
      return await apiCall('/fees', {
        method: 'POST',
        body: JSON.stringify(feeData),
      });
    } catch (error) {
      console.error('Error saving fee:', error);
      throw error;
    }
  },

  updateFeeStatus: async (feeId: string, status: 'paid' | 'unpaid'): Promise<Fee> => {
    try {
      return await apiCall(`/fees/${feeId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error('Error updating fee status:', error);
      throw error;
    }
  },

  getAllFees: async (): Promise<Fee[]> => {
    try {
      return await apiCall('/fees');
    } catch (error) {
      console.error('Error fetching all fees:', error);
      throw error;
    }
  },
};

export default feesService;
