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

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password required']);
    exit;
}

// Подключение к базе
$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

// Проверяем пользователя
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND password = ?");
$stmt->execute([$email, $password]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
    exit;
}

echo json_encode([
    'token' => 'token_' . $user['id'],
    'user' => [
        'id' => $user['id'],
        'email' => $user['email'],
        'phone' => $user['phone'] ?? '',
        'subscription_tier' => $user['subscription_tier'] ?? 'pro',
        'subscription_end' => $user['subscription_end'] ?? '2099-12-31',
        'role' => $user['role'] ?? 'admin'
    ]
]);
?>