/***********************
 * SELECTS DE MATERIAIS
 ***********************/
function atualizarSelectsMateriais() {
  fetch('listar_estoque.php')
    .then(res => res.json())
    .then(dados => {
      const selectEntrada = document.getElementById('materialEntrada');
      const selectSaida = document.getElementById('materialSaida');
      if (!selectEntrada || !selectSaida) return;

      selectEntrada.innerHTML = '';
      selectSaida.innerHTML = '';

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
  // Inclui o dashboard aqui!
  const telas = ['dashboard', 'entrada', 'saida', 'relatorioEstoque', 'relatorioHistorico', 'materiais'];
  telas.forEach(t => {
    const el = document.getElementById(t);
    if (el) el.style.display = (t === nomeTela) ? 'block' : 'none';
  });

  // Carregamentos on-demand
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
 * GERENCIAR MATERIAIS
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
  fetch('listar_materiais.php')
    .then(res => res.json())
    .then(materiais => {
      const div = document.getElementById('listaMateriais');
      if (!div) return;
      div.innerHTML = '';

      // Wrapper com scroll em telas pequenas
      const wrap = document.createElement('div');
      wrap.className = 'table-responsive';

      const table = document.createElement('table');
      table.className = 'tabela-materiais';
      table.innerHTML = `
        <thead>
          <tr>
            <th style="width:45%">Nome</th>
            <th style="width:35%">Tipo</th>
            <th style="width:20%">Ações</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;

      const tbody = table.querySelector('tbody');

      if (!materiais || materiais.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 3;
        td.textContent = 'Nenhum material cadastrado.';
        tr.appendChild(td);
        tbody.appendChild(tr);
      } else {
        materiais.forEach(m => {
          const tr = document.createElement('tr');

          const tdNome = document.createElement('td');
          tdNome.innerHTML = `<span class="nome-material">${m.nome}</span>`;
          const tdTipo = document.createElement('td');
          tdTipo.innerHTML = `<span class="tipo-material">${m.tipo}</span>`;
          const tdAcoes = document.createElement('td');

          // Botões Editar / Excluir
          const btnEditar = document.createElement('button');
          btnEditar.className = 'btn-acao btn-editar';
          btnEditar.textContent = 'Editar';
          btnEditar.onclick = () => entrarModoEdicao(tr, m);

          const btnExcluir = document.createElement('button');
          btnExcluir.className = 'btn-acao btn-excluir';
          btnExcluir.textContent = 'Excluir';
          btnExcluir.onclick = () => excluirMaterial(m);

          tdAcoes.appendChild(btnEditar);
          tdAcoes.appendChild(btnExcluir);

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
  const [tdNome, tdTipo, tdAcoes] = tr.children;

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
  btnSalvar.onclick = () => salvarEdicao(material, inputNome.value.trim(), selectTipo.value);

  const btnCancelar = document.createElement('button');
  btnCancelar.className = 'btn-acao btn-cancelar';
  btnCancelar.textContent = 'Cancelar';
  btnCancelar.onclick = () => atualizarListaMateriais();

  tdAcoes.appendChild(btnSalvar);
  tdAcoes.appendChild(btnCancelar);
}

function salvarEdicao(materialOriginal, novoNome, novoTipo) {
  if (!novoNome) return alert('Informe o nome do material.');
  // Você pode criar um endpoint editar_material.php.
  // Como não foi enviado, aqui vai um POST genérico esperado:
  fetch('editar_material.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `nome_antigo=${encodeURIComponent(materialOriginal.nome)}&novo_nome=${encodeURIComponent(novoNome)}&novo_tipo=${encodeURIComponent(novoTipo)}`
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg);
    atualizarSelectsMateriais();
    atualizarListaMateriais();
  })
  .catch(() => alert('Erro ao salvar edição.'));
}

function excluirMaterial(material) {
  if (!confirm(`Tem certeza que deseja excluir "${material.nome}"?`)) return;
  // Você pode criar um endpoint excluir_material.php.
  fetch('excluir_material.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: `nome=${encodeURIComponent(material.nome)}`
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
  const material = document.getElementById('materialEntrada')?.value;
  const data = document.getElementById('dataEntrada')?.value;
  const quantidade = parseInt(document.getElementById('quantidadeEntrada')?.value, 10);
  const tipo = document.getElementById('tipoEntrada')?.value;

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
    document.getElementById('quantidadeEntrada').value = '';
    document.getElementById('dataEntrada').value = '';
  })
  .catch(() => alert('Erro ao registrar entrada.'));
}

function registrarSaida() {
  const material = document.getElementById('materialSaida')?.value;
  const data = document.getElementById('dataSaida')?.value;
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
    document.getElementById('quantidadeSaida').value = '';
    document.getElementById('dataSaida').value = '';
    document.getElementById('responsavelSaida').value = '';
  })
  .catch(() => alert('Erro ao registrar saída.'));
}

/***********************
 * RELATÓRIO DE ESTOQUE (tabela geral — caso você reexiba)
 ***********************/
function atualizarRelatorioEstoque() {
  const tabela = document.getElementById('tabelaEstoque');
  if (!tabela) return;

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

      dados.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${item.nome}</td><td>${item.quantidade}</td>`;
        tabela.appendChild(tr);
      });
    })
    .catch(() => {});
}

