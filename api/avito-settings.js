// Временное хранилище в памяти
let avitoSettings = {};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const userId = req.query.userId || req.query.user_id;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId обязателен' });
    }
    
    const settings = avitoSettings[userId];
    if (!settings) {
      return res.status(404).json({ error: 'Настройки не найдены' });
    }
    
    res.json(settings);
  } else if (req.method === 'POST') {
    const { user_id, client_id, client_secret, access_token, refresh_token, is_connected } = req.body;
    
    if (!user_id || !client_id || !client_secret) {
      return res.status(400).json({ error: 'Обязательные поля: user_id, client_id, client_secret' });
    }
    
    const settings = {
      id: 1,
      user_id,
      client_id,
      client_secret,
      access_token: access_token || null,
      refresh_token: refresh_token || null,
      is_connected: is_connected !== false,
      last_sync: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    avitoSettings[user_id] = settings;
    res.json(settings);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}