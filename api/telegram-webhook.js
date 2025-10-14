module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body;
    
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      if (text === '/start') {
        await sendMessage(chatId, 
          '🚗 <b>Добро пожаловать в @rentology_bot!</b>\n\n' +
          'Здесь вы получите уведомления о бронированиях.\n\n' +
          '<b>Команды:</b>\n' +
          '/subscribe - Подписаться\n' +
          '/status - Статус'
        );
      }
      
      if (text === '/subscribe') {
        await sendMessage(chatId, '✅ Вы подписались на уведомления @rentology_bot!');
      }
      
      if (text === '/status') {
        await sendMessage(chatId, '📊 <b>Статус:</b> Подписан');
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function sendMessage(chatId, text) {
  const BOT_TOKEN = '7525839831:AAFQIY1dUran8yIfx3SS1C4dKNt4sshOmu0';
  
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    })
  });
}