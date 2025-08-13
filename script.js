
// Atualiza os selects de material nos formulários
function atualizarSelectsMateriais() {
  fetch('listar_estoque.php')
    .then(res => res.json())
    .then(dados => {
      const selectEntrada = document.getElementById('materialEntrada');
      const selectSaida = document.getElementById('materialSaida');
      selectEntrada.innerHTML = '';
      selectSaida.innerHTML = '';

      dados.forEach(item => {
        const option1 = document.createElement('option');
        option1.value = item.nome;
        option1.textContent = item.nome;
        const option2 = document.createElement('option');
        option2.value = item.nome;
        option2.textContent = item.nome;
        selectEntrada.appendChild(option1);
        selectSaida.appendChild(option2);
      });
    });
}

function mostrarTela(nomeTela) {
  const telas = ['entrada', 'saida', 'relatorioEstoque', 'relatorioHistorico', 'materiais'];
  telas.forEach(tela => {
    document.getElementById(tela).style.display = (tela === nomeTela) ? 'block' : 'none';
  });
  if (nomeTela === 'relatorioEstoque') atualizarRelatorioEstoque();
  if (nomeTela === 'relatorioHistorico') atualizarRelatorioHistorico();
  if (nomeTela === 'materiais') atualizarListaMateriais();
}

function adicionarMaterial() {
  const nome = document.getElementById('novoMaterial').value.trim();
  const tipo = document.getElementById('tipoMaterial').value;

  if (!nome) return alert('Informe o nome do material.');

  fetch('adicionar_material.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `nome=${encodeURIComponent(nome)}&tipo=${encodeURIComponent(tipo)}`
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
    atualizarSelectsMateriais();
    atualizarListaMateriais();
    document.getElementById('novoMaterial').value = '';
  });
}

function atualizarListaMateriais() {
  fetch('listar_estoque.php')
    .then(res => res.json())
    .then(materiais => {
      const divLista = document.getElementById('listaMateriais');
      divLista.innerHTML = '';

      if (materiais.length === 0) {
        divLista.textContent = 'Nenhum material cadastrado.';
        return;
      }

      const ul = document.createElement('ul');
      materiais.forEach(m => {
        const li = document.createElement('li');
        li.textContent = `${m.nome} - Quantidade: ${m.quantidade}`;
        ul.appendChild(li);
      });
      divLista.appendChild(ul);
    });
}

function registrarEntrada() {
  const material = document.getElementById('materialEntrada').value;
  const data = document.getElementById('dataEntrada').value;
  const quantidade = parseInt(document.getElementById('quantidadeEntrada').value);
  const tipo = document.getElementById('tipoEntrada').value;

  if (!material || !data || isNaN(quantidade) || quantidade <= 0) {
    alert('Preencha todos os campos corretamente.');
    return;
  }

  fetch('registrar_entrada.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `material=${encodeURIComponent(material)}&data=${data}&quantidade=${quantidade}&tipo=${tipo}`
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
    atualizarRelatorioEstoque();
    atualizarRelatorioHistorico();
    document.getElementById('quantidadeEntrada').value = '';
    document.getElementById('dataEntrada').value = '';
  });
}

function registrarSaida() {
  const material = document.getElementById('materialSaida').value;
  const data = document.getElementById('dataSaida').value;
  const quantidade = parseInt(document.getElementById('quantidadeSaida').value);
  const responsavel = document.getElementById('responsavelSaida').value.trim();

  if (!material || !data || isNaN(quantidade) || quantidade <= 0 || !responsavel) {
    alert('Preencha todos os campos corretamente.');
    return;
  }

  fetch('registrar_saida.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `material=${encodeURIComponent(material)}&data=${data}&quantidade=${quantidade}&responsavel=${encodeURIComponent(responsavel)}`
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
    atualizarRelatorioEstoque();
    atualizarRelatorioHistorico();
    document.getElementById('quantidadeSaida').value = '';
    document.getElementById('dataSaida').value = '';
    document.getElementById('responsavelSaida').value = '';
  });
}

function atualizarRelatorioEstoque() {
  const tabela = document.getElementById('tabelaEstoque');
  tabela.querySelectorAll('tr:not(:first-child)').forEach(tr => tr.remove());

  fetch('listar_estoque.php')
    .then(res => res.json())
    .then(dados => {
      if (dados.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 2;
        td.textContent = 'Nenhum material em estoque.';
        tr.appendChild(td);
        tabela.appendChild(tr);
        return;
      }

      dados.forEach(item => {
        const tr = document.createElement('tr');
        const tdNome = document.createElement('td');
        const tdQtd = document.createElement('td');
        tdNome.textContent = item.nome;
        tdQtd.textContent = item.quantidade;
        tr.appendChild(tdNome);
        tr.appendChild(tdQtd);
        tabela.appendChild(tr);
      });
    });
}

function atualizarRelatorioHistorico() {
  const tabela = document.getElementById('tabelaHistorico');
  tabela.querySelectorAll('tr:not(:first-child)').forEach(tr => tr.remove());

  fetch('listar_historico.php')
    .then(res => res.json())
    .then(historico => {
      if (historico.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 5;
        td.textContent = 'Nenhuma movimentação registrada.';
        tr.appendChild(td);
        tabela.appendChild(tr);
        return;
      }

      historico.forEach(reg => {
        const tr = document.createElement('tr');
        ['tipo', 'material', 'data', 'quantidade', 'detalhes'].forEach(campo => {
          const td = document.createElement('td');
          td.textContent = reg[campo];
          tr.appendChild(td);
        });
        tabela.appendChild(tr);
      });
    });
}

document.addEventListener('DOMContentLoaded', () => {
  atualizarSelectsMateriais();
  mostrarTela('entrada');
});
