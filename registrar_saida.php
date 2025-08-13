<?php
include 'conexao.php';

$material = $_POST['material'] ?? '';
$data = $_POST['data'] ?? '';
$quantidade = intval($_POST['quantidade'] ?? 0);
$responsavel = $_POST['responsavel'] ?? '';

if (empty($material) || empty($data) || $quantidade <= 0 || empty($responsavel)) {
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

// Verifica estoque
$result = $conn->query("SELECT quantidade FROM estoque WHERE material_id = $material_id");
$row = $result->fetch_assoc();
if ($row['quantidade'] < $quantidade) {
    die("Estoque insuficiente.");
}

// Atualiza estoque
$conn->query("UPDATE estoque SET quantidade = quantidade - $quantidade WHERE material_id = $material_id");

// Registra no histórico
$stmt = $conn->prepare("INSERT INTO historico (tipo, material, data, quantidade, detalhes) VALUES ('Saída', ?, ?, ?, ?)");
$detalhes = "Responsável: $responsavel";
$stmt->bind_param("ssis", $material, $data, $quantidade, $detalhes);
$stmt->execute();

echo "Saída registrada com sucesso!";
$conn->close();
?>
