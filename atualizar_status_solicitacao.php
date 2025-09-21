<?php
include 'conexao.php';
include 'whatsapp_config.php';

$id     = (int)($_POST['id'] ?? 0);
$status = trim($_POST['status'] ?? '');
$prazo  = trim($_POST['prazo'] ?? ''); // permitir ajuste de prazo junto

header('Content-Type: application/json; charset=utf-8');

$validos = ['PEDIDO SOLICITADO','SOLICITADO AO FORNECEDOR','CHEGOU'];
if ($id <= 0 || !in_array($status, $validos, true)) {
  http_response_code(400);
  echo json_encode(['ok'=>false,'erro'=>'Parâmetros inválidos.']);
  exit;
}

$stmt = $conn->prepare("UPDATE solicitacoes SET status = ?, prazo = NULLIF(?,''), atualizado_em = NOW() WHERE id = ?");
$stmt->bind_param("ssi", $status, $prazo, $id);
$ok = $stmt->execute();

if ($ok && $stmt->affected_rows >= 0) {
  echo json_encode(['ok'=>true]);

  // Buscar info para montar notificação legível
  $info = $conn->query("SELECT nome_material, categoria FROM solicitacoes WHERE id = {$id}")->fetch_assoc();
  $nome = $info['nome_material'] ?? '';
  $cat  = $info['categoria'] ?? '';
  $msg = "🔔 *Atualização de Solicitação*\n"
       . "ID: #{$id}\n"
       . "• Material: {$nome}\n"
       . "• Categoria: {$cat}\n"
       . "• Novo status: {$status}\n"
       . ($prazo ? "• Prazo: {$prazo}\n" : "");
  notificar_whatsapp_grupo($msg);

} else {
  http_response_code(500);
  echo json_encode(['ok'=>false,'erro'=>$conn->error]);
}

$stmt->close();
$conn->close();
