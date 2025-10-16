const BOT_TOKEN = process.env.BOT_TOKEN || '7525839831:AAFQIY1dUran8yIfx3SS1C4dKNt4sshOmu0';
const BOT_USERNAME = process.env.BOT_USERNAME || 'rentology_bot';

// Хранилище в памяти (для production лучше использовать Redis)
const linkTokens = new Map();
const telegramUsers = new Map();

// Генерация токена
function generateLinkToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Отправка сообщения в Telegram
async function sendTelegramMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}

export default async function handler(req, res) {
  const { method } = req;
  
  // Webhook от Telegram
  if (method === 'POST' && req.body.message) {
    try {
      const update = req.body;
      const message = update.message;
      const chatId = message.chat.id;
      const text = message.text;
      const user = message.from;
      
      if (text?.startsWith('/start')) {
        const token = text.split(' ')[1];
        
        if (token) {
          // Проверяем токен
          const linkData = linkTokens.get(token);
          
          if (!linkData) {
            // Отправляем webhook об ошибке
            try {
              await fetch(`${req.headers.origin || 'https://rental-crm-frontend-47ay0w9sz-sw37bks-projects.vercel.app'}/api/telegram-link-callback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: false, error: 'invalid_token' })
              });
            } catch (e) {}
            return await sendTelegramMessage(chatId, '❌ Неверный или устаревший токен связывания');
          }
          
          if (linkData.expires < Date.now()) {
            linkTokens.delete(token);
            // Отправляем webhook об ошибке
            try {
              await fetch(`${req.headers.origin || 'https://rental-crm-frontend-47ay0w9sz-sw37bks-projects.vercel.app'}/api/telegram-link-callback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ success: false, error: 'token_expired' })
              });
            } catch (e) {}
            return await sendTelegramMessage(chatId, '❌ Токен связывания истек. Получите новый на сайте');
          }
          
          // Связываем аккаунты
          telegramUsers.set(chatId.toString(), {
            userId: linkData.userId,
            username: linkData.username,
            phone: linkData.phone,
            telegramUsername: user.username,
            firstName: user.first_name
          });
          
          linkTokens.delete(token);
          
          // Отправляем webhook на сайт об успешном связывании
          try {
            await fetch(`${req.headers.origin || 'https://rental-crm-frontend-47ay0w9sz-sw37bks-projects.vercel.app'}/api/telegram-link-callback`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                success: true,
                userId: linkData.userId,
                telegramId: chatId.toString(),
                username: linkData.username,
                phone: linkData.phone,
                telegramUsername: user.username,
                firstName: user.first_name
              })
            });
          } catch (e) {}
          
          await sendTelegramMessage(chatId, `✅ Аккаунт успешно привязан к Рентология!

🔗 Связь установлена:
${user.username ? `Telegram: @${user.username}` : `Имя: ${user.first_name}`}
Сайт: ID ${linkData.userId}

Теперь вы будете получать уведомления о:
• Новых бронированиях
• Отменах бронирований
• Новых сообщениях в чатах`);
        } else {
          const userData = telegramUsers.get(chatId.toString());
          if (userData) {
            await sendTelegramMessage(chatId, `✅ Ваш аккаунт уже привязан (ID: ${userData.userId})`);
          } else {
            await sendTelegramMessage(chatId, `🏠 Добро пожаловать в Рентология!

❌ Для связывания аккаунта:
1. Зайдите в настройки на сайте
2. Нажмите "Связать Telegram"
3. Перейдите по полученной ссылке или используйте токен`);
          }
        }
      }
      
      return res.status(200).json({ ok: true });
    } catch (error) {
      return res.status(200).json({ ok: false });
    }
  }
  
  // API для связывания пользователя
  if (method === 'POST' && req.url === '/api/telegram?action=link') {
    const { userId, username, phone } = req.body;
    
    const token = generateLinkToken();
    const expires = Date.now() + 10 * 60 * 1000;
    
    linkTokens.set(token, { userId, username, phone, expires });
    
    return res.json({
      success: true,
      token,
      botUrl: `https://t.me/${BOT_USERNAME}?start=${token}`,
      message: `Перейдите по ссылке или напишите боту команду: /start ${token}`
    });
  }
  
  // API для отправки уведомлений
  if (method === 'POST' && req.url === '/api/telegram?action=notify') {
    const { userId, message } = req.body;
    
    let telegramId = null;
    for (const [tgId, userData] of telegramUsers.entries()) {
      if (userData.userId === userId) {
        telegramId = tgId;
        break;
      }
    }
    
    if (!telegramId) {
      return res.status(404).json({ error: 'User not linked to Telegram' });
    }
    
    try {
      await sendTelegramMessage(telegramId, message);
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  // API для проверки статуса
  if (method === 'GET' && req.url?.startsWith('/api/telegram?action=status')) {
    const userId = parseInt(req.url.split('userId=')[1]);
    
    for (const [tgId, userData] of telegramUsers.entries()) {
      if (userData.userId === userId) {
        return res.json({
          linked: true,
          telegramId: tgId,
          username: userData.username,
          phone: userData.phone
        });
      }
    }
    
    return res.json({ linked: false });
  }
  
  res.status(404).json({ error: 'Not found' });
}