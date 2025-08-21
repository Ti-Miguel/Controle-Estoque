<?php
include 'conexao.php';

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=historico.csv');

$output = fopen('php://output', 'w');
fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF)); // BOM UTF-8

// Cabeçalho
fputcsv($output, ['Tipo', 'Material', 'Data', 'Quantidade', 'Detalhes'], ';');

// Dados
$sql = "SELECT tipo, material, data, quantidade, detalhes
        FROM historico
        ORDER BY id DESC";
$res = $conn->query($sql);

while ($row = $res->fetch_assoc()) {
    fputcsv($output, [
        $row['tipo'],
        $row['material'],
        $row['data'],
        $row['quantidade'],
        $row['detalhes']
    ], ';');
}

fclose($output);
$conn->close();
