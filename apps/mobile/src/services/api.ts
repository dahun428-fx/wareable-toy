import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3002';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Device API
export async function getDevices() {
  const { data } = await apiClient.get('/api/devices');
  return data.data as Array<{ id: string; platform: string; deviceName: string | null; isActive: boolean }>;
}

export async function registerDevice(platform: string, deviceName?: string, deviceModel?: string) {
  const { data } = await apiClient.post('/api/devices', { platform, deviceName, deviceModel });
  return data.data as { id: string; platform: string; deviceName: string | null };
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });
          await SecureStore.setItemAsync('accessToken', data.data.tokens.accessToken);
          await SecureStore.setItemAsync('refreshToken', data.data.tokens.refreshToken);
          error.config.headers.Authorization = `Bearer ${data.data.tokens.accessToken}`;
          return apiClient(error.config);
        } catch {
          await SecureStore.deleteItemAsync('accessToken');
          await SecureStore.deleteItemAsync('refreshToken');
        }
      }
    }
    return Promise.reject(error);
  }
);
