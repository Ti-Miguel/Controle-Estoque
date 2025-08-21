<?php
include 'conexao.php';

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=materiais.csv');

$output = fopen('php://output', 'w');
fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF)); // BOM UTF-8

// Cabeçalho
fputcsv($output, ['Nome', 'Tipo'], ';');

// Dados
$sql = "SELECT nome, tipo FROM materiais ORDER BY nome ASC";
$res = $conn->query($sql);

while ($row = $res->fetch_assoc()) {
    fputcsv($output, [$row['nome'], $row['tipo']], ';');
}

fclose($output);
$conn->close();
