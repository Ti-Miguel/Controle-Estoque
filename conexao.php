<?php
$host = "localhost"; // Hostinger usa localhost para banco interno
$usuario = "u380360322_estoque"; // seu usuário do banco
$senha = "Miguel847829"; // sua senha
$banco = "u380360322_estoque"; // nome do banco

$conn = new mysqli($host, $usuario, $senha, $banco);

if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}

$conn->set_charset("utf8");
