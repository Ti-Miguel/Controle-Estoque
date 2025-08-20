<?php
include 'conexao.php';

// Se vier ?tipo=..., filtra; senão exporta tudo
$tipo = isset($_GET['tipo']) ? trim($_GET['tipo']) : '';

// Nome do arquivo
$nomeArquivo = 'estoque';
if ($tipo !== '') {
    $nomeArquivo .= '_' . preg_replace('/\s+/', '_', mb_strtolower($tipo));
}
$nomeArquivo .= '_' . date('Y-m-d_H-i-s') . '.csv';

// Cabeçalhos para forçar download
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="'.$nomeArquivo.'"');

// Abre o "arquivo" de saída
$saida = fopen('php://output', 'w');

// Cabeçalho das colunas
if ($tipo === '') {
    // Export geral: inclui a coluna Tipo
    fputcsv($saida, ['Material', 'Tipo', 'Quantidade'], ';');
    $sql = "SELECT m.nome, m.tipo, e.quantidade
            FROM estoque e
            JOIN materiais m ON e.material_id = m.id
            ORDER BY m.tipo ASC, m.nome ASC";
    $stmt = $conn->prepare($sql);
} else {
    // Export filtrado por tipo
    fputcsv($saida, ['Material', 'Quantidade'], ';');
    $sql = "SELECT m.nome, e.quantidade
            FROM estoque e
            JOIN materiais m ON e.material_id = m.id
            WHERE m.tipo = ?
            ORDER BY m.nome ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $tipo);
}

$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    if ($tipo === '') {
        fputcsv($saida, [$row['nome'], $row['tipo'], $row['quantidade']], ';');
    } else {
        fputcsv($saida, [$row['nome'], $row['quantidade']], ';');
    }
}

fclose($saida);
$stmt->close();
$conn->close();
exit;
