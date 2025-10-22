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
$client_id = $input['client_id'] ?? '';
$client_secret = $input['client_secret'] ?? '';
$user_id = $input['user_id'] ?? '';

if (!$client_id || !$client_secret || !$user_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Client ID, Client Secret и User ID обязательны']);
    exit;
}

// Генерируем state
$state = bin2hex(random_bytes(16));

// Сохраняем данные OAuth (в реальности нужна БД)
$oauth_file = __DIR__ . '/oauth_states.json';
$oauth_data = [];
if (file_exists($oauth_file)) {
    $oauth_data = json_decode(file_get_contents($oauth_file), true) ?: [];
}

$oauth_data[$state] = [
    'client_id' => $client_id,
    'client_secret' => $client_secret,
    'user_id' => $user_id,
    'timestamp' => time()
];

file_put_contents($oauth_file, json_encode($oauth_data));

// Генерируем URL авторизации
$scopes = 'messenger:read,messenger:write,items:info,stats:read';
$redirect_uri = 'https://рентология.рф/api/avito-callback';
$auth_url = 'https://avito.ru/oauth?' . http_build_query([
    'response_type' => 'code',
    'client_id' => $client_id,
    'scope' => $scopes,
    'state' => $state,
    'redirect_uri' => $redirect_uri
]);

echo json_encode([
    'success' => true,
    'auth_url' => $auth_url,
    'state' => $state
]);
?>