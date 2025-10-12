/****************************************************
 * CONTROLE DE ESTOQUE - script.js (atualizado)
 * - Navegação (com centralização da aba Solicitações)
 * - Materiais (CRUD por ID)
 * - Entradas / Saídas
 * - Relatórios + Dashboard
 * - Solicitações (com quantidade, status como texto e menu de ações)
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
    if (nomeTela === 'solicitacoes') {
  alert('A aba de Solicitações está temporariamente offline.');
  return;
}
  const telas = ['dashboard', 'entrada', 'saida', 'relatorioEstoque', 'relatorioHistorico', 'materiais', 'solicitacoes'];
  telas.forEach(tela => {
    const el = document.getElementById(tela);
    if (el) el.style.display = (tela === nomeTela) ? 'block' : 'none';
  });

  // Centralização só na aba Solicitações (combina com o patch <style> no index)
  const main = document.querySelector('.main');
  if (main) {
    if (nomeTela === 'solicitacoes') main.classList.add('solic-flex');
    else main.classList.remove('solic-flex');
  }

  // Carregamentos sob demanda
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
  if (nomeTela === 'solicitacoes' && typeof carregarSolicitacoes === 'function') {
    carregarSolicitacoes();
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
 [
  'MATERIAL GRÁFICO',
  'MATERIAL MÉDICO',
  'MEDICAÇÕES',
  'DISPOSITIVOS',
  'MATERIAL DE ESCRITÓRIO',

  // Novas (Zeladoria)
  'COZINHA',
  'DESCARTAVEL',
  'PRODUTOS'
].forEach(op => {
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

  tabela.querySelectorAll('tr:not(:first-child)').forEach(tr => tr.remove());

  fetch('listar_historico.php')
    .then(res => res.json())
    .then(historico => {
      if (!historico || historico.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="5">Nenhuma movimentação registrado.</td>`;
        tabela.appendChild(tr);
        return;
      }

      historico.forEach(reg => {
        const tr = document.createElement('tr');

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
      const mes = agora.getMonth();
      const ano = agora.getFullYear();

      let entradasMes = 0, saidasMes = 0;

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
 * SOLICITAÇÕES
 ***********************/
function badgeStatus(s) {
  if (s === 'PEDIDO SOLICITADO') return `<span class="badge s1">${s}</span>`;
  if (s === 'SOLICITADO AO FORNECEDOR') return `<span class="badge s2">${s}</span>`;
  if (s === 'CHEGOU') return `<span class="badge s3">${s}</span>`;
  return s;
}

