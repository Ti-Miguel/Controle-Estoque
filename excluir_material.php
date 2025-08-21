<?php
include 'conexao.php';

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
if ($id <= 0) {
  http_response_code(400);
  exit('ID inválido.');
}

// Se houver FK, deletar estoque primeiro
$conn->begin_transaction();

try {
  // apaga do estoque
  $del1 = $conn->prepare("DELETE FROM estoque WHERE material_id = ?");
  $del1->bind_param("i", $id);
  $del1->execute();
  $del1->close();

  // apaga o material
  $del2 = $conn->prepare("DELETE FROM materiais WHERE id = ?");
  $del2->bind_param("i", $id);
  $del2->execute();
  $linhas = $del2->affected_rows;
  $del2->close();

  if ($linhas <= 0) {
    $conn->rollback();
    http_response_code(404);
    exit('Material não encontrado.');
  }

  $conn->commit();
  echo "Material excluído com sucesso!";
} catch (Exception $e) {
  $conn->rollback();
  http_response_code(500);
  echo "Erro ao excluir material: " . $e->getMessage();
}

$conn->close();
