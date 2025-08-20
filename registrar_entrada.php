<?php
include 'conexao.php';

$material = $_POST['material'] ?? '';
$data = $_POST['data'] ?? '';
$quantidade = intval($_POST['quantidade'] ?? 0);
$tipo = $_POST['tipo'] ?? '';

if (empty($material) || empty($data) || $quantidade <= 0) {
    die("Dados incompletos.");
}

// Busca o ID do material
$stmt = $conn->prepare("SELECT id FROM materiais WHERE nome = ?");
$stmt->bind_param("s", $material);
$stmt->execute();
$stmt->bind_result($material_id);
$stmt->fetch();
$stmt->close();

if (!$material_id) {
    die("Material não encontrado.");
}

// Atualiza estoque
$conn->query("UPDATE estoque SET quantidade = quantidade + $quantidade WHERE material_id = $material_id");

// Registra no histórico
$stmt = $conn->prepare("INSERT INTO historico (tipo, material, data, quantidade, detalhes) VALUES ('Entrada', ?, ?, ?, ?)");
$detalhes = "Tipo: $tipo";
$stmt->bind_param("ssis", $material, $data, $quantidade, $detalhes);
$stmt->execute();

echo "Entrada registrada com sucesso!";
$conn->close();
