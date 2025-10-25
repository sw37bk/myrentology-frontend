<?php
// Создание таблиц в базе данных
$host = 'localhost';
$dbname = 'u3304368_default';
$username = 'u3304368_default';
$password = 'TVUuIyb7r6w6D2Ut';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Создаем таблицу пользователей
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        subscription_tier VARCHAR(50) DEFAULT 'basic',
        subscription_end DATE,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    $pdo->exec($sql);
    
    // Добавляем админа
    $admin_password = password_hash('Xw6Nfbhz#', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT IGNORE INTO users (email, password, phone, subscription_tier, subscription_end, role) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute(['sw37@bk.ru', $admin_password, '+78001234567', 'pro', '2099-12-31', 'admin']);
    
    echo "Tables created and admin user added successfully!";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>