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

// No carregamento da página, só chama atualizarListaMateriais() quando mostrar a tela de Materiais
function mostrarTela(nomeTela) {
  const telas = ['entrada', 'saida', 'relatorioEstoque', 'relatorioHistorico', 'materiais'];
  telas.forEach(tela => {
    document.getElementById(tela).style.display = (tela === nomeTela) ? 'block' : 'none';
  });

  if (nomeTela === 'relatorioEstoque') atualizarRelatorioEstoque();
  if (nomeTela === 'relatorioHistorico') atualizarRelatorioHistorico();
  if (nomeTela === 'materiais') atualizarListaMateriais(); // <<< aqui atualiza só o gerenciador
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

// === Gerenciar Materiais: LISTAR com AÇÕES ===
function atualizarListaMateriais() {
  fetch('listar_materiais.php')
    .then(res => res.json())
    .then(materiais => {
      const divLista = document.getElementById('listaMateriais');
      divLista.innerHTML = '';

      if (!materiais || materiais.length === 0) {
        divLista.textContent = 'Nenhum material cadastrado.';
        return;
      }

      const table = document.createElement('table');
      table.className = 'tabela-materiais';
      table.innerHTML = `
        <tr>
          <th style="width:50%;">Material</th>
          <th style="width:25%;">Tipo</th>
          <th style="width:25%;">Ações</th>
        </tr>
      `;

      materiais.forEach(m => {
        const tr = document.createElement('tr');
        tr.dataset.id = m.id;

        const tdNome = document.createElement('td');
        tdNome.innerHTML = `<span class="nome-material">${m.nome}</span>`;
        const tdTipo = document.createElement('td');
        tdTipo.innerHTML = `<span class="tipo-material">${m.tipo}</span>`;
        const tdAcoes = document.createElement('td');
        tdAcoes.innerHTML = `
          <button class="btn-acao btn-editar" onclick="editarMaterial(${m.id})">Editar</button>
          <button class="btn-acao btn-excluir" onclick="excluirMaterial(${m.id})">Excluir</button>
        `;

        tr.appendChild(tdNome);
        tr.appendChild(tdTipo);
        tr.appendChild(tdAcoes);
        table.appendChild(tr);
      });

      divLista.appendChild(table);
    })
    .catch(() => {
      const divLista = document.getElementById('listaMateriais');
      divLista.textContent = 'Erro ao carregar materiais.';
    });
}

function editarMaterial(id) {
  const tr = document.querySelector(`tr[data-id="${id}"]`);
  if (!tr) return;

  const nomeSpan = tr.querySelector('.nome-material');
  const tipoSpan = tr.querySelector('.tipo-material');

  const nomeAtual = nomeSpan.textContent;
  const tipoAtual = tipoSpan.textContent;

  tr.dataset.editing = '1';

  // Inputs
  nomeSpan.outerHTML = `<input type="text" class="input-editar nome-edit" value="${nomeAtual}">`;
  tipoSpan.outerHTML = `
    <select class="input-editar tipo-edit">
      <option value="MATERIAL GRÁFICO" ${tipoAtual === 'MATERIAL GRÁFICO' ? 'selected' : ''}>MATERIAL GRÁFICO</option>
      <option value="MATERIAL MÉDICO" ${tipoAtual === 'MATERIAL MÉDICO' ? 'selected' : ''}>MATERIAL MÉDICO</option>
      <option value="MEDICAÇÕES" ${tipoAtual === 'MEDICAÇÕES' ? 'selected' : ''}>MEDICAÇÕES</option>
    </select>`;

  // Botões
  const tdAcoes = tr.children[2];
  tdAcoes.innerHTML = `
    <button class="btn-acao btn-salvar" onclick="salvarEdicao(${id})">Salvar</button>
    <button class="btn-acao btn-cancelar" onclick="cancelarEdicao(${id}, '${nomeAtual.replace(/'/g,"\\'")}', '${tipoAtual.replace(/'/g,"\\'")}')">Cancelar</button>
  `;
}

function cancelarEdicao(id, nomeOriginal, tipoOriginal) {
  const tr = document.querySelector(`tr[data-id="${id}"]`);
  if (!tr) return;

  tr.children[0].innerHTML = `<span class="nome-material">${nomeOriginal}</span>`;
  tr.children[1].innerHTML = `<span class="tipo-material">${tipoOriginal}</span>`;
  tr.children[2].innerHTML = `
    <button class="btn-acao btn-editar" onclick="editarMaterial(${id})">Editar</button>
    <button class="btn-acao btn-excluir" onclick="excluirMaterial(${id})">Excluir</button>
  `;
  delete tr.dataset.editing;
}

function salvarEdicao(id) {
  const tr = document.querySelector(`tr[data-id="${id}"]`);
  if (!tr) return;

  const nome = tr.querySelector('.nome-edit').value.trim();
  const tipo = tr.querySelector('.tipo-edit').value;

  if (!nome) {
    alert('Informe o nome do material.');
    return;
  }

  fetch('atualizar_material.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `id=${id}&nome=${encodeURIComponent(nome)}&tipo=${encodeURIComponent(tipo)}`
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
    atualizarListaMateriais();
    atualizarSelectsMateriais();
  })
  .catch(() => alert('Erro ao atualizar material.'));
}

