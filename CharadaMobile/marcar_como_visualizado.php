<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$servername = "localhost";
$username = "root";
$password = "";
$database = "charada";
$port = 3308;

$conn = new mysqli($servername, $username, $password, $database, $port);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Conexão falhou."]));
}

$pedido_id = $_POST['pedido_id'] ?? '';

if (empty($pedido_id)) {
    echo json_encode(["success" => false, "message" => "ID do pedido não informado."]);
    exit;
}

$sql = "UPDATE pedido SET Atualizado = 0 WHERE ID = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $pedido_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao atualizar."]);
}

$conn->close();
?>
