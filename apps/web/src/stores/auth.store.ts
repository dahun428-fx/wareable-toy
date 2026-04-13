import { create } from 'zustand';
import type { User } from '@wareable/shared';
import { api } from '../lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (googleCredential: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,

  login: async (googleCredential: string) => {
    set({ isLoading: true });
    try {
      const response = await api.post<any>('/api/auth/google', { idToken: googleCredential });
      const { user, tokens } = response.data;
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      set({ user, accessToken: tokens.accessToken, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout', {});
    } catch {
      // Ignore errors on logout
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  loadUser: async () => {
    if (!get().accessToken) return;
    set({ isLoading: true });
    try {
      const response = await api.get<any>('/api/users/me');
      set({ user: response.data, isLoading: false, isAuthenticated: true });
    } catch {
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    }
  },

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, accessToken, isAuthenticated: true });
  },
}));
