<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

$userId = $_GET['user_id'] ?? '';
$chatId = $_GET['chat_id'] ?? '';

if (!$userId || !$chatId) {
    http_response_code(400);
    echo json_encode(['error' => 'user_id and chat_id required']);
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

// Получаем сообщения из чата
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.avito.ru/messenger/v1/chats/{$chatId}/messages");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $tokenData['access_token'],
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $messagesData = json_decode($response, true);
    
    // Сохраняем сообщения в базу
    foreach ($messagesData['messages'] ?? [] as $message) {
        $stmt = $pdo->prepare("INSERT INTO avito_messages (user_id, chat_id, message_id, message_text, author_type, created_at, message_data) 
                              VALUES (?, ?, ?, ?, ?, ?, ?) 
                              ON DUPLICATE KEY UPDATE message_data = ?");
        $stmt->execute([
            $userId,
            $chatId,
            $message['id'],
            $message['content']['text'] ?? '',
            $message['author']['type'] ?? '',
            $message['created'] ?? null,
            json_encode($message),
            json_encode($message)
        ]);
    }
    
    echo $response;
} else {
    http_response_code($httpCode);
    echo json_encode(['error' => 'Failed to fetch messages from Avito', 'details' => $response, 'http_code' => $httpCode]);
}
?>