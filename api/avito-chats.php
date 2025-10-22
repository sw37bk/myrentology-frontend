<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$user_id = $_GET['user_id'] ?? '';
if (!$user_id) {
    http_response_code(400);
    echo json_encode(['error' => 'user_id обязателен']);
    exit;
}

// Получаем настройки пользователя
$db_file = __DIR__ . '/db.json';
$db = [];
if (file_exists($db_file)) {
    $db = json_decode(file_get_contents($db_file), true) ?: [];
}

if (!isset($db['avito_settings'][$user_id]) || !$db['avito_settings'][$user_id]['access_token']) {
    http_response_code(401);
    echo json_encode(['error' => 'Avito не подключено']);
    exit;
}

$access_token = $db['avito_settings'][$user_id]['access_token'];

// Получаем чаты из Avito API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.avito.ru/messenger/v2/accounts/{$user_id}/chats?limit=50");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer {$access_token}",
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code === 200) {
    echo $response;
} else {
    http_response_code($http_code);
    echo json_encode(['error' => 'Ошибка получения чатов', 'details' => $response]);
}
?>