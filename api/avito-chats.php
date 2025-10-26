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

// Запрашиваем чаты из реального Авито Messenger API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.avito.ru/messenger/v2/accounts/self/chats');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $tokenData['access_token'],
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $chatsData = json_decode($response, true);
    
    // Сохраняем чаты в базу для кеширования
    if (isset($chatsData['chats'])) {
        foreach ($chatsData['chats'] as $chat) {
            $stmt = $pdo->prepare("INSERT INTO avito_chats (user_id, chat_id, item_id, chat_data, updated_at) 
                                  VALUES (?, ?, ?, ?, NOW()) 
                                  ON DUPLICATE KEY UPDATE chat_data = ?, updated_at = NOW()");
            $stmt->execute([
                $userId, 
                $chat['id'], 
                $chat['context']['value'] ?? null,
                json_encode($chat),
                json_encode($chat)
            ]);
        }
    }
    
    echo $response;
} else {
    // Если API недоступен, возвращаем кешированные данные
    $stmt = $pdo->prepare("SELECT chat_data FROM avito_chats WHERE user_id = ? ORDER BY updated_at DESC");
    $stmt->execute([$userId]);
    $cachedChats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($cachedChats) {
        $chats = array_map(function($row) {
            return json_decode($row['chat_data'], true);
        }, $cachedChats);
        
        echo json_encode(['chats' => $chats]);
    } else {
        http_response_code($httpCode);
        echo json_encode([
            'error' => 'Failed to fetch chats from Avito', 
            'details' => $response, 
            'http_code' => $httpCode
        ]);
    }
}
?>