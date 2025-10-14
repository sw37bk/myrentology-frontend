import { dbApi } from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    
    // Обработка входящих сообщений от Авито
    if (payload.type === 'message') {
      const { chat_id, message, item, user } = payload;
      
      // Находим пользователя по client_id
      const targetUser = await findUserByAvitoCredentials(payload.client_id);
      
      if (!targetUser) {
        console.log('Пользователь не найден для client_id:', payload.client_id);
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Сохраняем сообщение в базу данных
      await dbApi.saveMessage(targetUser.id, {
        avito_chat_id: chat_id,
        item_id: item.id,
        item_title: item.title,
        customer_name: user.name,
        customer_phone: user.phone,
        message_text: message.text
      });
      
      // Проверяем AI ассистента
      if (await shouldAutoReply(targetUser.id)) {
        const aiResponse = await generateAIResponse(targetUser.id, message.text, item);
        await sendAvitoMessage(targetUser, chat_id, aiResponse);
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Avito webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function findUserByAvitoCredentials(clientId) {
  try {
    const settings = await dbApi.getAvitoSettings(clientId);
    if (settings) {
      const user = await dbApi.getUserById(settings.user_id);
      return user;
    }
    return null;
  } catch (error) {
    console.error('Ошибка поиска пользователя:', error);
    return null;
  }
}

async function shouldAutoReply(userId) {
  // Проверяем тариф и настройки AI
  const user = await dbApi.getUserById(userId);
  return user && (user.subscription_tier === 'pro' || user.subscription_tier === 'trial');
}

async function generateAIResponse(userId, messageText, item) {
  // Загружаем промпты пользователя и генерируем ответ
  const userPrompts = await getUserPrompts(userId);
  
  const defaultResponse = `Здравствуйте! Спасибо за интерес к ${item.title}. 
Я свяжусь с вами в ближайшее время для обсуждения деталей аренды.`;
  
  return defaultResponse;
}

async function getUserPrompts(userId) {
  // Загружаем промпты пользователя из базы
  return [];
}

async function sendAvitoMessage(user, chatId, text) {
  // Отправляем сообщение через ключи пользователя
  console.log(`Отправка через ключи пользователя ${user.id} в чат ${chatId}:`, text);
  
  // Вызов Avito API с ключами пользователя
  // const response = await fetch('https://api.avito.ru/messenger/v1/send_message', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${user.access_token}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     chat_id: chatId,
  //     message: { text }
  //   })
  // });
}