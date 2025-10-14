export default async function handler(req, res) {
  const BOT_TOKEN = '7525839831:AAFQIY1dUran8yIfx3SS1C4dKNt4sshOmu0';
  
  try {
    const update = req.body;
    
    if (update?.message?.text === '/start') {
      const chatId = update.message.chat.id;
      
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '🚗 Добро пожаловать в @rentology_bot!\n\nЗдесь вы получите уведомления.'
        })
      });
    }
    
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(200).json({ ok: false });
  }
}