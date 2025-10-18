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
    // Принудительно очищаем старые токены
    const token = localStorage.getItem('auth_token');
    if (token === 'admin_token' || token === 'demo_token') {
      localStorage.removeItem('auth_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    
    if (token) {
      set({ isAuthenticated: true, isLoading: false });
    } else {
      set({ isAuthenticated: false, isLoading: false });
    }
  },
}));