function carregarSolicitacoes() {
  fetch('listar_solicitacoes.php')
    .then(r => r.json())
    .then(lista => {
      const tbody = document.querySelector('#tabelaSolicitacoes tbody');
      if (!tbody) return;
      tbody.innerHTML = '';

      if (!lista || lista.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="9">Nenhuma solicitação cadastrada.</td>`;
        tbody.appendChild(tr);
        return;
      }

      lista.forEach(item => {
        const tr = document.createElement('tr');
        tr.dataset.id = item.id;

        const prazo = item.prazo ? item.prazo : '—';
        const atualizado = (item.atualizado_em || '').replace('T',' ');

        tr.innerHTML = `
          <td>#${item.id}</td>
          <td>${item.nome_material}</td>
          <td>${item.categoria}</td>
          <td class="cel-qtd">${item.quantidade}</td>
          <td class="cel-motivo">${item.motivo || '—'}</td>
          <td class="cel-status">${badgeStatus(item.status)}</td>
          <td class="cel-prazo">${prazo}</td>
          <td>${atualizado}</td>
          <td class="cel-acoes">
            <details class="menu-acoes">
              <summary>⋮ Ações</summary>
              <div class="menu">
                <button onclick="entrarEdicaoSolic(${item.id}); this.closest('details').open=false;">Editar</button>
                <button onclick="abrirAlterarStatus(${item.id}, '${item.status}'); this.closest('details').open=false;">Alterar status</button>
              </div>
            </details>
          </td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(() => {});
}

function criarSolicitacao() {
  const nome = (document.getElementById('sol_nome')?.value || '').trim();
  const cat  = document.getElementById('sol_categoria')?.value || '';
  const qtd  = parseInt(document.getElementById('sol_qtd')?.value || '1', 10);
  const mot  = (document.getElementById('sol_motivo')?.value || '').trim();
  const prazo = document.getElementById('sol_prazo')?.value || '';

  if (!nome || !cat || !mot) {
    alert('Preencha Material, Categoria e Motivo.');
    return;
  }
  if (!Number.isFinite(qtd) || qtd <= 0) {
    alert('Quantidade inválida.');
    return;
  }

  const body = new URLSearchParams();
  body.append('nome_material', nome);
  body.append('categoria', cat);
  body.append('quantidade', String(qtd));
  body.append('motivo', mot);
  body.append('prazo', prazo);

  fetch('criar_solicitacao.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: body.toString()
  })
  .then(r => r.json())
  .then(j => {
    if (!j.ok) throw new Error(j.erro || 'Falha ao criar.');
    alert('Solicitação criada com sucesso!');
    // limpar form
    document.getElementById('sol_nome').value = '';
    document.getElementById('sol_qtd').value = '1';
    document.getElementById('sol_motivo').value = '';
    document.getElementById('sol_prazo').value = '';
    carregarSolicitacoes();
  })
  .catch(e => alert(e.message));
}

// Entra em modo edição: transforma Qtd/Motivo/Prazo em inputs + mostra Salvar/Cancelar
function entrarEdicaoSolic(id) {
  const tr = document.querySelector(`#tabelaSolicitacoes tr[data-id="${id}"]`);
  if (!tr) return;

  const tdQtd = tr.querySelector('.cel-qtd');
  const tdMotivo = tr.querySelector('.cel-motivo');
  const tdPrazo = tr.querySelector('.cel-prazo');
  const tdAcoes = tr.querySelector('.cel-acoes');

  const qtdAtual = (tdQtd.textContent || '1').trim();
  const motivoAtual = (tdMotivo.textContent || '').trim();
  const prazoAtual = (tdPrazo.textContent || '').trim();
  const prazoVal = /^\d{4}-\d{2}-\d{2}$/.test(prazoAtual) ? prazoAtual : '';

  tdQtd.innerHTML = `<input type="number" min="1" step="1" value="${qtdAtual}">`;
  tdMotivo.innerHTML = `<textarea rows="2">${motivoAtual === '—' ? '' : motivoAtual}</textarea>`;
  tdPrazo.innerHTML = `<input type="date" value="${prazoVal}">`;

  tdAcoes.innerHTML = `
    <button class="btn-acao btn-salvar" onclick="salvarEdicaoSolic(${id})">Salvar</button>
    <button class="btn-acao btn-cancelar" onclick="cancelarEdicaoSolic(${id})">Cancelar</button>
  `;
}

function cancelarEdicaoSolic(id) {
  carregarSolicitacoes(); // volta a linha ao estado normal
}

function salvarEdicaoSolic(id) {
  const tr = document.querySelector(`#tabelaSolicitacoes tr[data-id="${id}"]`);
  if (!tr) return;

  const qtd = parseInt(tr.querySelector('.cel-qtd input')?.value || '1', 10);
  const motivo = (tr.querySelector('.cel-motivo textarea')?.value || '').trim();
  const prazo = (tr.querySelector('.cel-prazo input[type="date"]')?.value || '').trim();

  if (!Number.isFinite(qtd) || qtd <= 0) { alert('Quantidade inválida.'); return; }

  const body = new URLSearchParams();
  body.append('id', String(id));
  body.append('quantidade', String(qtd));
  body.append('motivo', motivo);
  body.append('prazo', prazo);

  fetch('editar_solicitacao.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: body.toString()
  })
  .then(r => r.json())
  .then(j => {
    if (!j.ok) throw new Error(j.erro || 'Falha ao salvar.');
    carregarSolicitacoes();
  })
  .catch(e => alert(e.message));
}

// Troca de status (só mostra texto na coluna; alteração via menu)
function abrirAlterarStatus(id, statusAtual) {
  const novo = prompt(
    "Novo status (digite exatamente):\n- PEDIDO SOLICITADO\n- SOLICITADO AO FORNECEDOR\n- CHEGOU",
    statusAtual
  );
  if (!novo) return;
  const validos = ['PEDIDO SOLICITADO','SOLICITADO AO FORNECEDOR','CHEGOU'];
  if (!validos.includes(novo)) { alert('Status inválido.'); return; }

  const body = new URLSearchParams();
  body.append('id', String(id));
  body.append('status', novo);
  body.append('prazo', ''); // manter prazo como está

  fetch('atualizar_status_solicitacao.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: body.toString()
  })
  .then(r => r.json())
  .then(j => {
    if (!j.ok) throw new Error(j.erro || 'Falha ao alterar status.');
    carregarSolicitacoes();
  })
  .catch(e => alert(e.message));
}

