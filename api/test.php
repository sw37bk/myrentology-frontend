<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
echo json_encode(['status' => 'PHP works', 'method' => $_SERVER['REQUEST_METHOD']]);
?>