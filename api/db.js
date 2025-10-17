const { sql } = require('@vercel/postgres');

// Создание таблиц при первом запуске
async function initDatabase() {
  try {
    // Таблица пользователей
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        subscription_tier VARCHAR(20) DEFAULT 'trial',
        subscription_end TIMESTAMP,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Таблица настроек Авито
    await sql`
      CREATE TABLE IF NOT EXISTS avito_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) UNIQUE,
        client_id VARCHAR(255) NOT NULL,
        client_secret VARCHAR(255) NOT NULL,
        access_token VARCHAR(500),
        refresh_token VARCHAR(500),
        token_expires TIMESTAMP,
        is_connected BOOLEAN DEFAULT false,
        last_sync TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Таблица ресурсов
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        avito_item_id VARCHAR(50),
        avito_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Таблица клиентов
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        source VARCHAR(50) DEFAULT 'other',
        total_bookings INTEGER DEFAULT 0,
        total_spent DECIMAL(10,2) DEFAULT 0,
        loyalty_points INTEGER DEFAULT 0,
        last_booking_date TIMESTAMP,
        first_booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        tags TEXT[],
        status VARCHAR(20) DEFAULT 'active',
        loyalty_config_id INTEGER,
        free_hours_balance INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Таблица чатов
    await sql`
      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        avito_chat_id VARCHAR(255) NOT NULL,
        item_id VARCHAR(255),
        item_title VARCHAR(500),
        customer_name VARCHAR(255),
        customer_phone VARCHAR(50),
        last_message TEXT,
        last_message_time TIMESTAMP,
        unread_count INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// API функции для работы с БД
const dbApi = {
  // Пользователи
  async createUser(userData) {
    const result = await sql`
      INSERT INTO users (email, phone, subscription_tier, role)
      VALUES (${userData.email}, ${userData.phone}, ${userData.subscription_tier}, ${userData.role})
      RETURNING *
    `;
    return result.rows[0];
  },

  async getUserById(id) {
    const result = await sql`SELECT * FROM users WHERE id = ${id}`;
    return result.rows[0];
  },

  // Настройки Авито
  async saveAvitoSettings(userId, settings) {
    // Сначала проверяем, есть ли запись
    const existing = await sql`SELECT id FROM avito_settings WHERE user_id = ${userId}`;
    
    if (existing.rows.length > 0) {
      // Обновляем существующую
      const result = await sql`
        UPDATE avito_settings 
        SET client_id = ${settings.client_id}, 
            client_secret = ${settings.client_secret}, 
            is_connected = ${settings.is_connected},
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId}
        RETURNING *
      `;
      return result.rows[0];
    } else {
      // Создаем новую
      const result = await sql`
        INSERT INTO avito_settings (user_id, client_id, client_secret, is_connected)
        VALUES (${userId}, ${settings.client_id}, ${settings.client_secret}, ${settings.is_connected})
        RETURNING *
      `;
      return result.rows[0];
    }
  },

  async getAvitoSettings(userId) {
    const result = await sql`SELECT * FROM avito_settings WHERE user_id = ${userId}`;
    return result.rows[0];
  },

  // Ресурсы
  async createProduct(userId, productData) {
    const result = await sql`
      INSERT INTO products (user_id, name, description, price, is_active, avito_item_id, avito_url)
      VALUES (${userId}, ${productData.name}, ${productData.description}, ${productData.price}, 
              ${productData.is_active}, ${productData.avito_item_id}, ${productData.avito_url})
      RETURNING *
    `;
    return result.rows[0];
  },

  async updateProduct(id, productData) {
    const result = await sql`
      UPDATE products 
      SET name = ${productData.name}, description = ${productData.description}, 
          price = ${productData.price}, is_active = ${productData.is_active},
          avito_item_id = ${productData.avito_item_id}, avito_url = ${productData.avito_url}
      WHERE id = ${id}
      RETURNING *
    `;
    return result.rows[0];
  },

  async getProducts(userId) {
    const result = await sql`SELECT * FROM products WHERE user_id = ${userId} ORDER BY created_at DESC`;
    return result.rows;
  },

  // Клиенты
  async createCustomer(userId, customerData) {
    const result = await sql`
      INSERT INTO customers (user_id, name, phone, email, source, notes, tags, status)
      VALUES (${userId}, ${customerData.name}, ${customerData.phone}, ${customerData.email}, 
              ${customerData.source}, ${customerData.notes}, ${customerData.tags}, ${customerData.status})
      RETURNING *
    `;
    return result.rows[0];
  },

  async getCustomers(userId) {
    const result = await sql`SELECT * FROM customers WHERE user_id = ${userId} ORDER BY updated_at DESC`;
    return result.rows;
  },

  // Чаты
  async saveMessage(userId, messageData) {
    const result = await sql`
      INSERT INTO chats (user_id, avito_chat_id, item_id, item_title, customer_name, customer_phone, last_message, last_message_time)
      VALUES (${userId}, ${messageData.avito_chat_id}, ${messageData.item_id}, ${messageData.item_title}, 
              ${messageData.customer_name}, ${messageData.customer_phone}, ${messageData.message_text}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, avito_chat_id)
      DO UPDATE SET 
        last_message = ${messageData.message_text},
        last_message_time = CURRENT_TIMESTAMP,
        unread_count = chats.unread_count + 1
      RETURNING *
    `;
    return result.rows[0];
  }
};

module.exports = { initDatabase, dbApi };