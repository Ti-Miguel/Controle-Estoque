<?php
include 'conexao.php';

$sql = "SELECT m.nome, m.tipo, e.quantidade
        FROM estoque e
        JOIN materiais m ON e.material_id = m.id
        ORDER BY m.tipo ASC, m.nome ASC";

$result = $conn->query($sql);
$dados = [];

while ($row = $result->fetch_assoc()) {
    $dados[] = $row;
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($dados);
$conn->close();
