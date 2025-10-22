<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

$user_id = $_GET['user_id'] ?? $_POST['user_id'] ?? '';
$chat_id = $_GET['chat_id'] ?? $_POST['chat_id'] ?? '';

if (!$user_id || !$chat_id) {
    http_response_code(400);
    echo json_encode(['error' => 'user_id и chat_id обязательны']);
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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Получение сообщений
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.avito.ru/messenger/v3/accounts/{$user_id}/chats/{$chat_id}/messages/?limit=50");
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
        echo json_encode(['error' => 'Ошибка получения сообщений', 'details' => $response]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Отправка сообщения
    $input = json_decode(file_get_contents('php://input'), true);
    $message_text = $input['message'] ?? '';
    
    if (!$message_text) {
        http_response_code(400);
        echo json_encode(['error' => 'Текст сообщения обязателен']);
        exit;
    }

    $message_data = [
        'message' => ['text' => $message_text],
        'type' => 'text'
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.avito.ru/messenger/v1/accounts/{$user_id}/chats/{$chat_id}/messages");
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($message_data));
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
        echo json_encode(['error' => 'Ошибка отправки сообщения', 'details' => $response]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>