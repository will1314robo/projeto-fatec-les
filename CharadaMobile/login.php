<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Conexão com o banco
$servername = "localhost";
$username = "root"; // ou seu usuário do MySQL
$password = "";     // sua senha do MySQL
$database = "charada";
$port = 3308;

// Criar conexão
$conn = new mysqli($servername, $username, $password, $database, $port);

// Verificar conexão
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Conexão falhou: " . $conn->connect_error]));
}

// Receber dados do app
$email = $_POST['email'] ?? '';
$senha = $_POST['senha'] ?? '';

// Consulta no banco
$sql = "SELECT * FROM usuario WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $usuario = $result->fetch_assoc();

    // Verificar senha
    if (password_verify($senha, $usuario['Senha'])) {
        echo json_encode([
            "success" => true,
            "id" => $usuario['ID'],
            "nome" => $usuario['Nome'],
            "email" => $usuario['Email']
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Senha incorreta."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Usuário não encontrado."]);
}

$conn->close();
?>
