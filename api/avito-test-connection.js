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
    // Получаем токен доступа
    const authResponse = await fetch('https://api.avito.ru/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: client_id,
        client_secret: client_secret
      })
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('Auth error:', errorText);
      return res.status(400).json({ error: 'Неверные учетные данные API' });
    }

    const authData = await authResponse.json();
    
    // Тестируем доступ к API - получаем список объявлений
    const itemsResponse = await fetch('https://api.avito.ru/core/v1/items?per_page=1', {
      headers: {
        'Authorization': `Bearer ${authData.access_token}`
      }
    });

    if (!itemsResponse.ok) {
      const errorText = await itemsResponse.text();
      console.error('Items API error:', errorText);
      return res.status(400).json({ error: 'Ошибка доступа к API объявлений' });
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