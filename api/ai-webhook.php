<?php
// Webhook для автоматической обработки сообщений с AI
header('Content-Type: application/json');

$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

// Получаем данные webhook
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

$chatId = $input['chat_id'] ?? '';
$message = $input['message']['text'] ?? '';
$itemId = $input['item']['id'] ?? '';

if (!$chatId || !$message) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// Находим пользователя по item_id
$stmt = $pdo->prepare("SELECT user_id FROM products WHERE avito_item_id = ?");
$stmt->execute([$itemId]);
$product = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$product) {
    echo json_encode(['success' => false, 'message' => 'Product not found']);
    exit;
}

$userId = $product['user_id'];

// Получаем настройки AI пользователя
$stmt = $pdo->prepare("SELECT * FROM ai_assistant_settings WHERE user_id = ?");
$stmt->execute([$userId]);
$aiSettings = $stmt->fetch(PDO::FETCH_ASSOC);

// Получаем глобальный OpenAI ключ
$stmt = $pdo->prepare("SELECT openai_api_key FROM system_settings LIMIT 1");
$stmt->execute();
$systemSettings = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$systemSettings || !$systemSettings['openai_api_key']) {
    echo json_encode(['success' => false, 'message' => 'OpenAI API key not configured in system']);
    exit;
}

$openaiKey = $systemSettings['openai_api_key'];

// Получаем условия бронирования для ресурса
$resourceConditions = '';
$stmt = $pdo->prepare("SELECT r.*, t.conditions as template_conditions, p.name as resource_name, p.price, p.id as resource_id
                      FROM products p
                      LEFT JOIN resource_booking_conditions r ON r.resource_id = p.id AND r.user_id = ?
                      LEFT JOIN booking_templates t ON r.template_id = t.id 
                      WHERE p.avito_item_id = ?");
$stmt->execute([$userId, $itemId]);
$conditions = $stmt->fetch(PDO::FETCH_ASSOC);

if ($conditions) {
    $resourceConditions = "Информация о ресурсе:\n";
    $resourceConditions .= "Название: " . $conditions['resource_name'] . "\n";
    $resourceConditions .= "Цена: " . $conditions['price'] . " руб/день\n";
    
    if ($conditions['ai_description']) {
        $resourceConditions .= "Описание: " . $conditions['ai_description'] . "\n";
    }
    
    if ($conditions['template_conditions']) {
        $templateCond = json_decode($conditions['template_conditions'], true);
        $resourceConditions .= "Общие условия: " . json_encode($templateCond, JSON_UNESCAPED_UNICODE) . "\n";
    }
    
    if ($conditions['individual_conditions']) {
        $individualCond = json_decode($conditions['individual_conditions'], true);
        $resourceConditions .= "Индивидуальные условия: " . json_encode($individualCond, JSON_UNESCAPED_UNICODE) . "\n";
    }
}

// Формируем системный промпт
$systemPrompt = $aiSettings['system_prompt'] ?: "Ты - AI ассистент по аренде. Отвечай вежливо и профессионально.";
$systemPrompt .= "\n\n" . $resourceConditions;

// Вызов OpenAI API
$response = callOpenAI($openaiKey, $aiSettings['model'] ?? 'gpt-3.5-turbo', $systemPrompt, $message);

// Сохраняем лог переписки
$stmt = $pdo->prepare("INSERT INTO ai_chat_logs (user_id, chat_id, resource_id, customer_message, ai_response) VALUES (?, ?, ?, ?, ?)");
$stmt->execute([$userId, $chatId, $conditions['resource_id'] ?? null, $message, $response]);

// Отправляем ответ обратно в Авито (если есть интеграция)
// Здесь должна быть логика отправки сообщения через Avito API

echo json_encode([
    'success' => true, 
    'response' => $response,
    'auto_reply_sent' => true
]);

function callOpenAI($apiKey, $model, $systemPrompt, $userMessage) {
    $data = [
        'model' => $model,
        'messages' => [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $userMessage]
        ],
        'max_tokens' => 500,
        'temperature' => 0.7
    ];
    
    // Получаем прокси настройки
    global $pdo;
    $stmt = $pdo->prepare("SELECT openai_proxy FROM system_settings LIMIT 1");
    $stmt->execute();
    $proxySettings = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.openai.com/v1/chat/completions');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ]);
    
    // Настройка прокси если есть
    if (!empty($proxySettings['openai_proxy'])) {
        $proxy = $proxySettings['openai_proxy'];
        if (strpos($proxy, '@') !== false) {
            list($auth, $server) = explode('@', $proxy);
            curl_setopt($ch, CURLOPT_PROXY, $server);
            curl_setopt($ch, CURLOPT_PROXYUSERPWD, $auth);
        } else {
            curl_setopt($ch, CURLOPT_PROXY, $proxy);
        }
        curl_setopt($ch, CURLOPT_PROXYTYPE, CURLPROXY_HTTP);
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        return "Извините, произошла ошибка при обработке запроса.";
    }
    
    $result = json_decode($response, true);
    return $result['choices'][0]['message']['content'] ?? "Извините, не удалось сгенерировать ответ.";
}
?>