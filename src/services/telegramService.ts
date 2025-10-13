const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const telegramApi = {
  // Отправка уведомления конкретному пользователю по его Telegram ID
  sendToUser: async (telegramId: string, message: string): Promise<void> => {
    await delay(500);
    console.log(`[BOT] Sending to user ${telegramId}:`, message);
    // Здесь будет API вызов к боту
  },

  // Отправка уведомления администратору
  sendToAdmin: async (message: string): Promise<void> => {
    await delay(500);
    console.log('[BOT] Sending to admin:', message);
    // Здесь будет API вызов к боту для отправки админу
  },

  // Регистрация пользователя в боте (связывание email с Telegram ID)
  registerUser: async (email: string, telegramId: string): Promise<void> => {
    await delay(500);
    console.log(`[BOT] Registering user ${email} with Telegram ID ${telegramId}`);
    // Здесь будет API вызов к боту для регистрации
  },
};