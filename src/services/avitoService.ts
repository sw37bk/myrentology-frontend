import type { AvitoSettings, Chat, Message, AvitoWebhookPayload } from '../types';
import { telegramApi } from './telegramService';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let avitoSettings: AvitoSettings[] = [];
let chats: Chat[] = [
  {
    id: 1,
    avito_chat_id: 'chat_001',
    item_id: 'item_001',
    item_title: 'BMW X5 2022',
    customer_name: 'Алексей Петров',
    customer_phone: '+79991234567',
    last_message: 'Здравствуйте! Авто еще доступно?',
    last_message_time: '2024-06-10T14:30:00Z',
    unread_count: 1,
    status: 'active',
    created_at: '2024-06-10T14:30:00Z',
    updated_at: '2024-06-10T14:30:00Z',
  },
  {
    id: 2,
    avito_chat_id: 'chat_002',
    item_id: 'item_002',
    item_title: 'Бензопила Stihl MS 180',
    customer_name: 'Мария Сидорова',
    customer_phone: '+79997654321',
    last_message: 'Какая цена за неделю?',
    last_message_time: '2024-06-10T15:45:00Z',
    unread_count: 0,
    status: 'active',
    created_at: '2024-06-10T15:45:00Z',
    updated_at: '2024-06-10T15:45:00Z',
  },
];

let messages: Message[] = [
  {
    id: 1,
    chat_id: 1,
    message_id: 'msg_001',
    text: 'Здравствуйте! Авто еще доступно?',
    is_from_customer: true,
    timestamp: '2024-06-10T14:30:00Z',
    is_read: true,
    direction: 'incoming',
  },
  {
    id: 2,
    chat_id: 1,
    message_id: 'msg_002',
    text: 'Да, автомобиль доступен для аренды. На какие даты интересуете?',
    is_from_customer: false,
    timestamp: '2024-06-10T14:32:00Z',
    is_read: true,
    direction: 'outgoing',
  },
];

export const avitoApi = {
  getSettings: async (): Promise<AvitoSettings | null> => {
    await delay(300);
    return avitoSettings[0] || null;
  },

  saveSettings: async (settings: Omit<AvitoSettings, 'id'>): Promise<AvitoSettings> => {
    await delay(500);
    const newSettings: AvitoSettings = {
      ...settings,
      id: 1,
      is_connected: true,
      last_sync: new Date().toISOString(),
    };
    avitoSettings = [newSettings];
    return newSettings;
  },

  disconnect: async (): Promise<void> => {
    await delay(300);
    avitoSettings = [];
  },

  getChats: async (): Promise<Chat[]> => {
    await delay(400);
    return chats.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  },

  getChat: async (chatId: number): Promise<Chat> => {
    await delay(300);
    const chat = chats.find(c => c.id === chatId);
    if (!chat) throw new Error('Chat not found');
    return chat;
  },

  getMessages: async (chatId: number): Promise<Message[]> => {
    await delay(300);
    return messages
      .filter(m => m.chat_id === chatId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  sendMessage: async (chatId: number, text: string): Promise<Message> => {
    await delay(500);
    
    const chat = chats.find(c => c.id === chatId);
    if (!chat) throw new Error('Chat not found');

    const newMessage: Message = {
      id: messages.length + 1,
      chat_id: chatId,
      message_id: `msg_${Date.now()}`,
      text,
      is_from_customer: false,
      timestamp: new Date().toISOString(),
      is_read: true,
      direction: 'outgoing',
    };

    messages.push(newMessage);

    chat.last_message = text;
    chat.last_message_time = new Date().toISOString();
    chat.updated_at = new Date().toISOString();

    return newMessage;
  },

  simulateWebhook: async (payload: AvitoWebhookPayload): Promise<void> => {
    await delay(300);

    let chat = chats.find(c => c.avito_chat_id === payload.chat_id);
    
    if (!chat) {
      chat = {
        id: chats.length + 1,
        avito_chat_id: payload.chat_id,
        item_id: payload.item.id,
        item_title: payload.item.title,
        customer_name: payload.user.name,
        customer_phone: payload.user.phone,
        last_message: payload.message.text,
        last_message_time: new Date(payload.timestamp * 1000).toISOString(),
        unread_count: 1,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      chats.push(chat);
      
      // Отправляем уведомление владельцу
      try {
        const ownerId = 1; // В реальном приложении брать из аутентификации
        await telegramApi.sendToUser(
          ownerId,
          `💬 Новый чат на Авито!\n\n` +
          `👤 Клиент: ${payload.user.name}\n` +
          `📞 Телефон: ${payload.user.phone}\n` +
          `📦 Товар: ${payload.item.title}\n` +
          `📝 Сообщение: ${payload.message.text}`
        );
      } catch (error) {
        console.log('Telegram notification failed:', error);
      }
    } else {
      chat.last_message = payload.message.text;
      chat.last_message_time = new Date(payload.timestamp * 1000).toISOString();
      chat.unread_count += 1;
      chat.updated_at = new Date().toISOString();
    }

    const newMessage: Message = {
      id: messages.length + 1,
      chat_id: chat.id,
      message_id: `avito_${payload.timestamp}`,
      text: payload.message.text,
      is_from_customer: true,
      timestamp: new Date(payload.timestamp * 1000).toISOString(),
      is_read: false,
      direction: 'incoming',
    };

    messages.push(newMessage);
  },
};