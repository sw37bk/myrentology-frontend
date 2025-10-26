<?php
// Создание таблиц для webhook'ов
$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

// Таблица для логов webhook'ов
$pdo->exec("CREATE TABLE IF NOT EXISTS webhook_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    webhook_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

// Обновляем существующие таблицы если нужно
$pdo->exec("CREATE TABLE IF NOT EXISTS avito_chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    chat_id VARCHAR(255) NOT NULL,
    item_id VARCHAR(255),
    chat_data JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_chat (user_id, chat_id)
)");

$pdo->exec("CREATE TABLE IF NOT EXISTS avito_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    chat_id VARCHAR(255) NOT NULL,
    message_id VARCHAR(255) NOT NULL,
    message_text TEXT,
    author_type VARCHAR(50),
    created_at TIMESTAMP,
    message_data JSON,
    UNIQUE KEY unique_message (user_id, chat_id, message_id)
)");

echo "Webhook tables created successfully!";
?>