/***********************
 * HISTÓRICO (com coloração)
 ***********************/
function atualizarRelatorioHistorico() {
  const tabela = document.getElementById('tabelaHistorico');
  if (!tabela) return;

  // Remove linhas antigas
  tabela.querySelectorAll('tr:not(:first-child)').forEach(tr => tr.remove());

  fetch('listar_historico.php')
    .then(res => res.json())
    .then(historico => {
      if (!historico || historico.length === 0) {
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

        // adiciona as classes para colorir a linha
        if (reg.tipo === 'Entrada') tr.classList.add('linha-entrada');
        else if (reg.tipo === 'Saída') tr.classList.add('linha-saida');

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
  // Materiais
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

  // Estoque total + baixo estoque
  fetch('listar_estoque.php')
    .then(r => r.json())
    .then(estoque => {
      const total = (estoque || []).reduce((acc, it) => acc + (Number(it.quantidade) || 0), 0);
      const card = document.getElementById('cardEstoque');
      if (card) card.textContent = total;

      const LIMITE = 5;
      const baixo = (estoque || []).filter(it => (Number(it.quantidade) || 0) <= LIMITE)
                                   .sort((a,b)=> (a.quantidade||0) - (b.quantidade||0))
                                   .slice(0, 8);

      const tabela = document.getElementById('tabelaBaixoEstoque');
      if (tabela) {
        tabela.querySelectorAll('tr:not(:first-child)').forEach(tr => tr.remove());
        if (baixo.length === 0) {
          const tr = document.createElement('tr');
          const td = document.createElement('td');
          td.colSpan = 2;
          td.textContent = 'Sem itens em baixo estoque.';
          tr.appendChild(td);
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
      const el = document.getElementById('cardEstoque');
      if (el) el.textContent = '—';
    });

  // Entradas/Saídas do mês + últimas movimentações
  fetch('listar_historico.php')
    .then(r => r.json())
    .then(hist => {
      const agora = new Date();
      const mes = agora.getMonth();  // 0..11
      const ano = agora.getFullYear();

      let entradasMes = 0, saidasMes = 0;

      // Últimas 5
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
        // espera formato YYYY-MM-DD
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
 * INICIALIZAÇÃO LEVE
 * (não forçamos tela aqui para não conflitar com index.html)
 ***********************/
document.addEventListener('DOMContentLoaded', () => {
  atualizarSelectsMateriais();
  // Se a página caiu direto em alguma rota, opcionalmente podemos garantir que dashboard existe:
  // if (document.getElementById('dashboard')) mostrarTela('dashboard');
});
