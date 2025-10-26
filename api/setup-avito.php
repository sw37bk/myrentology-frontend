<?php
// Создание таблиц для Авито API
$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

// Общие настройки приложения Авито
$pdo->exec("CREATE TABLE IF NOT EXISTS avito_app_settings (
    id INT PRIMARY KEY DEFAULT 1,
    client_id VARCHAR(255),
    client_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

// Токены пользователей
$pdo->exec("CREATE TABLE IF NOT EXISTS user_avito_tokens (
    user_id INT PRIMARY KEY,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)");

echo "Avito tables created successfully!";
?>