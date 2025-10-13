interface AIPrompt {
  id: number;
  user_id: number;
  name: string;
  prompt_text: string;
  is_active: boolean;
  created_at: string;
}

interface AutoReplySettings {
  id?: number;
  user_id: number;
  enabled: boolean;
  response_delay: number;
  working_hours_start: string;
  working_hours_end: string;
  offline_message: string;
  welcome_message: string;
  unavailable_message: string;
}

interface Message {
  id: number;
  chat_id: number;
  message_id: string;
  text: string;
  is_from_customer: boolean;
  timestamp: string;
  is_read: boolean;
  direction: 'incoming' | 'outgoing';
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let aiPrompts: AIPrompt[] = [
  {
    id: 1,
    user_id: 1,
    name: 'Основной промпт',
    prompt_text: `Ты - помощник по аренде автомобилей и оборудования. Отвечай вежливо и профессионально.

Основная информация:
- Аренда посуточная
- Необходим залог
- Доставка обсуждается отдельно

Всегда уточняй:
1. Даты аренды
2. Цель использования
3. Опыт использования подобного оборудования

Отвечай кратко и по делу. Предлагай перейти к бронированию.`,
    is_active: true,
    created_at: '2024-06-01T00:00:00Z',
  },
];

let autoReplySettings: AutoReplySettings[] = [
  {
    user_id: 1,
    enabled: true,
    response_delay: 5,
    working_hours_start: '09:00',
    working_hours_end: '21:00',
    offline_message: 'Спасибо за сообщение! Отвечу вам в рабочее время с 9:00 до 21:00.',
    welcome_message: 'Здравствуйте! Спасибо за интерес к нашему предложению. Чем могу помочь?',
    unavailable_message: 'К сожалению, на запрашиваемые даты товар занят. Могу предложить альтернативные даты или похожий товар.',
  },
];

export const aiAssistantApi = {
  getPrompts: async (): Promise<AIPrompt[]> => {
    await delay(300);
    return aiPrompts;
  },

  createPrompt: async (data: Omit<AIPrompt, 'id' | 'created_at'>): Promise<AIPrompt> => {
    await delay(500);
    const newPrompt: AIPrompt = {
      ...data,
      id: aiPrompts.length + 1,
      created_at: new Date().toISOString(),
    };
    aiPrompts.push(newPrompt);
    return newPrompt;
  },

  updatePrompt: async (id: number, data: Partial<AIPrompt>): Promise<AIPrompt> => {
    await delay(500);
    const index = aiPrompts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Prompt not found');
    
    aiPrompts[index] = { ...aiPrompts[index], ...data };
    return aiPrompts[index];
  },

  deletePrompt: async (id: number): Promise<void> => {
    await delay(300);
    const index = aiPrompts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Prompt not found');
    aiPrompts.splice(index, 1);
  },

  getAutoReplySettings: async (): Promise<AutoReplySettings> => {
    await delay(300);
    return autoReplySettings[0];
  },

  updateAutoReplySettings: async (data: Partial<AutoReplySettings>): Promise<AutoReplySettings> => {
    await delay(500);
    autoReplySettings[0] = { ...autoReplySettings[0], ...data };
    return autoReplySettings[0];
  },

  generateResponse: async (chatId: number, message: string, chatHistory: Message[]): Promise<string> => {
    await delay(1000);

    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('привет') || lowerMessage.includes('здравствуйте')) {
      return 'Здравствуйте! Спасибо за обращение. На какой период интересует аренда?';
    }

    if (lowerMessage.includes('цена') || lowerMessage.includes('стоимость') || lowerMessage.includes('сколько')) {
      return 'Цена указана в описании товара. На какой период планируете аренду? Рассчитаю точную стоимость.';
    }

    if (lowerMessage.includes('свободно') || lowerMessage.includes('доступн') || lowerMessage.includes('забронировать')) {
      return 'Да, товар доступен. Укажите, пожалуйста, конкретные даты аренды (с ... по ...) для проверки и бронирования.';
    }

    if (lowerMessage.includes('залог')) {
      return 'Да, требуется залог. Размер залога зависит от товара и срока аренды. Обычно это 20-50% от стоимости аренды.';
    }

    return 'Спасибо за вопрос! Уточните, пожалуйста, даты аренды и любые дополнительные пожелания, чтобы я мог помочь вам точнее.';
  },

  processIncomingMessage: async (chatId: number, message: string): Promise<{ shouldReply: boolean; replyText?: string }> => {
    await delay(500);

    const settings = autoReplySettings[0];
    if (!settings.enabled) {
      return { shouldReply: false };
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = parseInt(settings.working_hours_start.split(':')[0]) * 60 + parseInt(settings.working_hours_start.split(':')[1]);
    const endTime = parseInt(settings.working_hours_end.split(':')[0]) * 60 + parseInt(settings.working_hours_end.split(':')[1]);

    if (currentTime < startTime || currentTime > endTime) {
      return { shouldReply: true, replyText: settings.offline_message };
    }

    const aiResponse = await aiAssistantApi.generateResponse(chatId, message, []);
    return { shouldReply: true, replyText: aiResponse };
  },
};