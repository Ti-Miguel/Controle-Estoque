<?php
include 'conexao.php';
include 'whatsapp_config.php';

$nome_material = trim($_POST['nome_material'] ?? '');
$categoria     = trim($_POST['categoria'] ?? '');
$quantidade    = (int)($_POST['quantidade'] ?? 1);
$motivo        = trim($_POST['motivo'] ?? '');
$prazo         = trim($_POST['prazo'] ?? '');
$status        = 'PEDIDO SOLICITADO';

header('Content-Type: application/json; charset=utf-8');

if ($nome_material === '' || $categoria === '' || $motivo === '') {
  http_response_code(400);
  echo json_encode(['ok'=>false,'erro'=>'Campos obrigatórios ausentes.']);
  exit;
}
if ($quantidade <= 0) $quantidade = 1;

$stmt = $conn->prepare("INSERT INTO solicitacoes (nome_material, categoria, quantidade, motivo, status, prazo) VALUES (?, ?, ?, ?, ?, NULLIF(?,''))");
$stmt->bind_param("ssisss", $nome_material, $categoria, $quantidade, $motivo, $status, $prazo);

if ($stmt->execute()) {
  $id = $stmt->insert_id;
  echo json_encode(['ok'=>true,'id'=>$id]);

  $msg = "🧾 *Nova Solicitação de Compra*\n"
       . "• Material: {$nome_material}\n"
       . "• Categoria: {$categoria}\n"
       . "• Quantidade: {$quantidade}\n"
       . "• Motivo: {$motivo}\n"
       . "• Status: {$status}\n"
       . ($prazo ? "• Prazo: {$prazo}\n" : "")
       . "ID: #{$id}";
  notificar_whatsapp_grupo($msg);

} else {
  http_response_code(500);
  echo json_encode(['ok'=>false,'erro'=>$conn->error]);
}

$stmt->close();
$conn->close();
