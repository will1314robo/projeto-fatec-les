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

$id_usuario = $_GET['id_usuario'] ?? '';

if (empty($id_usuario)) {
    echo json_encode(["success" => false, "message" => "ID do usuário não informado."]);
    exit;
}

$sql = "SELECT ID, Data, Status, Valor, Posicao, Atualizado FROM pedido WHERE ID_Usuario = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_usuario);
$stmt->execute();
$result = $stmt->get_result();

$pedidos = [];

while ($row = $result->fetch_assoc()) {
    $pedidos[] = [
        "id" => $row['ID'],
        "data" => $row['Data'],
        "status" => $row['Status'],
        "valor" => $row['Valor'],
        "posicao" => $row['Posicao'],
        "atualizado" => isset($row['Atualizado']) ? intval($row['Atualizado']) : 0
    ];
}

echo json_encode([
    "success" => true,
    "pedidos" => $pedidos
]);

$conn->close();
?>
