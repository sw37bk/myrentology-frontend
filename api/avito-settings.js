const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Создаем таблицу если не существует
async function ensureTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS avito_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE,
        client_id VARCHAR(255) NOT NULL,
        client_secret VARCHAR(255) NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        token_expires TIMESTAMP,
        is_connected BOOLEAN DEFAULT false,
        last_sync TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error('Table creation error:', error);
  }
}

export default async function handler(req, res) {
  await ensureTable();
  
  if (req.method === 'GET') {
    const userId = req.query.userId || req.query.user_id;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId обязателен' });
    }
    
    try {
      const result = await pool.query(
        'SELECT * FROM avito_settings WHERE user_id = $1',
        [userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Настройки не найдены' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Ошибка получения настроек:', error);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
  } else if (req.method === 'POST') {
    const { user_id, client_id, client_secret, access_token, refresh_token, is_connected } = req.body;
    
    if (!user_id || !client_id || !client_secret) {
      return res.status(400).json({ error: 'Обязательные поля: user_id, client_id, client_secret' });
    }
    
    try {
      const result = await pool.query(`
        INSERT INTO avito_settings (user_id, client_id, client_secret, access_token, refresh_token, is_connected, last_sync)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          client_id = $2,
          client_secret = $3,
          access_token = $4,
          refresh_token = $5,
          is_connected = $6,
          last_sync = NOW()
        RETURNING *
      `, [user_id, client_id, client_secret, access_token || null, refresh_token || null, is_connected !== false]);
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}