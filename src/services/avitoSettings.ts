import { AvitoSettings } from '../types';

export const avitoSettingsApi = {
  // Получение настроек Авито для пользователя
  getSettings: async (userId: number): Promise<AvitoSettings | null> => {
    const response = await fetch(`/api/avito-settings/${userId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Ошибка получения настроек');
    }
    return await response.json();
  },

  // Сохранение настроек Авито
  saveSettings: async (settings: Omit<AvitoSettings, 'id'>): Promise<AvitoSettings> => {
    const response = await fetch('/api/avito-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });

    if (!response.ok) {
      throw new Error('Ошибка сохранения настроек');
    }

    return await response.json();
  },

  // Тестирование подключения к API Авито
  testConnection: async (clientId: string, clientSecret: string): Promise<boolean> => {
    const response = await fetch('/api/avito-test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret })
    });

    return response.ok;
  },

  // Получение токена доступа
  getAccessToken: async (clientId: string, clientSecret: string): Promise<string> => {
    const response = await fetch('/api/avito-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret })
    });

    if (!response.ok) {
      throw new Error('Ошибка получения токена');
    }

    const data = await response.json();
    return data.access_token;
  }
};