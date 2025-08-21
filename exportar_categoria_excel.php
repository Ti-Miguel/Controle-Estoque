<?php
include 'conexao.php';

// Força download como CSV (Excel abre normalmente)
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=estoque_categoria.csv');

$tipo = $_GET['tipo'] ?? '';
$tipo = trim($tipo);

$output = fopen('php://output', 'w');
// BOM UTF-8 para acentuação correta no Excel
fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

// Cabeçalho
fputcsv($output, ['Material', 'Quantidade'], ';');

if ($tipo !== '') {
    $sql = "SELECT m.nome, e.quantidade
            FROM estoque e
            JOIN materiais m ON e.material_id = m.id
            WHERE m.tipo = ?
            ORDER BY m.nome ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $tipo);
    $stmt->execute();
    $res = $stmt->get_result();

    while ($row = $res->fetch_assoc()) {
        fputcsv($output, [$row['nome'], $row['quantidade']], ';');
    }
    $stmt->close();
}

fclose($output);
$conn->close();
