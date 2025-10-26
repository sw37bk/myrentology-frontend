<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

$input = json_decode(file_get_contents('php://input'), true);
$userId = $input['user_id'] ?? '';

if (!$userId) {
    http_response_code(400);
    echo json_encode(['error' => 'User ID required']);
    exit;
}

// Получаем токен пользователя
$stmt = $pdo->prepare("SELECT access_token FROM user_avito_tokens WHERE user_id = ?");
$stmt->execute([$userId]);
$tokenData = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$tokenData) {
    http_response_code(404);
    echo json_encode(['error' => 'Avito token not found']);
    exit;
}

// Настраиваем webhook в Авито
$webhookData = [
    'url' => 'https://myrentology.ru/api/avito-webhook',
    'events' => ['message']
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.avito.ru/messenger/v1/webhooks');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($webhookData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $tokenData['access_token'],
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 || $httpCode === 201) {
    echo json_encode([
        'success' => true, 
        'message' => 'Webhook configured successfully',
        'webhook_url' => 'https://myrentology.ru/api/avito-webhook'
    ]);
} else {
    echo json_encode([
        'error' => 'Failed to setup webhook', 
        'details' => $response, 
        'http_code' => $httpCode
    ]);
}
?>