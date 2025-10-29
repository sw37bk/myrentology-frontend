<?php
// Создание таблиц для AI системы
$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

// Общие условия бронирования (шаблоны)
$pdo->exec("CREATE TABLE IF NOT EXISTS booking_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    conditions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

// Индивидуальные условия ресурсов
$pdo->exec("CREATE TABLE IF NOT EXISTS resource_booking_conditions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    resource_id INT NOT NULL,
    template_id INT NULL,
    individual_conditions JSON,
    ai_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_resource (user_id, resource_id)
)");

// Настройки AI ассистента
$pdo->exec("CREATE TABLE IF NOT EXISTS ai_assistant_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    model VARCHAR(50) DEFAULT 'gpt-3.5-turbo',
    system_prompt TEXT,
    auto_booking_enabled BOOLEAN DEFAULT FALSE,
    response_style VARCHAR(50) DEFAULT 'friendly',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user (user_id)
)");

// Добавляем OpenAI ключ, прокси и модель в системные настройки
$pdo->exec("ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS openai_api_key VARCHAR(255)");
$pdo->exec("ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS openai_proxy VARCHAR(255)");
$pdo->exec("ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS openai_model VARCHAR(50) DEFAULT 'gpt-3.5-turbo'");

// Логи AI переписки
$pdo->exec("CREATE TABLE IF NOT EXISTS ai_chat_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    chat_id VARCHAR(255) NOT NULL,
    resource_id INT,
    customer_message TEXT,
    ai_response TEXT,
    booking_created BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

// Клиенты (расширенная таблица)
$pdo->exec("CREATE TABLE IF NOT EXISTS ai_customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    name VARCHAR(255),
    first_contact_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_contact_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    total_bookings INT DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    INDEX idx_phone (phone),
    INDEX idx_email (email)
)");

// История взаимодействий
$pdo->exec("CREATE TABLE IF NOT EXISTS customer_interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    customer_id INT NOT NULL,
    chat_platform VARCHAR(50),
    chat_id VARCHAR(255),
    message_type ENUM('incoming', 'outgoing', 'system'),
    message_text TEXT,
    ai_generated BOOLEAN DEFAULT FALSE,
    resource_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customer (customer_id),
    INDEX idx_chat (chat_id)
)");

// Автоматические бронирования
$pdo->exec("CREATE TABLE IF NOT EXISTS auto_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    customer_id INT NOT NULL,
    resource_id INT NOT NULL,
    chat_id VARCHAR(255),
    start_date DATE,
    end_date DATE,
    total_price DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    ai_context JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

echo "AI system tables created successfully!";
?>