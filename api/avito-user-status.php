<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

$userId = $_GET['userId'] ?? '';
if (!$userId) {
    http_response_code(400);
    echo json_encode(['error' => 'User ID required']);
    exit;
}

// Проверяем есть ли токен у пользователя
$stmt = $pdo->prepare("SELECT * FROM user_avito_tokens WHERE user_id = ?");
$stmt->execute([$userId]);
$token = $stmt->fetch(PDO::FETCH_ASSOC);

$connected = false;
$expired = false;

if ($token) {
    $connected = true;
    if ($token['expires_at'] && strtotime($token['expires_at']) < time()) {
        $expired = true;
    }
}

echo json_encode([
    'connected' => $connected,
    'expired' => $expired,
    'expires_at' => $token['expires_at'] ?? null
]);
?>