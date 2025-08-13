<?php
include 'conexao.php';

$nome = $_POST['nome'] ?? '';
$tipo = $_POST['tipo'] ?? '';

if (empty($nome) || empty($tipo)) {
    die("Dados incompletos.");
}

// Insere na tabela materiais
$sql = "INSERT INTO materiais (nome, tipo) VALUES (?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $nome, $tipo);

if ($stmt->execute()) {
    // Insere também no estoque com quantidade 0
    $material_id = $stmt->insert_id;
    $conn->query("INSERT INTO estoque (material_id, quantidade) VALUES ($material_id, 0)");
    echo "Material adicionado com sucesso!";
} else {
    echo "Erro ao adicionar material: " . $conn->error;
}

$stmt->close();
$conn->close();
?>
