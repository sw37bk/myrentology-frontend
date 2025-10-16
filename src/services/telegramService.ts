const BOT_API_URL = 'https://telegram-bot-rydw.onrender.com';
const API_URL = window.location.origin;

export const telegramApi = {
  // Связывание пользователя с Telegram
  linkUser: async (userId: number, username?: string, phone?: string): Promise<{token: string, botUrl: string, message: string}> => {
    try {
      const response = await fetch(`${BOT_API_URL}/api/link-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, username, phone }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to link user');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Link user failed:', error);
      throw error;
    }
  },

  // Отправка уведомления пользователю
  sendToUser: async (userId: number, message: string): Promise<void> => {
    try {
      const response = await fetch(`${BOT_API_URL}/api/notify-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, message }),
      });
      
      if (!response.ok) {
        console.log(`User ${userId} not linked to Telegram`);
        return;
      }
    } catch (error) {
      console.error('Telegram notification failed:', error);
    }
  },

  // Проверка статуса связывания
  checkLinkStatus: async (userId: number): Promise<any> => {
    try {
      const response = await fetch(`${BOT_API_URL}/api/link-status/${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Check link status failed:', error);
      return { linked: false };
    }
  },
};