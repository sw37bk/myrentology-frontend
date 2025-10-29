<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

// Получение настроек AI ассистента
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'settings') {
    $userId = $_GET['user_id'] ?? '';
    
    $stmt = $pdo->prepare("SELECT system_prompt, auto_booking_enabled, response_style FROM ai_assistant_settings WHERE user_id = ?");
    $stmt->execute([$userId]);
    $settings = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$settings) {
        $settings = [
            'user_id' => $userId,
            'auto_booking_enabled' => false,
            'response_style' => 'friendly'
        ];
    }
    
    // Получаем глобальные настройки из системы
    $stmt = $pdo->prepare("SELECT openai_api_key, openai_model FROM system_settings LIMIT 1");
    $stmt->execute();
    $systemSettings = $stmt->fetch(PDO::FETCH_ASSOC);
    $settings['has_openai_key'] = !empty($systemSettings['openai_api_key']);
    $settings['model'] = $systemSettings['openai_model'] ?? 'gpt-3.5-turbo';
    
    echo json_encode($settings);
    exit;
}

// Сохранение настроек AI ассистента
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'settings') {
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $input['user_id'];
    
    $stmt = $pdo->prepare("INSERT INTO ai_assistant_settings (user_id, system_prompt, auto_booking_enabled, response_style) 
                          VALUES (?, ?, ?, ?) 
                          ON DUPLICATE KEY UPDATE 
                          system_prompt = ?, auto_booking_enabled = ?, response_style = ?");
    $stmt->execute([
        $userId, $input['system_prompt'], 
        $input['auto_booking_enabled'], $input['response_style'],
        $input['system_prompt'], 
        $input['auto_booking_enabled'], $input['response_style']
    ]);
    
    echo json_encode(['success' => true]);
    exit;
}

// Генерация ответа AI
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'generate') {
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $input['user_id'];
    $chatId = $input['chat_id'];
    $resourceId = $input['resource_id'] ?? null;
    $customerMessage = $input['message'];
    
    // Получаем настройки AI пользователя
    $stmt = $pdo->prepare("SELECT * FROM ai_assistant_settings WHERE user_id = ?");
    $stmt->execute([$userId]);
    $aiSettings = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Получаем глобальные настройки
    $stmt = $pdo->prepare("SELECT openai_api_key, openai_model FROM system_settings LIMIT 1");
    $stmt->execute();
    $systemSettings = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$systemSettings || !$systemSettings['openai_api_key']) {
        echo json_encode(['error' => 'OpenAI API key not configured in system']);
        exit;
    }
    
    $openaiKey = $systemSettings['openai_api_key'];
    $model = $systemSettings['openai_model'] ?? 'gpt-3.5-turbo';
    
    // Находим или создаем клиента
    $customerData = extractCustomerInfo($customerMessage);
    $customer = findOrCreateCustomer($pdo, $userId, $customerData);
    
    // Получаем историю взаимодействий
    $stmt = $pdo->prepare("SELECT message_text, message_type, created_at FROM customer_interactions 
                          WHERE customer_id = ? ORDER BY created_at DESC LIMIT 10");
    $stmt->execute([$customer['id']]);
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Добавляем историю в контекст
    $historyContext = "";
    if (!empty($history)) {
        $historyContext = "\n\nИстория общения с клиентом:";
        foreach (array_reverse($history) as $msg) {
            $type = $msg['message_type'] === 'incoming' ? 'Клиент' : 'Мы';
            $historyContext .= "\n{$type}: {$msg['message_text']}";
        }
    }
    
    // Получаем условия бронирования для ресурса
    $resourceConditions = '';
    if ($resourceId) {
        $stmt = $pdo->prepare("SELECT r.*, t.conditions as template_conditions, p.name as resource_name, p.price 
                              FROM resource_booking_conditions r 
                              LEFT JOIN booking_templates t ON r.template_id = t.id 
                              LEFT JOIN products p ON p.id = r.resource_id
                              WHERE r.user_id = ? AND r.resource_id = ?");
        $stmt->execute([$userId, $resourceId]);
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
    }
    
    // Формируем системный промпт
    $systemPrompt = $aiSettings['system_prompt'] ?: "Ты - AI ассистент по аренде. Отвечай вежливо и профессионально.";
    $systemPrompt .= "\n\n" . $resourceConditions . $historyContext;
    
    // Вызов OpenAI API
    $response = callOpenAI($openaiKey, $model, $systemPrompt, $customerMessage);
    
    // Сохраняем взаимодействия
    saveInteraction($pdo, $userId, $customer['id'], $chatId, 'incoming', $customerMessage, false, $resourceId);
    saveInteraction($pdo, $userId, $customer['id'], $chatId, 'outgoing', $response, true, $resourceId);
    
    echo json_encode(['response' => $response]);
    exit;
}

// Создание автоматического бронирования
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'create_booking') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("INSERT INTO auto_bookings (user_id, resource_id, chat_id, customer_name, customer_phone, start_date, end_date, total_price, ai_context) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $input['user_id'], $input['resource_id'], $input['chat_id'], 
        $input['customer_name'], $input['customer_phone'], 
        $input['start_date'], $input['end_date'], $input['total_price'],
        json_encode($input['ai_context'])
    ]);
    
    echo json_encode(['success' => true, 'booking_id' => $pdo->lastInsertId()]);
    exit;
}

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

function extractCustomerInfo($message) {
    $phone = '';
    $email = '';
    
    // Ищем телефон
    if (preg_match('/\+?[78]\d{10}/', $message, $matches)) {
        $phone = $matches[0];
    }
    
    // Ищем email
    if (preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $message, $matches)) {
        $email = $matches[0];
    }
    
    return ['phone' => $phone, 'email' => $email];
}

function findOrCreateCustomer($pdo, $userId, $customerData) {
    $customer = null;
    
    if ($customerData['phone']) {
        $stmt = $pdo->prepare("SELECT * FROM ai_customers WHERE user_id = ? AND phone = ?");
        $stmt->execute([$userId, $customerData['phone']]);
        $customer = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    if (!$customer && $customerData['email']) {
        $stmt = $pdo->prepare("SELECT * FROM ai_customers WHERE user_id = ? AND email = ?");
        $stmt->execute([$userId, $customerData['email']]);
        $customer = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    if (!$customer) {
        $stmt = $pdo->prepare("INSERT INTO ai_customers (user_id, phone, email, name) VALUES (?, ?, ?, ?)");
        $stmt->execute([$userId, $customerData['phone'], $customerData['email'], 'Клиент']);
        $customerId = $pdo->lastInsertId();
        
        $customer = [
            'id' => $customerId,
            'user_id' => $userId,
            'phone' => $customerData['phone'],
            'email' => $customerData['email']
        ];
    }
    
    return $customer;
}

function saveInteraction($pdo, $userId, $customerId, $chatId, $type, $message, $aiGenerated, $resourceId) {
    $stmt = $pdo->prepare("INSERT INTO customer_interactions 
                          (user_id, customer_id, chat_platform, chat_id, message_type, message_text, ai_generated, resource_id) 
                          VALUES (?, ?, 'avito', ?, ?, ?, ?, ?)");
    $stmt->execute([$userId, $customerId, $chatId, $type, $message, $aiGenerated, $resourceId]);
}
?>