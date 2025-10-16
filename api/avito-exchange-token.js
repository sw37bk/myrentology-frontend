const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { code, state } = req.body;

  try {
    // Получаем настройки пользователя из базы по state (в реальности нужно связать state с user_id)
    // Для упрощения берем первого пользователя
    const userSettings = await pool.query('SELECT * FROM avito_settings LIMIT 1');
    
    if (userSettings.rows.length === 0) {
      return res.status(400).json({ error: 'Настройки не найдены' });
    }

    const settings = userSettings.rows[0];

    // Обмениваем код на токен
    const tokenResponse = await fetch('https://api.avito.ru/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: settings.client_id,
        client_secret: settings.client_secret,
        code: code,
        redirect_uri: 'https://myrentology.ru/api/avito-callback'
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange error:', errorText);
      return res.status(400).json({ error: 'Ошибка получения токена' });
    }

    const tokenData = await tokenResponse.json();

    // Сохраняем токены в базу
    await pool.query(`
      UPDATE avito_settings 
      SET access_token = $1, refresh_token = $2, is_connected = true, last_sync = NOW()
      WHERE user_id = $3
    `, [tokenData.access_token, tokenData.refresh_token, settings.user_id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}