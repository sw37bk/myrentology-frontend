<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

// Получаем настройки приложения
$stmt = $pdo->query("SELECT * FROM avito_app_settings WHERE id = 1");
$settings = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$settings || !$settings['client_id']) {
    http_response_code(400);
    echo json_encode(['error' => 'Avito app not configured']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$userId = $input['userId'] ?? '';

if (!$userId) {
    http_response_code(400);
    echo json_encode(['error' => 'User ID required']);
    exit;
}

// Генерируем OAuth URL
$redirect_uri = 'https://myrentology.ru/api/avito-oauth-callback';
$state = base64_encode(json_encode(['userId' => $userId]));

$oauth_url = 'https://avito.ru/oauth?' . http_build_query([
    'client_id' => $settings['client_id'],
    'response_type' => 'code',
    'redirect_uri' => $redirect_uri,
    'state' => $state,
    'scope' => 'messenger:read messenger:write items:read'
]);

echo json_encode(['oauth_url' => $oauth_url]);
?>