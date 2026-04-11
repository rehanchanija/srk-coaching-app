import { apiCall } from './apiService';

export const authService = {
  login: async (email: string, password: string): Promise<any> => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};
