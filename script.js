/****************************************************
 * CONTROLE DE ESTOQUE - script.js (ID safe)
 * - Editar/Excluir materiais via ID
 * - Dashboard
 * - Histórico colorido
 * - Relatórios
 ****************************************************/

/***********************
 * SELECTS DE MATERIAIS
 ***********************/
function atualizarSelectsMateriais() {
  fetch('listar_estoque.php')
    .then(res => res.json())
    .then(dados => {
      const selectEntrada = document.getElementById('materialEntrada');
      const selectSaida   = document.getElementById('materialSaida');
      if (!selectEntrada || !selectSaida) return;

      selectEntrada.innerHTML = '';
      selectSaida.innerHTML   = '';

      dados.forEach(item => {
        const opt1 = document.createElement('option');
        opt1.value = item.nome;
        opt1.textContent = item.nome;

        const opt2 = document.createElement('option');
        opt2.value = item.nome;
        opt2.textContent = item.nome;

        selectEntrada.appendChild(opt1);
        selectSaida.appendChild(opt2);
      });
    })
    .catch(() => {});
}

/***********************
 * NAVEGAÇÃO ENTRE TELAS
 ***********************/
function mostrarTela(nomeTela) {
  // Inclui o dashboard na lista de telas
  const telas = ['dashboard', 'entrada', 'saida', 'relatorioEstoque', 'relatorioHistorico', 'materiais'];
  telas.forEach(tela => {
    const el = document.getElementById(tela);
    if (el) el.style.display = (tela === nomeTela) ? 'block' : 'none';
  });

  // Carregamento sob demanda
  if (nomeTela === 'relatorioEstoque' && typeof atualizarRelatorioEstoque === 'function') {
    atualizarRelatorioEstoque();
  }
  if (nomeTela === 'relatorioHistorico' && typeof atualizarRelatorioHistorico === 'function') {
    atualizarRelatorioHistorico();
  }
  if (nomeTela === 'materiais' && typeof atualizarListaMateriais === 'function') {
    atualizarListaMateriais();
  }
  if (nomeTela === 'dashboard' && typeof atualizarDashboard === 'function') {
    atualizarDashboard();
  }
}

/***********************
 * GERENCIAR MATERIAIS (com ID)
 ***********************/
function adicionarMaterial() {
  const nome = (document.getElementById('novoMaterial')?.value || '').trim();
  const tipo = document.getElementById('tipoMaterial')?.value;

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
    const campo = document.getElementById('novoMaterial');
    if (campo) campo.value = '';
  })
  .catch(() => alert('Erro ao adicionar material.'));
}

function atualizarListaMateriais() {
  fetch('listar_materiais.php') // deve retornar id, nome, tipo
    .then(res => res.json())
    .then(materiais => {
      const div = document.getElementById('listaMateriais');
      if (!div) return;
      div.innerHTML = '';

      const wrap = document.createElement('div');
      wrap.className = 'table-responsive';

      const table = document.createElement('table');
      table.className = 'tabela-materiais';
      table.innerHTML = `
        <thead>
          <tr>
            <th style="width:10%">ID</th>
            <th style="width:45%">Nome</th>
            <th style="width:25%">Tipo</th>
            <th style="width:20%">Ações</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      const tbody = table.querySelector('tbody');

      if (!materiais || materiais.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="4">Nenhum material cadastrado.</td>`;
        tbody.appendChild(tr);
      } else {
        materiais.forEach(m => {
          const tr = document.createElement('tr');

          const tdId   = document.createElement('td');
          tdId.textContent = m.id;

          const tdNome = document.createElement('td');
          tdNome.innerHTML = `<span class="nome-material">${m.nome}</span>`;

          const tdTipo = document.createElement('td');
          tdTipo.innerHTML = `<span class="tipo-material">${m.tipo}</span>`;

          const tdAcoes = document.createElement('td');

          const btnEditar = document.createElement('button');
          btnEditar.className = 'btn-acao btn-editar';
          btnEditar.textContent = 'Editar';
          btnEditar.onclick = () => entrarModoEdicao(tr, m);

          const btnExcluir = document.createElement('button');
          btnExcluir.className = 'btn-acao btn-excluir';
          btnExcluir.textContent = 'Excluir';
          btnExcluir.onclick = () => excluirMaterial(m.id, m.nome);

          tdAcoes.appendChild(btnEditar);
          tdAcoes.appendChild(btnExcluir);

          tr.appendChild(tdId);
          tr.appendChild(tdNome);
          tr.appendChild(tdTipo);
          tr.appendChild(tdAcoes);
          tbody.appendChild(tr);
        });
      }

      wrap.appendChild(table);
      div.appendChild(wrap);
    })
    .catch(() => {
      const div = document.getElementById('listaMateriais');
      if (div) div.textContent = 'Erro ao carregar materiais.';
    });
}

