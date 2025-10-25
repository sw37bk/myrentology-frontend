<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Подключение к базе данных
$host = 'localhost';
$dbname = 'u3304368_default';
$username = 'u3304368_default';
$password = 'TVUuIyb7r6w6D2Ut';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$password_input = $input['password'] ?? '';

if (!$email || !$password_input) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password required']);
    exit;
}

// Проверяем пользователя в базе
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password_input, $user['password'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
    exit;
}

// Успешная авторизация
echo json_encode([
    'token' => 'user_token_' . $user['id'],
    'user' => [
        'id' => $user['id'],
        'email' => $user['email'],
        'phone' => $user['phone'] ?? '',
        'subscription_tier' => $user['subscription_tier'] ?? 'basic',
        'subscription_end' => $user['subscription_end'] ?? '2024-12-31',
        'role' => $user['role'] ?? 'user'
    ]
]);
?>