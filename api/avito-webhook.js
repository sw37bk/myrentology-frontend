export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    
    // Обработка входящих сообщений от Авито
    if (payload.type === 'message') {
      const { chat_id, message, item, user } = payload;
      
      console.log('Avito message received:', { chat_id, message: message.text });
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Avito webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

