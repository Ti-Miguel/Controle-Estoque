<?php
include 'conexao.php';

$sql = "SELECT id, nome, tipo FROM materiais ORDER BY nome ASC";
$result = $conn->query($sql);

$dados = [];
while ($row = $result->fetch_assoc()) {
  // força tipos corretos
  $row['id'] = (int)$row['id'];
  $dados[] = $row;
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($dados, JSON_UNESCAPED_UNICODE);
$conn->close();
