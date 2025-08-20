<?php
include 'conexao.php';

$tipo = $_GET['tipo'] ?? '';
$tipo = trim($tipo);

if ($tipo === '') {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(["erro" => "Tipo não informado."]);
    exit;
}

$stmt = $conn->prepare("
  SELECT m.nome, e.quantidade
  FROM estoque e
  JOIN materiais m ON e.material_id = m.id
  WHERE m.tipo = ?
  ORDER BY m.nome ASC
");
$stmt->bind_param("s", $tipo);
$stmt->execute();

$result = $stmt->get_result();
$dados = [];
while ($row = $result->fetch_assoc()) {
    $dados[] = $row;
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($dados);

$stmt->close();
$conn->close();
