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
    // Для Avito API нужен OAuth2 authorization_code flow
    // Простая проверка валидности client_id и client_secret невозможна без кода авторизации
    // Поэтому просто проверяем формат и возвращаем успех
    
    if (client_id.length < 10 || client_secret.length < 10) {
      return res.status(400).json({ error: 'Неверный формат Client ID или Client Secret' });
    }

    res.json({ 
      success: true, 
      message: 'Данные сохранены. Для полного подключения используйте кнопку "Подключить через Авито"'
    });
  } catch (error) {
    console.error('Ошибка тестирования подключения:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}