<?php
// Быстрая настройка приложения Авито
$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

// Создаем таблицы если не существуют
$pdo->exec("CREATE TABLE IF NOT EXISTS avito_app_settings (
    id INT PRIMARY KEY DEFAULT 1,
    client_id VARCHAR(255),
    client_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$pdo->exec("CREATE TABLE IF NOT EXISTS user_avito_tokens (
    user_id INT PRIMARY KEY,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)");

// Добавляем настройки приложения
$stmt = $pdo->prepare("INSERT INTO avito_app_settings (id, client_id, client_secret) VALUES (1, ?, ?) 
                      ON DUPLICATE KEY UPDATE client_id = ?, client_secret = ?");
$stmt->execute([
    'AZwsjss_MKLCOoXld0GK', 
    'RkOUb6w9SbhDYUZAcKYcE-L7D7dhJE7lAUKvANw9',
    'AZwsjss_MKLCOoXld0GK', 
    'RkOUb6w9SbhDYUZAcKYcE-L7D7dhJE7lAUKvANw9'
]);

echo "Avito app configured successfully!<br>";
echo "Client ID: AZwsjss_MKLCOoXld0GK<br>";
echo "Ready for user connections!";
?>