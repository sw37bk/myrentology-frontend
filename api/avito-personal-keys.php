<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Получение персональных ключей пользователя
    $userId = $_GET['userId'] ?? '';
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID required']);
        exit;
    }
    
    $stmt = $pdo->prepare("SELECT client_id, client_secret FROM user_avito_personal_keys WHERE user_id = ?");
    $stmt->execute([$userId]);
    $keys = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($keys) {
        echo json_encode([
            'client_id' => $keys['client_id'],
            'client_secret' => $keys['client_secret'],
            'has_keys' => true
        ]);
    } else {
        echo json_encode(['has_keys' => false]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Сохранение персональных ключей пользователя
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $input['userId'] ?? '';
    $client_id = $input['client_id'] ?? '';
    $client_secret = $input['client_secret'] ?? '';
    
    if (!$userId || !$client_id || !$client_secret) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID, client_id and client_secret required']);
        exit;
    }
    
    $stmt = $pdo->prepare("INSERT INTO user_avito_personal_keys (user_id, client_id, client_secret) 
                          VALUES (?, ?, ?) 
                          ON DUPLICATE KEY UPDATE client_id = ?, client_secret = ?");
    $stmt->execute([$userId, $client_id, $client_secret, $client_id, $client_secret]);
    
    echo json_encode(['success' => true]);
}
?>