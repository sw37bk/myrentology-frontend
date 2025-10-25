<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

$db_file = __DIR__ . '/db.json';

function readDB() {
    global $db_file;
    if (file_exists($db_file)) {
        return json_decode(file_get_contents($db_file), true);
    }
    return ['avito_settings' => []];
}

function writeDB($data) {
    global $db_file;
    return file_put_contents($db_file, json_encode($data, JSON_PRETTY_PRINT));
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = $_GET['userId'] ?? '';
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['error' => 'userId обязателен']);
        exit;
    }
    
    $db = readDB();
    if (!isset($db['avito_settings'][$userId])) {
        http_response_code(404);
        echo json_encode(['error' => 'Настройки не найдены']);
        exit;
    }
    
    echo json_encode($db['avito_settings'][$userId]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $user_id = $input['userId'] ?? '';
    
    if (!$user_id) {
        http_response_code(400);
        echo json_encode(['error' => 'user_id обязателен']);
        exit;
    }
    
    $settings = [
        'id' => 1,
        'user_id' => $user_id,
        'client_id' => $input['client_id'] ?? '',
        'client_secret' => $input['client_secret'] ?? '',
        'access_token' => $input['access_token'] ?? null,
        'refresh_token' => $input['refresh_token'] ?? null,
        'is_connected' => ($input['is_connected'] ?? false) !== false,
        'last_sync' => date('c'),
        'created_at' => date('c'),
        'updated_at' => date('c')
    ];
    
    $db = readDB();
    $db['avito_settings'][$user_id] = $settings;
    writeDB($db);
    
    echo json_encode($settings);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>