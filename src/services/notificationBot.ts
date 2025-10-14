interface TelegramUser {
  chat_id: number;
  username?: string;
  first_name: string;
  phone?: string;
  subscribed: boolean;
  notifications: string[];
}

interface NotificationTemplate {
  type: 'booking_created' | 'booking_confirmed' | 'booking_reminder' | 'payment_due';
  template: string;
}

// Моковые данные подписчиков
let subscribers: TelegramUser[] = [
  {
    chat_id: 123456789,
    username: 'ivan_client',
    first_name: 'Иван',
    phone: '+79991234567',
    subscribed: true,
    notifications: ['booking_confirmed', 'booking_reminder']
  }
];

const BOT_TOKEN = '7525839831:AAFQIY1dUran8yIfx3SS1C4dKNt4sshOmu0';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const templates: NotificationTemplate[] = [
  {
    type: 'booking_created',
    template: '<b>🚗 Новое бронирование!</b>\n\n📅 <b>Период:</b> {dates}\n🚙 <b>Авто:</b> {car}\n💰 <b>Сумма:</b> {amount} ₽'
  },
  {
    type: 'booking_confirmed',
    template: '<b>✅ Бронирование подтверждено!</b>\n\n📅 {dates}\n🚙 {car}\n📍 <b>Адрес:</b> {address}\n\n📞 По вопросам: +7 (999) 123-45-67'
  },
  {
    type: 'booking_reminder',
    template: '<b>⏰ Напоминание</b>\n\n🚙 {car}\n📅 Завтра в {time}\n📍 {address}\n\nℹ️ Не забудьте документы!'
  },
  {
    type: 'payment_due',
    template: '<b>💳 Оплата бронирования</b>\n\n🚙 {car}\n💰 К доплате: <b>{amount} ₽</b>\n\n🔗 <a href="{link}">Оплатить онлайн</a>'
  }
];

export const notificationBot = {
  // Отправка уведомления
  sendNotification: async (chatId: number, type: NotificationTemplate['type'], data: any) => {
    const template = templates.find(t => t.type === type);
    if (!template) return false;

    let message = template.template;
    Object.keys(data).forEach(key => {
      message = message.replace(`{${key}}`, data[key]);
    });

    try {
      const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });
      
      const result = await response.json();
      return result.ok;
    } catch (error) {
      console.error('Ошибка отправки:', error);
      return false;
    }
  },

  // Массовая рассылка
  broadcast: async (type: NotificationTemplate['type'], data: any, filter?: (user: TelegramUser) => boolean) => {
    const users = filter ? subscribers.filter(filter) : subscribers.filter(u => u.subscribed);
    
    const results = await Promise.allSettled(
      users.map(user => 
        user.notifications.includes(type) 
          ? notificationBot.sendNotification(user.chat_id, type, data)
          : Promise.resolve(false)
      )
    );

    return {
      sent: results.filter(r => r.status === 'fulfilled' && r.value).length,
      failed: results.filter(r => r.status === 'rejected').length,
      total: users.length
    };
  },

  // Подписка пользователя
  subscribe: async (chatId: number, userData: Partial<TelegramUser>) => {
    const existing = subscribers.find(u => u.chat_id === chatId);
    
    if (existing) {
      Object.assign(existing, userData, { subscribed: true });
    } else {
      subscribers.push({
        chat_id: chatId,
        first_name: userData.first_name || 'Пользователь',
        subscribed: true,
        notifications: ['booking_confirmed', 'booking_reminder'],
        ...userData
      });
    }
    
    // Отправляем приветственное сообщение
    await notificationBot.sendNotification(chatId, 'booking_confirmed', {
      dates: 'Пример: 15.06.2024 - 17.06.2024',
      car: 'Пример: BMW X5',
      address: 'ул. Примерная, 123'
    });
    
    return true;
  },

  // Отписка
  unsubscribe: async (chatId: number) => {
    const user = subscribers.find(u => u.chat_id === chatId);
    if (user) {
      user.subscribed = false;
    }
    return true;
  },

  // Получить подписчиков
  getSubscribers: async () => {
    return subscribers.filter(u => u.subscribed);
  },

  // Настройка уведомлений пользователя
  updateNotificationSettings: async (chatId: number, notifications: string[]) => {
    const user = subscribers.find(u => u.chat_id === chatId);
    if (user) {
      user.notifications = notifications;
      return true;
    }
    return false;
  }
};

// Интеграция с событиями системы
export const notificationEvents = {
  onBookingCreated: async (booking: any) => {
    await notificationBot.sendNotification(
      booking.customer_chat_id, 
      'booking_created',
      {
        dates: `${booking.start_date} - ${booking.end_date}`,
        car: booking.resource.name,
        amount: booking.total_amount
      }
    );
  },

  onBookingConfirmed: async (booking: any) => {
    await notificationBot.sendNotification(
      booking.customer_chat_id,
      'booking_confirmed', 
      {
        dates: `${booking.start_date} - ${booking.end_date}`,
        car: booking.resource.name,
        address: 'ул. Примерная, 123'
      }
    );
  },

  onPaymentDue: async (booking: any) => {
    await notificationBot.sendNotification(
      booking.customer_chat_id,
      'payment_due',
      {
        car: booking.resource.name,
        amount: booking.total_amount,
        link: `https://pay.example.com/${booking.id}`
      }
    );
  }
};