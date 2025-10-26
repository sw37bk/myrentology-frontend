<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Привязка ресурса к объявлению
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $input['user_id'] ?? '';
    $resourceId = $input['resource_id'] ?? '';
    $avitoAdId = $input['avito_ad_id'] ?? '';
    
    if (!$userId || !$resourceId || !$avitoAdId) {
        http_response_code(400);
        echo json_encode(['error' => 'user_id, resource_id and avito_ad_id required']);
        exit;
    }
    
    $stmt = $pdo->prepare("INSERT INTO resource_avito_links (user_id, resource_id, avito_ad_id) 
                          VALUES (?, ?, ?) 
                          ON DUPLICATE KEY UPDATE avito_ad_id = ?");
    $stmt->execute([$userId, $resourceId, $avitoAdId, $avitoAdId]);
    
    echo json_encode(['success' => true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Получение привязок
    $userId = $_GET['user_id'] ?? '';
    $resourceId = $_GET['resource_id'] ?? '';
    
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['error' => 'user_id required']);
        exit;
    }
    
    if ($resourceId) {
        // Привязка конкретного ресурса
        $stmt = $pdo->prepare("SELECT * FROM resource_avito_links WHERE user_id = ? AND resource_id = ?");
        $stmt->execute([$userId, $resourceId]);
        $link = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($link ?: ['linked' => false]);
    } else {
        // Все привязки пользователя
        $stmt = $pdo->prepare("SELECT * FROM resource_avito_links WHERE user_id = ?");
        $stmt->execute([$userId]);
        $links = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['links' => $links]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Удаление привязки
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $input['user_id'] ?? '';
    $resourceId = $input['resource_id'] ?? '';
    
    if (!$userId || !$resourceId) {
        http_response_code(400);
        echo json_encode(['error' => 'user_id and resource_id required']);
        exit;
    }
    
    $stmt = $pdo->prepare("DELETE FROM resource_avito_links WHERE user_id = ? AND resource_id = ?");
    $stmt->execute([$userId, $resourceId]);
    
    echo json_encode(['success' => true]);
}
?>