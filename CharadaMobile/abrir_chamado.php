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
    die(json_encode(["success" => false, "message" => "Conexão falhou: " . $conn->connect_error]));
}

$pedido_id = $_POST['pedido_id'] ?? '';
$descricao = $_POST['descricao'] ?? '';
$whatsapp = $_POST['whatsapp'] ?? '';
$email = $_POST['email'] ?? '';

if (empty($pedido_id) || empty($descricao) || empty($whatsapp) || empty($email)) {
    echo json_encode(["success" => false, "message" => "Todos os campos são obrigatórios."]);
    exit;
}

$sql = "INSERT INTO chamados (PedidoID, Descricao, Whatsapp, Email) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("isss", $pedido_id, $descricao, $whatsapp, $email);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Chamado aberto com sucesso."]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao abrir chamado."]);
}

$conn->close();
?>
