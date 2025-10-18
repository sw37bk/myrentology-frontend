// Хранилище для state и ключей
let oauthStates = {};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { client_id, client_secret, user_id } = req.body;

  if (!client_id || !client_secret || !user_id) {
    return res.status(400).json({ error: 'Client ID, Client Secret и User ID обязательны' });
  }

  try {
    // Сохраняем ключи для OAuth
    const state = Math.random().toString(36).substring(7);
    oauthStates[state] = {
      client_id,
      client_secret,
      user_id,
      timestamp: Date.now()
    };

    // Генерируем URL для авторизации
    const scopes = 'messenger:read,messenger:write,items:info,stats:read';
    const redirectUri = `${req.headers.origin || 'https://myrentology.ru'}/api/avito-callback`;
    
    const authUrl = `https://avito.ru/oauth?response_type=code&client_id=${client_id}&scope=${scopes}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    res.json({ 
      success: true,
      auth_url: authUrl,
      state: state
    });
  } catch (error) {
    console.error('Ошибка создания OAuth URL:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

export { oauthStates };