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

$pedido_id = $_GET['pedido_id'] ?? '';

if (empty($pedido_id)) {
    echo json_encode(["success" => false, "message" => "ID do pedido não informado."]);
    exit;
}

$sql = "SELECT * FROM chamados WHERE PedidoID = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $pedido_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $chamado = $result->fetch_assoc();
    echo json_encode([
        "success" => true,
        "chamado" => [
            "id" => $chamado['ID'],
            "descricao" => $chamado['Descricao'],
            "whatsapp" => $chamado['Whatsapp'],
            "email" => $chamado['Email'],
            "data" => $chamado['DataAbertura']
        ]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Nenhum chamado encontrado."]);
}

$conn->close();
?>
