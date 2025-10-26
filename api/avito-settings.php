<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Получение настроек
    $stmt = $pdo->query("SELECT * FROM avito_app_settings WHERE id = 1");
    $settings = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($settings) {
        echo json_encode([
            'client_id' => $settings['client_id'],
            'has_settings' => !empty($settings['client_id'])
        ]);
    } else {
        echo json_encode(['has_settings' => false]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Сохранение настроек (только админ)
    $input = json_decode(file_get_contents('php://input'), true);
    $client_id = $input['client_id'] ?? '';
    $client_secret = $input['client_secret'] ?? '';
    
    if (!$client_id || !$client_secret) {
        http_response_code(400);
        echo json_encode(['error' => 'Client ID and secret required']);
        exit;
    }
    
    $stmt = $pdo->prepare("INSERT INTO avito_app_settings (id, client_id, client_secret) VALUES (1, ?, ?) 
                          ON DUPLICATE KEY UPDATE client_id = ?, client_secret = ?");
    $stmt->execute([$client_id, $client_secret, $client_id, $client_secret]);
    
    echo json_encode(['success' => true]);
}
?>