function entrarModoEdicao(tr, material) {
  const [tdId, tdNome, tdTipo, tdAcoes] = tr.children;

  const inputNome = document.createElement('input');
  inputNome.className = 'input-editar';
  inputNome.type = 'text';
  inputNome.value = material.nome;

  const selectTipo = document.createElement('select');
  selectTipo.className = 'input-editar';
  ['MATERIAL GRÁFICO', 'MATERIAL MÉDICO', 'MEDICAÇÕES'].forEach(op => {
    const o = document.createElement('option');
    o.value = op;
    o.textContent = op;
    if (op === material.tipo) o.selected = true;
    selectTipo.appendChild(o);
  });

  tdNome.innerHTML = '';
  tdTipo.innerHTML = '';
  tdNome.appendChild(inputNome);
  tdTipo.appendChild(selectTipo);

  tdAcoes.innerHTML = '';
  const btnSalvar = document.createElement('button');
  btnSalvar.className = 'btn-acao btn-salvar';
  btnSalvar.textContent = 'Salvar';
  btnSalvar.onclick = () => salvarEdicao(material.id, inputNome.value.trim(), selectTipo.value);

  const btnCancelar = document.createElement('button');
  btnCancelar.className = 'btn-acao btn-cancelar';
  btnCancelar.textContent = 'Cancelar';
  btnCancelar.onclick = () => atualizarListaMateriais();

  tdAcoes.appendChild(btnSalvar);
  tdAcoes.appendChild(btnCancelar);
}

function salvarEdicao(id, novoNome, novoTipo) {
  if (!novoNome) return alert('Informe o nome do material.');
  fetch('editar_material.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `id=${encodeURIComponent(id)}&novo_nome=${encodeURIComponent(novoNome)}&novo_tipo=${encodeURIComponent(novoTipo)}`
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
    atualizarSelectsMateriais();
    atualizarListaMateriais();
  })
  .catch(() => alert('Erro ao salvar edição.'));
}

function excluirMaterial(id, nome) {
  if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;
  fetch('excluir_material.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `id=${encodeURIComponent(id)}`
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
    atualizarSelectsMateriais();
    atualizarListaMateriais();
  })
  .catch(() => alert('Erro ao excluir material.'));
}

/***********************
 * ENTRADA / SAÍDA
 ***********************/
function registrarEntrada() {
  const material   = document.getElementById('materialEntrada')?.value;
  const data       = document.getElementById('dataEntrada')?.value;
  const quantidade = parseInt(document.getElementById('quantidadeEntrada')?.value, 10);
  const tipo       = document.getElementById('tipoEntrada')?.value;

  if (!material || !data || isNaN(quantidade) || quantidade <= 0) {
    alert('Preencha todos os campos corretamente.');
    return;
  }

  fetch('registrar_entrada.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `material=${encodeURIComponent(material)}&data=${encodeURIComponent(data)}&quantidade=${quantidade}&tipo=${encodeURIComponent(tipo)}`
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
    atualizarRelatorioEstoque();
    atualizarRelatorioHistorico();
    const q = document.getElementById('quantidadeEntrada');
    const d = document.getElementById('dataEntrada');
    if (q) q.value = '';
    if (d) d.value = '';
  })
  .catch(() => alert('Erro ao registrar entrada.'));
}

function registrarSaida() {
  const material   = document.getElementById('materialSaida')?.value;
  const data       = document.getElementById('dataSaida')?.value;
  const quantidade = parseInt(document.getElementById('quantidadeSaida')?.value, 10);
  const responsavel = (document.getElementById('responsavelSaida')?.value || '').trim();

  if (!material || !data || isNaN(quantidade) || quantidade <= 0 || !responsavel) {
    alert('Preencha todos os campos corretamente.');
    return;
  }

  fetch('registrar_saida.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `material=${encodeURIComponent(material)}&data=${encodeURIComponent(data)}&quantidade=${quantidade}&responsavel=${encodeURIComponent(responsavel)}`
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
    atualizarRelatorioEstoque();
    atualizarRelatorioHistorico();
    const q = document.getElementById('quantidadeSaida');
    const d = document.getElementById('dataSaida');
    const r = document.getElementById('responsavelSaida');
    if (q) q.value = '';
    if (d) d.value = '';
    if (r) r.value = '';
  })
  .catch(() => alert('Erro ao registrar saída.'));
}

/***********************
 * RELATÓRIO DE ESTOQUE (tabela geral oculta por padrão)
 ***********************/
function atualizarRelatorioEstoque() {
  const tabela = document.getElementById('tabelaEstoque');
  if (!tabela) return;

  // limpa linhas (mantém header)
  tabela.querySelectorAll('tr:not(:first-child)').forEach(tr => tr.remove());

  fetch('listar_estoque.php')
    .then(res => res.json())
    .then(dados => {
      if (!dados || dados.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="2">Nenhum material em estoque.</td>`;
        tabela.appendChild(tr);
        return;
      }

      dados.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${item.nome}</td><td>${item.quantidade}</td>`;
        tabela.appendChild(tr);
      });
    })
    .catch(() => {});
}

