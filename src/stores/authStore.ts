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
      // Админ вход
      if (data.email === 'admin@rentologiya.ru' && data.password === 'admin') {
        const adminUser = {
          id: 999,
          email: 'admin@rentologiya.ru',
          phone: '+78001234567',
          subscription_tier: 'pro' as const,
          subscription_end: '2099-12-31',
          role: 'admin' as const
        };
        localStorage.setItem('auth_token', 'admin_token');
        set({ user: adminUser, isAuthenticated: true });
        return;
      }
      
      // Демо вход
      if (data.email === 'user@example.com' && data.password === 'password') {
        const demoUser = {
          id: 1,
          email: 'user@example.com',
          phone: '+7 999 123-45-67',
          subscription_tier: 'basic' as const,
          subscription_end: '2024-12-31',
          role: 'user' as const
        };
        localStorage.setItem('auth_token', 'demo_token');
        set({ user: demoUser, isAuthenticated: true });
        return;
      }
      
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
      // Восстанавливаем пользователя по токену
      if (token === 'admin_token') {
        const adminUser = {
          id: 999,
          email: 'admin@rentologiya.ru',
          phone: '+78001234567',
          subscription_tier: 'pro' as const,
          subscription_end: '2099-12-31',
          role: 'admin' as const
        };
        set({ user: adminUser, isAuthenticated: true, isLoading: false });
      } else if (token === 'demo_token') {
        const demoUser = {
          id: 1,
          email: 'user@example.com',
          phone: '+7 999 123-45-67',
          subscription_tier: 'basic' as const,
          subscription_end: '2024-12-31',
          role: 'user' as const
        };
        set({ user: demoUser, isAuthenticated: true, isLoading: false });
      } else {
        set({ isAuthenticated: true, isLoading: false });
      }
    } else {
      set({ isAuthenticated: false, isLoading: false });
    }
  },
}));