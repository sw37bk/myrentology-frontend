<?php
// Добавляем пользователя в базу
$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

// Создаем таблицу если не существует
$pdo->exec("CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
)");

// Добавляем админа
$stmt = $pdo->prepare("INSERT IGNORE INTO users (login, password) VALUES (?, ?)");
$stmt->execute(['sw37@bk.ru', 'Xw6Nfbhz#']);

echo "User added successfully!";
?>