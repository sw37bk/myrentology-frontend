const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface SystemSettings {
  site_name: string;
  site_description: string;
  support_email: string;
  support_phone: string;
  trial_period_days: number;
  basic_price: number;
  pro_price: number;
  telegram_bot_token?: string;
  email_smtp_host?: string;
  email_smtp_port?: number;
  email_smtp_user?: string;
  email_smtp_pass?: string;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  total_revenue: number;
  total_bookings: number;
  users_growth: number;
  revenue_growth: number;
}

// Моковые данные для админки
let systemSettings: SystemSettings = {
  site_name: 'Рентология',
  site_description: 'Профессиональная платформа для управления арендой',
  support_email: 'support@rentologiya.ru',
  support_phone: '+78001234567',
  trial_period_days: 14,
  basic_price: 500,
  pro_price: 1500,
};

let adminStats: AdminStats = {
  total_users: 1247,
  active_users: 892,
  total_revenue: 2450000,
  total_bookings: 3456,
  users_growth: 12.5,
  revenue_growth: 8.3,
};

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    await delay(500);
    return adminStats;
  },

  getSystemSettings: async (): Promise<SystemSettings> => {
    await delay(300);
    return systemSettings;
  },

  updateSystemSettings: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    await delay(500);
    systemSettings = { ...systemSettings, ...settings };
    return systemSettings;
  },
};