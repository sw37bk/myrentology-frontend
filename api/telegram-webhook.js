export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body;
    
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      if (text === '/start') {
        console.log('Start command received');
      }
      
      console.log('Other commands:', text);
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