/***********************
 * HISTÓRICO (com coloração de linhas)
 ***********************/
function atualizarRelatorioHistorico() {
  const tabela = document.getElementById('tabelaHistorico');
  if (!tabela) return;

  // limpa linhas (mantém header)
  tabela.querySelectorAll('tr:not(:first-child)').forEach(tr => tr.remove());

  fetch('listar_historico.php')
    .then(res => res.json())
    .then(historico => {
      if (!historico || historico.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="5">Nenhuma movimentação registrada.</td>`;
        tabela.appendChild(tr);
        return;
      }

      historico.forEach(reg => {
        const tr = document.createElement('tr');

        if (reg.tipo === 'Entrada') tr.classList.add('linha-entrada'); // verde claro (CSS)
        else if (reg.tipo === 'Saída') tr.classList.add('linha-saida'); // vermelho claro (CSS)

        ['tipo', 'material', 'data', 'quantidade', 'detalhes'].forEach(campo => {
          const td = document.createElement('td');
          td.textContent = reg[campo];
          tr.appendChild(td);
        });
        tabela.appendChild(tr);
      });
    })
    .catch(() => {});
}

/***********************
 * DASHBOARD
 ***********************/
function atualizarDashboard() {
  // 1) Materiais cadastrados
  fetch('listar_materiais.php')
    .then(r => r.json())
    .then(mats => {
      const el = document.getElementById('cardMateriais');
      if (el) el.textContent = mats?.length ?? 0;
    })
    .catch(() => {
      const el = document.getElementById('cardMateriais');
      if (el) el.textContent = '—';
    });

  // 2) Estoque total + baixo estoque
  fetch('listar_estoque.php')
    .then(r => r.json())
    .then(estoque => {
      const total = (estoque || []).reduce((acc, it) => acc + (Number(it.quantidade) || 0), 0);
      const card = document.getElementById('cardEstoque');
      if (card) card.textContent = total;

      const LIMITE = 5;
      const baixo = (estoque || [])
        .filter(it => (Number(it.quantidade) || 0) <= LIMITE)
        .sort((a, b) => (a.quantidade || 0) - (b.quantidade || 0))
        .slice(0, 8);

      const tabela = document.getElementById('tabelaBaixoEstoque');
      if (tabela) {
        tabela.querySelectorAll('tr:not(:first-child)').forEach(tr => tr.remove());
        if (baixo.length === 0) {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td colspan="2">Sem itens em baixo estoque.</td>`;
          tabela.appendChild(tr);
        } else {
          baixo.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${item.nome}</td><td>${item.quantidade}</td>`;
            tabela.appendChild(tr);
          });
        }
      }
    })
    .catch(() => {
      const card = document.getElementById('cardEstoque');
      if (card) card.textContent = '—';
    });

  // 3) Entradas/Saídas do mês + últimas 5 movimentações
  fetch('listar_historico.php')
    .then(r => r.json())
    .then(hist => {
      const agora = new Date();
      const mes = agora.getMonth();   // 0..11
      const ano = agora.getFullYear();

      let entradasMes = 0, saidasMes = 0;

      // últimas 5
      const tabelaUlt = document.getElementById('tabelaUltimasMov');
      if (tabelaUlt) {
        tabelaUlt.querySelectorAll('tr:not(:first-child)').forEach(tr => tr.remove());
        (hist || []).slice(0, 5).forEach(reg => {
          const tr = document.createElement('tr');
          if (reg.tipo === 'Entrada') tr.classList.add('linha-entrada');
          else if (reg.tipo === 'Saída') tr.classList.add('linha-saida');
          tr.innerHTML = `
            <td>${reg.tipo}</td>
            <td>${reg.material}</td>
            <td>${reg.data}</td>
            <td>${reg.quantidade}</td>
          `;
          tabelaUlt.appendChild(tr);
        });
      }

      (hist || []).forEach(reg => {
        const [y, m] = (reg.data || '').split('-').map(n => parseInt(n, 10));
        if (!isNaN(y) && !isNaN(m) && y === ano && (m - 1) === mes) {
          const qtd = Number(reg.quantidade) || 0;
          if (reg.tipo === 'Entrada') entradasMes += qtd;
          else if (reg.tipo === 'Saída') saidasMes += qtd;
        }
      });

      const ce = document.getElementById('cardEntradasMes');
      const cs = document.getElementById('cardSaidasMes');
      if (ce) ce.textContent = entradasMes;
      if (cs) cs.textContent = saidasMes;
    })
    .catch(() => {
      const ce = document.getElementById('cardEntradasMes');
      const cs = document.getElementById('cardSaidasMes');
      if (ce) ce.textContent = '—';
      if (cs) cs.textContent = '—';
    });
}

/***********************
 * INICIALIZAÇÃO
 ***********************/
document.addEventListener('DOMContentLoaded', () => {
  atualizarSelectsMateriais();
  // quem define a tela inicial é o index.html (dashboard),
  // mas se quiser garantir aqui também, descomente:
  // mostrarTela('dashboard');
});
