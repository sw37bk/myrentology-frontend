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

// Админский вход
if ($email === 'sw37@bk.ru' && $password === 'Xw6Nfbhz#') {
    echo json_encode([
        'token' => 'admin_token',
        'user' => [
            'id' => 999,
            'email' => 'sw37@bk.ru',
            'phone' => '+78001234567',
            'subscription_tier' => 'pro',
            'subscription_end' => '2099-12-31',
            'role' => 'admin'
        ]
    ]);
    exit;
}

// Для всех остальных - ошибка
http_response_code(401);
echo json_encode(['error' => 'Invalid credentials']);
?>