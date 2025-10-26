<?php
// Создание всех таблиц для Авито
$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

// Таблица объявлений
$pdo->exec("CREATE TABLE IF NOT EXISTS avito_ads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ad_id VARCHAR(255) NOT NULL,
    title VARCHAR(500),
    price DECIMAL(10,2),
    status VARCHAR(50),
    ad_data JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_ad (user_id, ad_id)
)");

// Таблица чатов
$pdo->exec("CREATE TABLE IF NOT EXISTS avito_chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    chat_id VARCHAR(255) NOT NULL,
    item_id VARCHAR(255),
    chat_data JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_chat (user_id, chat_id)
)");

// Таблица сообщений
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

// Таблица привязки объявлений к ресурсам
$pdo->exec("CREATE TABLE IF NOT EXISTS resource_avito_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    resource_id INT NOT NULL,
    avito_ad_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_link (user_id, resource_id, avito_ad_id)
)");

echo "All Avito tables created successfully!";
?>