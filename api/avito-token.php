<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $input['userId'] ?? '';
} else {
    $userId = $_GET['userId'] ?? '';
}

if (!$userId) {
    http_response_code(400);
    echo json_encode(['error' => 'User ID required']);
    exit;
}

// Получаем персональные ключи пользователя
$stmt = $pdo->prepare("SELECT * FROM user_avito_personal_keys WHERE user_id = ?");
$stmt->execute([$userId]);
$personalKeys = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$personalKeys) {
    http_response_code(404);
    echo json_encode(['error' => 'Personal keys not found. Please add your Avito keys first.']);
    exit;
}

// Получаем токен через персональные ключи пользователя
$tokenData = [
    'grant_type' => 'client_credentials',
    'client_id' => $personalKeys['client_id'],
    'client_secret' => $personalKeys['client_secret']
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.avito.ru/token');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($tokenData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);

$response = curl_exec($ch);
curl_close($ch);

$tokenResponse = json_decode($response, true);

if (isset($tokenResponse['access_token'])) {
    // Сохраняем токен на месяц
    $expires_at = date('Y-m-d H:i:s', time() + (30 * 24 * 60 * 60)); // 30 дней
    
    $stmt = $pdo->prepare("INSERT INTO user_avito_tokens (user_id, access_token, expires_at) 
                          VALUES (?, ?, ?) 
                          ON DUPLICATE KEY UPDATE access_token = ?, expires_at = ?");
    
    $stmt->execute([
        $userId, 
        $tokenResponse['access_token'], 
        $expires_at,
        $tokenResponse['access_token'], 
        $expires_at
    ]);
    
    echo json_encode([
        'access_token' => $tokenResponse['access_token'],
        'expires_at' => $expires_at
    ]);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Failed to get token: ' . ($tokenResponse['error_description'] ?? 'Unknown error')]);
}
?>