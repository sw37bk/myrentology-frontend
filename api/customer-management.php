<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

// Поиск или создание клиента по телефону/email
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'find_or_create') {
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $input['user_id'];
    $phone = $input['phone'] ?? '';
    $email = $input['email'] ?? '';
    $name = $input['name'] ?? '';
    
    // Ищем существующего клиента
    $customer = null;
    if ($phone) {
        $stmt = $pdo->prepare("SELECT * FROM ai_customers WHERE user_id = ? AND phone = ?");
        $stmt->execute([$userId, $phone]);
        $customer = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    if (!$customer && $email) {
        $stmt = $pdo->prepare("SELECT * FROM ai_customers WHERE user_id = ? AND email = ?");
        $stmt->execute([$userId, $email]);
        $customer = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    // Создаем нового клиента если не найден
    if (!$customer) {
        $stmt = $pdo->prepare("INSERT INTO ai_customers (user_id, phone, email, name) VALUES (?, ?, ?, ?)");
        $stmt->execute([$userId, $phone, $email, $name]);
        $customerId = $pdo->lastInsertId();
        
        $customer = [
            'id' => $customerId,
            'user_id' => $userId,
            'phone' => $phone,
            'email' => $email,
            'name' => $name,
            'total_bookings' => 0,
            'total_spent' => 0
        ];
    }
    
    echo json_encode($customer);
    exit;
}

// Получение истории взаимодействий клиента
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'history') {
    $customerId = $_GET['customer_id'] ?? '';
    $limit = $_GET['limit'] ?? 50;
    
    $stmt = $pdo->prepare("SELECT ci.*, p.name as resource_name 
                          FROM customer_interactions ci 
                          LEFT JOIN products p ON ci.resource_id = p.id 
                          WHERE ci.customer_id = ? 
                          ORDER BY ci.created_at DESC 
                          LIMIT ?");
    $stmt->execute([$customerId, $limit]);
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($history);
    exit;
}

// Сохранение взаимодействия
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'save_interaction') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $pdo->prepare("INSERT INTO customer_interactions 
                          (user_id, customer_id, chat_platform, chat_id, message_type, message_text, ai_generated, resource_id) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $input['user_id'],
        $input['customer_id'],
        $input['chat_platform'] ?? 'avito',
        $input['chat_id'],
        $input['message_type'],
        $input['message_text'],
        $input['ai_generated'] ?? false,
        $input['resource_id'] ?? null
    ]);
    
    // Обновляем дату последнего контакта
    $stmt = $pdo->prepare("UPDATE ai_customers SET last_contact_date = NOW() WHERE id = ?");
    $stmt->execute([$input['customer_id']]);
    
    echo json_encode(['success' => true, 'interaction_id' => $pdo->lastInsertId()]);
    exit;
}

// Получение клиентов для CRM
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'list') {
    $userId = $_GET['user_id'] ?? '';
    
    $stmt = $pdo->prepare("SELECT c.*, 
                          COUNT(ab.id) as pending_bookings,
                          (SELECT COUNT(*) FROM customer_interactions WHERE customer_id = c.id) as total_messages
                          FROM ai_customers c 
                          LEFT JOIN auto_bookings ab ON c.id = ab.customer_id AND ab.status = 'pending'
                          WHERE c.user_id = ? 
                          GROUP BY c.id 
                          ORDER BY c.last_contact_date DESC");
    $stmt->execute([$userId]);
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($customers);
    exit;
}
?>