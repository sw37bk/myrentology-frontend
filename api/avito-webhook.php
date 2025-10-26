<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Логируем все входящие запросы
$input = file_get_contents('php://input');
$headers = getallheaders();
$method = $_SERVER['REQUEST_METHOD'];

// Логируем в файл для отладки
file_put_contents('webhook.log', date('Y-m-d H:i:s') . " - Method: $method\n" . "Headers: " . json_encode($headers) . "\n" . "Body: $input\n\n", FILE_APPEND);

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode($input, true);
if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

// Обрабатываем webhook от Авито
if (isset($data['type']) && $data['type'] === 'message') {
    $chatId = $data['payload']['chat_id'] ?? '';
    $messageText = $data['payload']['content']['text'] ?? '';
    $messageId = $data['payload']['id'] ?? '';
    $authorType = $data['payload']['author']['type'] ?? '';
    $created = $data['payload']['created'] ?? date('Y-m-d H:i:s');
    
    if ($chatId && $messageText) {
        // Сохраняем сообщение в базу
        $stmt = $pdo->prepare("INSERT INTO avito_messages (user_id, chat_id, message_id, message_text, author_type, created_at, message_data) 
                              VALUES (?, ?, ?, ?, ?, ?, ?) 
                              ON DUPLICATE KEY UPDATE message_data = ?");
        $stmt->execute([
            999, // Пока используем фиксированный user_id
            $chatId,
            $messageId,
            $messageText,
            $authorType,
            $created,
            json_encode($data['payload']),
            json_encode($data['payload'])
        ]);
        
        // Обновляем или создаем чат
        $stmt = $pdo->prepare("INSERT INTO avito_chats (user_id, chat_id, item_id, chat_data, updated_at) 
                              VALUES (?, ?, ?, ?, NOW()) 
                              ON DUPLICATE KEY UPDATE chat_data = ?, updated_at = NOW()");
        
        $chatData = [
            'id' => $chatId,
            'last_message' => [
                'content' => ['text' => $messageText],
                'created' => time(),
                'direction' => $authorType === 'user' ? 'out' : 'in'
            ],
            'context' => ['value' => ['title' => 'Чат из webhook']],
            'users' => [['id' => 1, 'name' => 'Клиент']]
        ];
        
        $stmt->execute([
            999,
            $chatId,
            $data['payload']['item']['id'] ?? null,
            json_encode($chatData),
            json_encode($chatData)
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Webhook processed']);
    } else {
        echo json_encode(['error' => 'Missing required fields']);
    }
} else {
    // Сохраняем все webhook'и для анализа
    $stmt = $pdo->prepare("INSERT INTO webhook_logs (webhook_data, created_at) VALUES (?, NOW())");
    $stmt->execute([json_encode($data)]);
    
    echo json_encode(['success' => true, 'message' => 'Webhook logged']);
}
?>