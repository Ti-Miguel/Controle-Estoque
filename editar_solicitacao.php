<?php
include 'conexao.php';
header('Content-Type: application/json; charset=utf-8');

$id         = (int)($_POST['id'] ?? 0);
$quantidade = isset($_POST['quantidade']) ? (int)$_POST['quantidade'] : null;
$motivo     = trim($_POST['motivo'] ?? '');
$prazo      = trim($_POST['prazo'] ?? ''); // yyyy-mm-dd ou vazio

if ($id <= 0 || $quantidade === null || $quantidade <= 0) {
  http_response_code(400);
  echo json_encode(['ok'=>false,'erro'=>'Parâmetros inválidos.']);
  exit;
}

$stmt = $conn->prepare("UPDATE solicitacoes SET quantidade = ?, motivo = ?, prazo = NULLIF(?,''), atualizado_em = NOW() WHERE id = ?");
$stmt->bind_param("issi", $quantidade, $motivo, $prazo, $id);

if ($stmt->execute()) {
  echo json_encode(['ok'=>true]);
} else {
  http_response_code(500);
  echo json_encode(['ok'=>false,'erro'=>$conn->error]);
}

$stmt->close();
$conn->close();
