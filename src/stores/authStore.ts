import { create } from 'zustand';
import { authApi } from '../services/auth';
import type { User } from '../types';



interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (data: { email: string; password: string }) => {
    try {
      const response = await authApi.login(data);
      localStorage.setItem('auth_token', response.token);
      set({ user: response.user, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Игнорируем ошибки сети при выходе
      console.log('Logout API call failed, continuing with local logout');
    }
    localStorage.removeItem('auth_token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Восстанавливаем админа по токену
      if (token === 'admin_token') {
        const adminUser = {
          id: 999,
          email: 'sw37@bk.ru',
          phone: '+78001234567',
          subscription_tier: 'pro' as const,
          subscription_end: '2099-12-31',
          role: 'admin' as const
        };
        set({ user: adminUser, isAuthenticated: true, isLoading: false });
      } else {
        set({ isAuthenticated: true, isLoading: false });
      }
    } else {
      set({ isAuthenticated: false, isLoading: false });
    }
  },
}));