<?php
include 'conexao.php';

$id   = intval($_POST['id'] ?? 0);
$nome = $_POST['nome'] ?? '';
$tipo = $_POST['tipo'] ?? '';

if ($id <= 0 || empty($nome) || empty($tipo)) {
    die("Dados incompletos.");
}

$stmt = $conn->prepare("UPDATE materiais SET nome = ?, tipo = ? WHERE id = ?");
$stmt->bind_param("ssi", $nome, $tipo, $id);

if ($stmt->execute()) {
    echo "Material atualizado com sucesso!";
} else {
    echo "Erro ao atualizar material: " . $conn->error;
}

$stmt->close();
$conn->close();
