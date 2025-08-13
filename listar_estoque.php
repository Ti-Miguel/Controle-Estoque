<?php
include 'conexao.php';

$sql = "SELECT m.nome, e.quantidade
        FROM estoque e
        JOIN materiais m ON e.material_id = m.id
        ORDER BY m.nome ASC";

$result = $conn->query($sql);
$dados = [];

while ($row = $result->fetch_assoc()) {
    $dados[] = $row;
}

echo json_encode($dados);
$conn->close();
?>
