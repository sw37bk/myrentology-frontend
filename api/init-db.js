const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
  try {
    // Создаем таблицу пользователей
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        subscription_tier VARCHAR(20) DEFAULT 'trial',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Создаем таблицу настроек Авито
    await sql`
      CREATE TABLE IF NOT EXISTS avito_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        client_id VARCHAR(255) NOT NULL,
        client_secret VARCHAR(255) NOT NULL,
        is_connected BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Init DB error:', error);
    res.status(500).json({ error: error.message });
  }
}