/***********************
 * INICIALIZAÇÃO
 ***********************/
document.addEventListener('DOMContentLoaded', () => {
  atualizarSelectsMateriais();

  // submit do form de "Nova Solicitação"
  const fNova = document.getElementById('formNovaSolic');
  if (fNova) {
    fNova.addEventListener('submit', (e) => {
      e.preventDefault();
      criarSolicitacao();
    });
  }
});


/* ======= PATCH Solicitações v3.1 — força ordem das colunas e ações ======= */
console.log('Solicitações JS patch v3.1 carregado');

function badgeStatus(s) {
  if (s === 'PEDIDO SOLICITADO') return `<span class="badge s1">${s}</span>`;
  if (s === 'SOLICITADO AO FORNECEDOR') return `<span class="badge s2">${s}</span>`;
  if (s === 'CHEGOU') return `<span class="badge s3">${s}</span>`;
  return s || '—';
}

/* Render de uma linha na ORDEM correta:
   ID | Material | Categoria | Qtd | Motivo | Status(texto) | Prazo | Atualizado | Ações  */
function renderSolicRow(item) {
  const tr = document.createElement('tr');
  tr.dataset.id = item.id;

  const prazo = item.prazo ? item.prazo : '—';
  const atualizado = (item.atualizado_em || '').replace('T', ' ');
  const motivo = (item.motivo || '').trim() || '—';
  const qtd = Number(item.quantidade || 0) > 0 ? item.quantidade : '—';

  tr.innerHTML = `
    <td>#${item.id}</td>
    <td>${item.nome_material}</td>
    <td>${item.categoria}</td>
    <td>${qtd}</td>
    <td>${motivo}</td>
    <td class="cel-status">${badgeStatus(item.status)}</td>
    <td>${prazo}</td>
    <td>${atualizado}</td>
    <td class="cel-acoes">
      <details class="menu-acoes">
        <summary>⋮ Ações</summary>
        <div class="menu">
          <button onclick="alterarStatusInline(${item.id}, '${(item.status||'').replace(/'/g, "\\'")}'); this.closest('details').open=false;">Alterar status</button>
          <button onclick="excluirSolicitacao(${item.id}); this.closest('details').open=false;">Excluir</button>
        </div>
      </details>
    </td>
  `;
  return tr;
}

// Abre edição inline de STATUS: vira um <select> na própria célula + salvar/cancelar
function alterarStatusInline(id, statusAtual) {
  const tr = document.querySelector(`#tabelaSolicitacoes tr[data-id="${id}"]`);
  if (!tr) return;
  const tdStatus = tr.querySelector('.cel-status');
  const tdAcoes  = tr.querySelector('.cel-acoes');

  const op = (v,t) => `<option value="${v}" ${v===statusAtual?'selected':''}>${t}</option>`;
  tdStatus.dataset.prev = statusAtual;
  tdStatus.innerHTML = `
    <select class="sel-status">
      ${op('PEDIDO SOLICITADO','PEDIDO SOLICITADO')}
      ${op('SOLICITADO AO FORNECEDOR','SOLICITADO AO FORNECEDOR')}
      ${op('CHEGOU','CHEGOU')}
    </select>
  `;

  tdAcoes.dataset.prev = tdAcoes.innerHTML;
  tdAcoes.innerHTML = `
    <button class="btn-acao btn-salvar" onclick="salvarStatusSolic(${id})">Salvar</button>
    <button class="btn-acao btn-cancelar" onclick="cancelarStatusSolic(${id})">Cancelar</button>
  `;
}

