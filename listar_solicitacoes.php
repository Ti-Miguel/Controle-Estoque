<?php
include 'conexao.php';
header('Content-Type: application/json; charset=utf-8');

$sql = "SELECT id, nome_material, categoria, quantidade, motivo, status, prazo, criado_em, atualizado_em
        FROM solicitacoes
        ORDER BY id DESC";
$res = $conn->query($sql);
$dados = [];
while ($row = $res->fetch_assoc()) {
  $row['id'] = (int)$row['id'];
  $row['quantidade'] = (int)$row['quantidade'];
  $dados[] = $row;
}
echo json_encode($dados, JSON_UNESCAPED_UNICODE);
$conn->close();
