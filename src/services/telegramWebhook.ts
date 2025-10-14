const BOT_TOKEN = '7525839831:AAFQIY1dUran8yIfx3SS1C4dKNt4sshOmu0';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const telegramWebhook = {
  // Установка webhook
  setWebhook: async (url: string) => {
    try {
      const response = await fetch(`${TELEGRAM_API}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      return await response.json();
    } catch (error) {
      console.error('Ошибка установки webhook:', error);
      return null;
    }
  },

  // Обработка входящих сообщений
  handleUpdate: async (update: any) => {
    const message = update.message;
    if (!message) return;

    const chatId = message.chat.id;
    const text = message.text;
    const user = message.from;

    // Команды бота
    if (text === '/start') {
      await sendMessage(chatId, 
        '🚗 Добро пожаловать в Рентологию!\n\n' +
        'Здесь вы будете получать уведомления о ваших бронированиях.\n\n' +
        'Команды:\n' +
        '/subscribe - Подписаться на уведомления\n' +
        '/unsubscribe - Отписаться\n' +
        '/status - Статус подписки'
      );
    }
    
    if (text === '/subscribe') {
      // Подписка пользователя
      await sendMessage(chatId, '✅ Вы подписались на уведомления!');
    }
    
    if (text === '/unsubscribe') {
      await sendMessage(chatId, '❌ Вы отписались от уведомлений');
    }
    
    if (text === '/status') {
      await sendMessage(chatId, '📊 Статус: Подписан на уведомления');
    }
  }
};

const sendMessage = async (chatId: number, text: string) => {
  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML'
      })
    });
  } catch (error) {
    console.error('Ошибка отправки:', error);
  }
};