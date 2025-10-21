// Временное хранилище в памяти
if (!global.avitoSettings) {
  global.avitoSettings = {};
}

export default async function handler(req, res) {
  console.log('Avito API:', req.method, req.query, req.body);
  
  if (req.method === 'GET') {
    const userId = req.query.userId || req.query.user_id;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId обязателен' });
    }
    
    const settings = global.avitoSettings[userId];
    if (!settings) {
      return res.status(404).json({ error: 'Настройки не найдены' });
    }
    
    res.json(settings);
  } else if (req.method === 'POST') {
    const { user_id, client_id, client_secret, access_token, refresh_token, is_connected } = req.body;
    
    console.log('POST data:', { user_id, client_id, client_secret, access_token, is_connected });
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id обязателен' });
    }
    
    const settings = {
      id: 1,
      user_id,
      client_id: client_id || '',
      client_secret: client_secret || '',
      access_token: access_token || null,
      refresh_token: refresh_token || null,
      is_connected: is_connected !== false,
      last_sync: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    global.avitoSettings[user_id] = settings;
    res.json(settings);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}