<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

$userId = $_GET['user_id'] ?? '';
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

// Запрашиваем объявления из Авито API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.avito.ru/core/v1/accounts/self/items');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $tokenData['access_token'],
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $adsData = json_decode($response, true);
    
    // Сохраняем объявления в базу
    foreach ($adsData['resources'] ?? [] as $ad) {
        $stmt = $pdo->prepare("INSERT INTO avito_ads (user_id, ad_id, title, price, status, ad_data, updated_at) 
                              VALUES (?, ?, ?, ?, ?, ?, NOW()) 
                              ON DUPLICATE KEY UPDATE 
                              title = ?, price = ?, status = ?, ad_data = ?, updated_at = NOW()");
        $stmt->execute([
            $userId,
            $ad['id'],
            $ad['title'] ?? '',
            $ad['price']['value'] ?? 0,
            $ad['status'] ?? '',
            json_encode($ad),
            $ad['title'] ?? '',
            $ad['price']['value'] ?? 0,
            $ad['status'] ?? '',
            json_encode($ad)
        ]);
    }
    
    echo $response;
} else {
    http_response_code($httpCode);
    echo json_encode(['error' => 'Failed to fetch ads from Avito', 'details' => $response]);
}
?>