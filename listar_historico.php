<?php
include 'conexao.php';

$sql = "SELECT tipo, material, data, quantidade, detalhes
        FROM historico
        ORDER BY id DESC";

$result = $conn->query($sql);
$dados = [];

while ($row = $result->fetch_assoc()) {
    $dados[] = $row;
}

echo json_encode($dados);
$conn->close();
?>
