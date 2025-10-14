const BOT_TOKEN = '7525839831:AAFQIY1dUran8yIfx3SS1C4dKNt4sshOmu0';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const webhookSetup = {
  // Установка webhook на ваш домен
  setWebhook: async () => {
    const webhookUrl = 'https://rental-crm-frontend-llv33ftxr-sw37bks-projects.vercel.app/api/telegram-webhook';
    
    try {
      const response = await fetch(`${TELEGRAM_API}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query']
        })
      });
      
      const result = await response.json();
      console.log('Webhook установлен:', result);
      return result;
    } catch (error) {
      console.error('Ошибка установки webhook:', error);
      return null;
    }
  },

  // Проверка статуса webhook
  getWebhookInfo: async () => {
    try {
      const response = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
      const result = await response.json();
      console.log('Статус webhook:', result);
      return result;
    } catch (error) {
      console.error('Ошибка получения статуса:', error);
      return null;
    }
  }
};