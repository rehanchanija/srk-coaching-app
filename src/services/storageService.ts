import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const TOKEN_KEY = 'elite_login_session';
const EXPIRY_DAYS = 99;

export const storageService = {
  saveSession: async (token: string, user: any) => {
    try {
      if (!token) {
        return;
      }

      const expiresAt = Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      const sessionData = { token, user, expiresAt };
      const serializedData = JSON.stringify(sessionData);

      await AsyncStorage.setItem(TOKEN_KEY, serializedData);

      Toast.show({
        type: 'success',
        text1: 'Storage Success',
        text2: 'Session saved to device.',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Storage Error',
        text2: error?.message || 'Failed to save login session.',
      });
    }
  },

  getSession: async () => {
    try {
      const session = await AsyncStorage.getItem(TOKEN_KEY);

      if (!session) {
        return null;
      }

      let parsed;
      try {
        parsed = JSON.parse(session);
      } catch (e) {
        return null;
      }

      const { token, user, expiresAt } = parsed;

      if (expiresAt && Date.now() > expiresAt) {
        await AsyncStorage.removeItem(TOKEN_KEY);
        return null;
      }

      return { token, user };
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Storage Retrieval Error',
        text2: error?.message || 'Failed to read login session.',
      });
      return null;
    }
  },

  removeToken: async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {}
  },

  // Debug function to see all keys in AsyncStorage
  debugStorage: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await Promise.all(
        keys.map(async key => {
          const value = await AsyncStorage.getItem(key);
          return [key, value];
        }),
      );

      return result;
    } catch (error) {}
  },
};
