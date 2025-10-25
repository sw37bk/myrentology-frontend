// Auth service v1.0.1 - Fixed API endpoint

interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    phone: string;
    subscription_tier: string;
    subscription_end: string;
    role?: string;
  };
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch('https://myrentology.ru/api/auth-login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Authentication failed');
    }
    
    return await response.json();
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('auth_token');
  },
};