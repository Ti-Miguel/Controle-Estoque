<?php
include 'conexao.php';

$id = intval($_POST['id'] ?? 0);
if ($id <= 0) {
    die("ID inválido.");
}

// Verifica se há quantidade em estoque para o material:
$temEstoque = $conn->query("SELECT quantidade FROM estoque WHERE material_id = $id");
if ($temEstoque && $temEstoque->num_rows > 0) {
    $row = $temEstoque->fetch_assoc();
    if (intval($row['quantidade']) > 0) {
        die("Não é possível excluir: o material possui quantidade em estoque.");
    }
}

// Exclui do estoque (linha “vazia”, normalmente quantidade 0)
$conn->query("DELETE FROM estoque WHERE material_id = $id");

// Exclui o material
if ($conn->query("DELETE FROM materiais WHERE id = $id")) {
    echo "Material excluído com sucesso!";
} else {
    echo "Erro ao excluir material: " . $conn->error;
}

$conn->close();
