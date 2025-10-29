<?php
// API для управления OpenAI ключом (только для админов)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

// Проверка прав администратора (упрощенная проверка)
$userId = $_GET['user_id'] ?? $_POST['user_id'] ?? '';
if ($userId != 1) { // Только пользователь с ID 1 - админ
    http_response_code(403);
    echo json_encode(['error' => 'Access denied']);
    exit;
}

// Получение настроек OpenAI
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare("SELECT openai_api_key, openai_proxy, openai_model FROM system_settings LIMIT 1");
    $stmt->execute();
    $settings = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'has_key' => !empty($settings['openai_api_key']),
        'key_preview' => $settings['openai_api_key'] ? 'sk-...' . substr($settings['openai_api_key'], -4) : null,
        'has_proxy' => !empty($settings['openai_proxy']),
        'proxy_preview' => $settings['openai_proxy'] ? '***@' . explode('@', $settings['openai_proxy'])[1] ?? '***' : null,
        'model' => $settings['openai_model'] ?? 'gpt-3.5-turbo'
    ]);
    exit;
}

// Сохранение OpenAI ключа, прокси и модели
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $apiKey = $input['openai_api_key'] ?? '';
    $proxy = $input['openai_proxy'] ?? '';
    $model = $input['openai_model'] ?? 'gpt-3.5-turbo';
    
    // Проверяем существует ли запись в system_settings
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM system_settings");
    $stmt->execute();
    $count = $stmt->fetchColumn();
    
    if ($count > 0) {
        $stmt = $pdo->prepare("UPDATE system_settings SET openai_api_key = ?, openai_proxy = ?, openai_model = ?");
        $stmt->execute([$apiKey, $proxy, $model]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO system_settings (openai_api_key, openai_proxy, openai_model) VALUES (?, ?, ?)");
        $stmt->execute([$apiKey, $proxy, $model]);
    }
    
    echo json_encode(['success' => true]);
    exit;
}
?>