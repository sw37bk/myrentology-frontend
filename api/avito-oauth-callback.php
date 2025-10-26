<?php
$pdo = new PDO("mysql:host=localhost;dbname=u3304368_default;charset=utf8", "u3304368_default", "TVUuIyb7r6w6D2Ut");

$code = $_GET['code'] ?? '';
$state = $_GET['state'] ?? '';

if (!$code || !$state) {
    echo '<script>window.close();</script>';
    exit;
}

// Декодируем state
$stateData = json_decode(base64_decode($state), true);
$userId = $stateData['userId'] ?? '';

if (!$userId) {
    echo '<script>window.close();</script>';
    exit;
}

// Получаем настройки приложения
$stmt = $pdo->query("SELECT * FROM avito_app_settings WHERE id = 1");
$settings = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$settings) {
    echo '<script>window.close();</script>';
    exit;
}

// Обмениваем код на токен
$tokenData = [
    'grant_type' => 'authorization_code',
    'client_id' => $settings['client_id'],
    'client_secret' => $settings['client_secret'],
    'code' => $code,
    'redirect_uri' => 'https://myrentology.ru/api/avito-oauth-callback'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.avito.ru/token');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($tokenData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);

$response = curl_exec($ch);
curl_close($ch);

$tokenResponse = json_decode($response, true);

if (isset($tokenResponse['access_token'])) {
    // Сохраняем токен
    $expires_at = date('Y-m-d H:i:s', time() + $tokenResponse['expires_in']);
    
    $stmt = $pdo->prepare("INSERT INTO user_avito_tokens (user_id, access_token, refresh_token, expires_at) 
                          VALUES (?, ?, ?, ?) 
                          ON DUPLICATE KEY UPDATE 
                          access_token = ?, refresh_token = ?, expires_at = ?");
    
    $stmt->execute([
        $userId, 
        $tokenResponse['access_token'], 
        $tokenResponse['refresh_token'] ?? '', 
        $expires_at,
        $tokenResponse['access_token'], 
        $tokenResponse['refresh_token'] ?? '', 
        $expires_at
    ]);
    
    echo '<script>
        window.opener.postMessage({type: "avito_connected", success: true}, "*");
        window.close();
    </script>';
} else {
    echo '<script>
        window.opener.postMessage({type: "avito_connected", success: false}, "*");
        window.close();
    </script>';
}
?>