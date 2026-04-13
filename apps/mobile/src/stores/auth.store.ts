import { create } from 'zustand';
import type { User } from '@wareable/shared';
import { signInWithGoogle, signOut } from '../services/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async () => {
    set({ isLoading: true });
    try {
      const { user } = await signInWithGoogle();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await signOut();
    set({ user: null, isAuthenticated: false });
  },
}));