function excluirMaterial(id) {
  if (!confirm('Tem certeza que deseja excluir este material?')) return;

  fetch('excluir_material.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `id=${id}`
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
    atualizarListaMateriais();
    atualizarSelectsMateriais();
    atualizarRelatorioEstoque();
  })
  .catch(() => alert('Erro ao excluir material.'));
}

// === Relatórios e movimentações ===
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
  // Limpa tudo, mantendo o cabeçalho original
  tabela.querySelectorAll('tr:not(:first-child)').forEach(tr => tr.remove());

  fetch('listar_estoque.php')
    .then(res => res.json())
    .then(dados => {
      if (!dados || dados.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 2;
        td.textContent = 'Nenhum material em estoque.';
        tr.appendChild(td);
        tabela.appendChild(tr);
        return;
      }

      let tipoAtual = null;
      // Opcional: subtotal por categoria
      let subtotalCategoria = 0;

      dados.forEach((item, idx) => {
        // Quando muda a categoria, cria cabeçalho do grupo
        if (item.tipo !== tipoAtual) {
          // Se não é a primeira categoria e quiser mostrar subtotal
          if (tipoAtual !== null) {
            const trSub = document.createElement('tr');
            trSub.className = 'grupo-subtotal';
            trSub.innerHTML = `<td>Subtotal ${tipoAtual}</td><td>${subtotalCategoria}</td>`;
            tabela.appendChild(trSub);
            subtotalCategoria = 0;
          }

          tipoAtual = item.tipo;
          const trGrupo = document.createElement('tr');
          trGrupo.className = 'grupo-cabecalho';
          const tdGrupo = document.createElement('td');
          tdGrupo.colSpan = 2;
          tdGrupo.textContent = tipoAtual;
          trGrupo.appendChild(tdGrupo);
          tabela.appendChild(trGrupo);
        }

        // Linha do item
        const tr = document.createElement('tr');
        const tdNome = document.createElement('td');
        const tdQtd = document.createElement('td');
        tdNome.textContent = item.nome;
        tdQtd.textContent = item.quantidade;
        tr.appendChild(tdNome);
        tr.appendChild(tdQtd);
        tabela.appendChild(tr);

        subtotalCategoria += Number(item.quantidade) || 0;

        // Último item: fecha com subtotal
        if (idx === dados.length - 1) {
          const trSub = document.createElement('tr');
          trSub.className = 'grupo-subtotal';
          trSub.innerHTML = `<td>Subtotal ${tipoAtual}</td><td>${subtotalCategoria}</td>`;
          tabela.appendChild(trSub);
        }
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

      // Aplica classe pela movimentação
      if (reg.tipo === 'Entrada') {
        tr.classList.add('linha-entrada');
      } else if (reg.tipo === 'Saída') {
        tr.classList.add('linha-saida');
      }
    
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
