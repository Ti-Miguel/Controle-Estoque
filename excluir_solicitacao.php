<?php
include 'conexao.php';
header('Content-Type: application/json; charset=utf-8');

$id = (int)($_POST['id'] ?? 0);
if ($id <= 0) {
  http_response_code(400);
  echo json_encode(['ok'=>false,'erro'=>'ID inválido']);
  exit;
}

$stmt = $conn->prepare("DELETE FROM solicitacoes WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
  echo json_encode(['ok'=>true]);
} else {
  http_response_code(500);
  echo json_encode(['ok'=>false,'erro'=>$conn->error]);
}

$stmt->close();
$conn->close();
