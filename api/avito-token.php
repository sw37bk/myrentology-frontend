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
    echo json_encode(['error' => 'Все поля обязательны']);
    exit;
}

// Получаем токен через client_credentials
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.avito.ru/token/');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'grant_type' => 'client_credentials',
    'client_id' => $client_id,
    'client_secret' => $client_secret
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded'
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code === 200) {
    $token_data = json_decode($response, true);
    
    // Сохраняем настройки
    $db_file = __DIR__ . '/db.json';
    $db = [];
    if (file_exists($db_file)) {
        $db = json_decode(file_get_contents($db_file), true) ?: [];
    }
    
    if (!isset($db['avito_settings'])) {
        $db['avito_settings'] = [];
    }
    
    $db['avito_settings'][$user_id] = [
        'id' => 1,
        'user_id' => $user_id,
        'client_id' => $client_id,
        'client_secret' => $client_secret,
        'access_token' => $token_data['access_token'],
        'refresh_token' => null,
        'is_connected' => true,
        'last_sync' => date('c'),
        'created_at' => date('c'),
        'updated_at' => date('c')
    ];
    
    file_put_contents($db_file, json_encode($db, JSON_PRETTY_PRINT));
    
    echo json_encode([
        'success' => true,
        'message' => 'Подключение успешно (client_credentials)',
        'expires_in' => $token_data['expires_in']
    ]);
} else {
    $error = json_decode($response, true);
    http_response_code(400);
    echo json_encode([
        'error' => $error['error_description'] ?? 'Неверные учетные данные'
    ]);
}
?>