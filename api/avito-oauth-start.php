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

$raw_input = file_get_contents('php://input');
error_log("OAuth start raw input: " . $raw_input);

$input = json_decode($raw_input, true);
if (!$input) {
    error_log("JSON decode failed");
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

$client_id = $input['client_id'] ?? '';
$client_secret = $input['client_secret'] ?? '';
$user_id = $input['user_id'] ?? '';

error_log("OAuth params: client_id=$client_id, user_id=$user_id");

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
$redirect_uri = 'http://xn--c1adkkjgblu9k.xn--p1ai/api/avito-callback/';
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