<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

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
    echo json_encode(['error' => 'Логин и пароль обязательны']);
    exit;
}

// Отладка
error_log("Login attempt: email='$email', password='$password'");

// Проверяем тестовый аккаунт
if ($email === 'sw37@bk.ru' && $password === 'Xw6Nfbhz') {
    echo json_encode([
        'token' => 'token_999_' . time(),
        'user' => [
            'id' => 999,
            'email' => 'sw37@bk.ru',
            'phone' => '+7 999 123-45-67',
            'subscription_tier' => 'pro',
            'subscription_end' => '2025-12-31',
            'role' => 'admin'
        ]
    ]);
    exit;
}

http_response_code(401);
echo json_encode(['error' => 'Неверный логин или пароль']);
?>