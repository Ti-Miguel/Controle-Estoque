<?php
include 'conexao.php';

$id        = isset($_POST['id']) ? (int)$_POST['id'] : 0;
$novo_nome = trim($_POST['novo_nome'] ?? '');
$novo_tipo = trim($_POST['novo_tipo'] ?? '');

if ($id <= 0 || $novo_nome === '' || $novo_tipo === '') {
  http_response_code(400);
  exit('Parâmetros inválidos.');
}

// (opcional) verificar duplicidade de nome
$chk = $conn->prepare("SELECT COUNT(*) FROM materiais WHERE nome = ? AND id <> ?");
$chk->bind_param("si", $novo_nome, $id);
$chk->execute();
$chk->bind_result($qt);
$chk->fetch();
$chk->close();
if ($qt > 0) {
  http_response_code(409);
  exit('Já existe um material com esse nome.');
}

$stmt = $conn->prepare("UPDATE materiais SET nome = ?, tipo = ? WHERE id = ?");
$stmt->bind_param("ssi", $novo_nome, $novo_tipo, $id);

if ($stmt->execute()) {
  echo "Material atualizado com sucesso!";
} else {
  http_response_code(500);
  echo "Erro ao atualizar material: " . $conn->error;
}

$stmt->close();
$conn->close();
