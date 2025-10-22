<?php
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    exit('Method not allowed');
}

$code = $_GET['code'] ?? '';
$state = $_GET['state'] ?? '';
$error = $_GET['error'] ?? '';

if ($error) {
    echo "<script>
        window.opener.postMessage({type: 'AVITO_AUTH_ERROR', error: '$error'}, '*');
        window.close();
    </script>";
    exit;
}

if (!$code || !$state) {
    echo "<script>
        window.opener.postMessage({type: 'AVITO_AUTH_ERROR', error: 'Missing code or state'}, '*');
        window.close();
    </script>";
    exit;
}

try {
    // Получаем данные OAuth из state
    $oauth_file = __DIR__ . '/oauth_states.json';
    $oauth_data = [];
    if (file_exists($oauth_file)) {
        $oauth_data = json_decode(file_get_contents($oauth_file), true) ?: [];
    }
    
    if (!isset($oauth_data[$state])) {
        throw new Exception('Invalid state');
    }
    
    $oauth_info = $oauth_data[$state];
    
    // Обмениваем код на токен
    $token_data = [
        'grant_type' => 'authorization_code',
        'client_id' => $oauth_info['client_id'],
        'client_secret' => $oauth_info['client_secret'],
        'code' => $code
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.avito.ru/token/');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($token_data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/x-www-form-urlencoded'
    ]);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($http_code === 200) {
        $token_info = json_decode($response, true);
        
        // Сохраняем настройки
        $db_file = __DIR__ . '/db.json';
        $db = [];
        if (file_exists($db_file)) {
            $db = json_decode(file_get_contents($db_file), true) ?: [];
        }
        
        if (!isset($db['avito_settings'])) {
            $db['avito_settings'] = [];
        }
        
        $db['avito_settings'][$oauth_info['user_id']] = [
            'id' => 1,
            'user_id' => $oauth_info['user_id'],
            'client_id' => $oauth_info['client_id'],
            'client_secret' => $oauth_info['client_secret'],
            'access_token' => $token_info['access_token'],
            'refresh_token' => $token_info['refresh_token'] ?? null,
            'is_connected' => true,
            'last_sync' => date('c'),
            'created_at' => date('c'),
            'updated_at' => date('c')
        ];
        
        file_put_contents($db_file, json_encode($db, JSON_PRETTY_PRINT));
        
        // Очищаем state
        unset($oauth_data[$state]);
        file_put_contents($oauth_file, json_encode($oauth_data));
        
        echo "<script>
            window.opener.postMessage({type: 'AVITO_AUTH_SUCCESS'}, '*');
            window.close();
        </script>";
    } else {
        $error_info = json_decode($response, true);
        $error_msg = $error_info['error_description'] ?? 'Ошибка получения токена';
        echo "<script>
            window.opener.postMessage({type: 'AVITO_AUTH_ERROR', error: '$error_msg'}, '*');
            window.close();
        </script>";
    }
} catch (Exception $e) {
    echo "<script>
        window.opener.postMessage({type: 'AVITO_AUTH_ERROR', error: 'Ошибка сервера'}, '*');
        window.close();
    </script>";
}
?>