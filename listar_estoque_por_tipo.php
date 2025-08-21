<?php
include 'conexao.php';

$tipo = $_GET['tipo'] ?? '';
$tipo = trim($tipo);

header('Content-Type: application/json; charset=utf-8');

if ($tipo === '') {
    echo json_encode([]);
    exit;
}

/*
  Busca itens do estoque filtrando pelo tipo do material.
  Necessário que a tabela `materiais` tenha a coluna `tipo`.
*/
$sql = "SELECT m.nome, e.quantidade
        FROM estoque e
        JOIN materiais m ON e.material_id = m.id
        WHERE m.tipo = ?
        ORDER BY m.nome ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $tipo);
$stmt->execute();
$result = $stmt->get_result();

$dados = [];
while ($row = $result->fetch_assoc()) {
    $dados[] = $row;
}

echo json_encode($dados, JSON_UNESCAPED_UNICODE);
$stmt->close();
$conn->close();