function cancelarStatusSolic(id){
  const tr = document.querySelector(`#tabelaSolicitacoes tr[data-id="${id}"]`);
  if (!tr) return;
  const tdStatus = tr.querySelector('.cel-status');
  const tdAcoes  = tr.querySelector('.cel-acoes');
  const prev = tdStatus.dataset.prev || '';
  tdStatus.innerHTML = badgeStatus(prev);
  tdAcoes.innerHTML = tdAcoes.dataset.prev || '';
}

function salvarStatusSolic(id){
  const tr = document.querySelector(`#tabelaSolicitacoes tr[data-id="${id}"]`);
  if (!tr) return;
  const novo = tr.querySelector('.cel-status .sel-status')?.value;
  if (!novo) return;

  const body = new URLSearchParams({ id: String(id), status: novo, prazo: '' });
  fetch('atualizar_status_solicitacao.php', {
    method: 'POST',
    headers: {'Content-Type':'application/x-www-form-urlencoded'},
    body: body.toString()
  })
  .then(r=>r.json())
  .then(j=>{
    if(!j.ok) throw new Error(j.erro || 'Falha ao alterar status.');
    carregarSolicitacoes();
  })
  .catch(e=>{
    alert(e.message);
    cancelarStatusSolic(id);
  });
}

// Excluir (permanece igual)
function excluirSolicitacao(id) {
  if (!confirm("Tem certeza que deseja excluir esta solicitação?")) return;

  const body = new URLSearchParams({ id: String(id) });
  fetch("excluir_solicitacao.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  })
  .then(r => r.json())
  .then(j => {
    if (!j.ok) throw new Error(j.erro || "Falha ao excluir.");
    carregarSolicitacoes();
  })
  .catch(e => alert(e.message));
}


/* Sobrescreve o listador antigo */
window.carregarSolicitacoes = function carregarSolicitacoes() {
  fetch('listar_solicitacoes.php')
    .then(r => r.json())
    .then(lista => {
      const tbody = document.querySelector('#tabelaSolicitacoes tbody');
      if (!tbody) return;
      tbody.innerHTML = '';

      if (!lista || lista.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="9">Nenhuma solicitação cadastrada.</td>`;
        tbody.appendChild(tr);
        return;
      }

      lista.forEach(item => tbody.appendChild(renderSolicRow(item)));
    })
    .catch(err => console.error(err));
};

/* Criação (mantém nomes dos campos que você já usa no form) */
window.criarSolicitacao = function criarSolicitacao() {
  const nome  = (document.getElementById('sol_nome')?.value || '').trim();
  const cat   = document.getElementById('sol_categoria')?.value || '';
  const qtd   = parseInt(document.getElementById('sol_qtd')?.value || '1', 10);
  const mot   = (document.getElementById('sol_motivo')?.value || '').trim();
  const prazo = document.getElementById('sol_prazo')?.value || '';

  if (!nome || !cat || !mot) return alert('Preencha Material, Categoria e Motivo.');
  if (!Number.isFinite(qtd) || qtd <= 0) return alert('Quantidade inválida.');

  const body = new URLSearchParams({
    nome_material: nome, categoria: cat, quantidade: String(qtd), motivo: mot, prazo
  });

  fetch('criar_solicitacao.php', {
    method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: body.toString()
  })
  .then(r => r.json())
  .then(j => {
    if (!j.ok) throw new Error(j.erro || 'Falha ao criar.');
    // limpa form
    document.getElementById('sol_nome').value = '';
    document.getElementById('sol_qtd').value = '1';
    document.getElementById('sol_motivo').value = '';
    document.getElementById('sol_prazo').value = '';
    carregarSolicitacoes();
  })
  .catch(e => alert(e.message));
};

/* Edição inline: edita Qtd, Motivo, Prazo (Status é alterado à parte) */
window.entrarEdicaoSolic = function entrarEdicaoSolic(id) {
  const tr = document.querySelector(`#tabelaSolicitacoes tr[data-id="${id}"]`);
  if (!tr) return;

  const tdQtd    = tr.querySelector('.cel-qtd');
  const tdMotivo = tr.querySelector('.cel-motivo');
  const tdPrazo  = tr.querySelector('.cel-prazo');
  const tdAcoes  = tr.querySelector('.cel-acoes');

  const qtdAtual    = (tdQtd.textContent || '1').trim().replace(/\D+/g,'') || '1';
  const motivoAtual = (tdMotivo.textContent || '').trim();
  const prazoAtual  = (tdPrazo.textContent || '').trim();
  const prazoVal    = /^\d{4}-\d{2}-\d{2}$/.test(prazoAtual) ? prazoAtual : '';

  tdQtd.innerHTML    = `<input type="number" min="1" step="1" value="${qtdAtual}">`;
  tdMotivo.innerHTML = `<textarea rows="2">${motivoAtual === '—' ? '' : motivoAtual}</textarea>`;
  tdPrazo.innerHTML  = `<input type="date" value="${prazoVal}">`;

  tdAcoes.innerHTML = `
    <button class="btn-acao btn-salvar" onclick="salvarEdicaoSolic(${id})">Salvar</button>
    <button class="btn-acao btn-cancelar" onclick="cancelarEdicaoSolic(${id})">Cancelar</button>
  `;
};

window.cancelarEdicaoSolic = function cancelarEdicaoSolic() {
  carregarSolicitacoes();
};

window.salvarEdicaoSolic = function salvarEdicaoSolic(id) {
  const tr = document.querySelector(`#tabelaSolicitacoes tr[data-id="${id}"]`);
  if (!tr) return;

  const qtd    = parseInt(tr.querySelector('.cel-qtd input')?.value || '1', 10);
  const motivo = (tr.querySelector('.cel-motivo textarea')?.value || '').trim();
  const prazo  = (tr.querySelector('.cel-prazo input[type="date"]')?.value || '').trim();

  if (!Number.isFinite(qtd) || qtd <= 0) return alert('Quantidade inválida.');

  const body = new URLSearchParams({ id: String(id), quantidade: String(qtd), motivo, prazo });

  fetch('editar_solicitacao.php', {
    method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: body.toString()
  })
  .then(r => r.json())
  .then(j => {
    if (!j.ok) throw new Error(j.erro || 'Falha ao salvar.');
    carregarSolicitacoes();
  })
  .catch(e => alert(e.message));
};

/* Alterar só o status (coluna Status mostra texto) */
window.abrirAlterarStatus = function abrirAlterarStatus(id, statusAtual) {
  const novo = prompt(
    "Novo status (digite exatamente):\n- PEDIDO SOLICITADO\n- SOLICITADO AO FORNECEDOR\n- CHEGOU", statusAtual || 'PEDIDO SOLICITADO'
  );
  if (!novo) return;
  const validos = ['PEDIDO SOLICITADO','SOLICITADO AO FORNECEDOR','CHEGOU'];
  if (!validos.includes(novo)) return alert('Status inválido.');

  const body = new URLSearchParams({ id: String(id), status: novo, prazo: '' });

  fetch('atualizar_status_solicitacao.php', {
    method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: body.toString()
  })
  .then(r => r.json())
  .then(j => {
    if (!j.ok) throw new Error(j.erro || 'Falha ao alterar status.');
    carregarSolicitacoes();
  })
  .catch(e => alert(e.message));
};

