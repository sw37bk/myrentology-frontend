<?php
// Создание таблицы для персональных ключей
$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

$pdo->exec("CREATE TABLE IF NOT EXISTS user_avito_personal_keys (
    user_id INT PRIMARY KEY,
    client_id VARCHAR(255),
    client_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)");

echo "Personal keys table created successfully!";
?>