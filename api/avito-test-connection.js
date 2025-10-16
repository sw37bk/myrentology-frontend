export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { client_id, client_secret } = req.body;

  if (!client_id || !client_secret) {
    return res.status(400).json({ error: 'Client ID и Client Secret обязательны' });
  }

  try {
    // Тестируем подключение к API Авито
    const authResponse = await fetch('https://api.avito.ru/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: client_id,
        client_secret: client_secret,
        scope: 'public_profile:read items:read items:write messenger:read messenger:write'
      })
    });

    if (!authResponse.ok) {
      return res.status(400).json({ error: 'Неверные учетные данные API' });
    }

    const authData = await authResponse.json();
    
    // Проверяем доступ к API, получив профиль пользователя
    const profileResponse = await fetch('https://api.avito.ru/core/v1/accounts/self', {
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Client-Id': client_id
      }
    });

    if (!profileResponse.ok) {
      return res.status(400).json({ error: 'Ошибка доступа к API' });
    }

    res.json({ 
      success: true, 
      access_token: authData.access_token,
      expires_in: authData.expires_in
    });
  } catch (error) {
    console.error('Ошибка тестирования подключения:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}