import { avitoTokens } from './avito-callback.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, endpoint, method = 'GET', data } = req.body;

  if (!user_id || !endpoint) {
    return res.status(400).json({ error: 'user_id и endpoint обязательны' });
  }

  // Получаем токен пользователя
  const userToken = avitoTokens[user_id];
  if (!userToken) {
    return res.status(401).json({ error: 'Пользователь не авторизован в Avito' });
  }

  // Проверяем срок действия токена
  if (Date.now() >= userToken.expires_at) {
    // Обновляем токен
    try {
      const refreshResponse = await fetch('https://api.avito.ru/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: userToken.client_id,
          client_secret: userToken.client_secret,
          refresh_token: userToken.refresh_token
        })
      });

      if (refreshResponse.ok) {
        const newTokenData = await refreshResponse.json();
        avitoTokens[user_id] = {
          ...userToken,
          access_token: newTokenData.access_token,
          refresh_token: newTokenData.refresh_token || userToken.refresh_token,
          expires_at: Date.now() + (newTokenData.expires_in * 1000)
        };
      } else {
        return res.status(401).json({ error: 'Токен истек, требуется повторная авторизация' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Ошибка обновления токена' });
    }
  }

  try {
    // Выполняем запрос к Avito API
    const apiResponse = await fetch(`https://api.avito.ru${endpoint}`, {
      method: method,
      headers: {
        'Authorization': `Bearer ${avitoTokens[user_id].access_token}`,
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    });

    const responseData = await apiResponse.json();
    
    if (apiResponse.ok) {
      res.json(responseData);
    } else {
      res.status(apiResponse.status).json(responseData);
    }
  } catch (error) {
    console.error('Avito API error:', error);
    res.status(500).json({ error: 'Ошибка запроса к Avito API' });
  }
}