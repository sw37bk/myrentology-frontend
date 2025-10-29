<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = $_GET['user_id'] ?? '';
    $resourceId = $_GET['resource_id'] ?? '';
    
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID required']);
        exit;
    }
    
    if ($resourceId) {
        // Получение условий конкретного ресурса
        $stmt = $pdo->prepare("SELECT r.*, t.name as template_name, t.conditions as template_conditions 
                              FROM resource_booking_conditions r 
                              LEFT JOIN booking_templates t ON r.template_id = t.id 
                              WHERE r.user_id = ? AND r.resource_id = ?");
        $stmt->execute([$userId, $resourceId]);
        $conditions = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($conditions) {
            echo json_encode([
                'resource_id' => $conditions['resource_id'],
                'template_id' => $conditions['template_id'],
                'template_name' => $conditions['template_name'],
                'individual_conditions' => json_decode($conditions['individual_conditions'], true),
                'template_conditions' => json_decode($conditions['template_conditions'], true),
                'ai_description' => $conditions['ai_description']
            ]);
        } else {
            echo json_encode(['resource_id' => $resourceId, 'conditions' => null]);
        }
    } else {
        // Получение всех шаблонов пользователя
        $stmt = $pdo->prepare("SELECT * FROM booking_templates WHERE user_id = ? ORDER BY name");
        $stmt->execute([$userId]);
        $templates = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['templates' => $templates]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Создание шаблона условий
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $input['user_id'] ?? '';
    $name = $input['name'] ?? '';
    $description = $input['description'] ?? '';
    $conditions = $input['conditions'] ?? [];
    
    if (!$userId || !$name) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID and name required']);
        exit;
    }
    
    $stmt = $pdo->prepare("INSERT INTO booking_templates (user_id, name, description, conditions) VALUES (?, ?, ?, ?)");
    $stmt->execute([$userId, $name, $description, json_encode($conditions)]);
    
    echo json_encode(['success' => true, 'template_id' => $pdo->lastInsertId()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Обновление условий ресурса
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $input['user_id'] ?? '';
    $resourceId = $input['resource_id'] ?? '';
    $templateId = $input['template_id'] ?? null;
    $individualConditions = $input['individual_conditions'] ?? [];
    $aiDescription = $input['ai_description'] ?? '';
    
    if (!$userId || !$resourceId) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID and resource ID required']);
        exit;
    }
    
    $stmt = $pdo->prepare("INSERT INTO resource_booking_conditions (user_id, resource_id, template_id, individual_conditions, ai_description) 
                          VALUES (?, ?, ?, ?, ?) 
                          ON DUPLICATE KEY UPDATE 
                          template_id = ?, individual_conditions = ?, ai_description = ?");
    $stmt->execute([
        $userId, $resourceId, $templateId, json_encode($individualConditions), $aiDescription,
        $templateId, json_encode($individualConditions), $aiDescription
    ]);
    
    echo json_encode(['success' => true]);
}
?>