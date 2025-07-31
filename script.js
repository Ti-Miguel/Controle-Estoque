const estoque = {};
const historico = [];
const materiais = [
  { nome: "ABAIXADOR DE LINGUA", tipo: "MATERIAL MÉDICO" },
  { nome: "AGULHA 13X0.3", tipo: "MATERIAL MÉDICO" },
  { nome: "AGULHA 13X0.45", tipo: "MATERIAL MÉDICO" },
  { nome: "AGULHA 25X7", tipo: "MATERIAL MÉDICO" },
  { nome: "AGULHA 25X8", tipo: "MATERIAL MÉDICO" },
  { nome: "AGULHA 30X8", tipo: "MATERIAL MÉDICO" },
  { nome: "AGULHA 40X12 COM PONTA", tipo: "MATERIAL MÉDICO" },
  { nome: "AGULHA 25X6", tipo: "MATERIAL MÉDICO" },
  { nome: "AGULHA 40X8", tipo: "MATERIAL MÉDICO" },
  { nome: "AGULHA GLICOSE", tipo: "MATERIAL MÉDICO" },
  { nome: "AGULHA ANESTESIA EPIDURAL TUOHY 20GX3,5 (90X09) T209", tipo: "MATERIAL MÉDICO" },
  { nome: "ALGODAO", tipo: "MATERIAL MÉDICO" },
  { nome: "ANESTESICO COM", tipo: "MATERIAL MÉDICO" },
  { nome: "ANESTESICO SEM", tipo: "MATERIAL MÉDICO" },
  { nome: "ATADURA DE CREPOM TIPO CYSNE 15CMX1,80", tipo: "MATERIAL MÉDICO" },
  { nome: "ATADURA 6 CM", tipo: "MATERIAL MÉDICO" },
  { nome: "CARBOGEL", tipo: "MATERIAL MÉDICO" },
  { nome: "DESCARBOX", tipo: "MATERIAL MÉDICO" },
  { nome: "ESPARADRAPO 2.5 X 4.5", tipo: "MATERIAL MÉDICO" },
  { nome: "ESPARADRAPO 10 X 4.5", tipo: "MATERIAL MÉDICO" },
  { nome: "ESPARADRAPO 5 X 4.5", tipo: "MATERIAL MÉDICO" },
  { nome: "FIO 2", tipo: "MATERIAL MÉDICO" },
  { nome: "FIO 3", tipo: "MATERIAL MÉDICO" },
  { nome: "FIO 4", tipo: "MATERIAL MÉDICO" },
  { nome: "FIO 5", tipo: "MATERIAL MÉDICO" },
  { nome: "FIO 6", tipo: "MATERIAL MÉDICO" },
  { nome: "FITAS GLICOSE", tipo: "MATERIAL MÉDICO" },
  { nome: "FIXADOR", tipo: "MATERIAL MÉDICO" },
  { nome: "GAZE", tipo: "MATERIAL MÉDICO" },
  { nome: "GLICOSE FLACONETE", tipo: "MATERIAL MÉDICO" },
  { nome: "KIT DIU", tipo: "MATERIAL MÉDICO" },
  { nome: "LAMINA 11", tipo: "MATERIAL MÉDICO" },
  { nome: "LAMINA 15", tipo: "MATERIAL MÉDICO" },
  { nome: "LAMINA 21", tipo: "MATERIAL MÉDICO" },
  { nome: "LUVA ESTERIL 6.5", tipo: "MATERIAL MÉDICO" },
  { nome: "LUVA ESTERIL 7.0", tipo: "MATERIAL MÉDICO" },
  { nome: "LUVA ESTERIL 7.5", tipo: "MATERIAL MÉDICO" },
  { nome: "LUVA G", tipo: "MATERIAL MÉDICO" },
  { nome: "LUVA M", tipo: "MATERIAL MÉDICO" },
  { nome: "LUVA PP", tipo: "MATERIAL MÉDICO" },
  { nome: "LUVA P SEM PO", tipo: "MATERIAL MÉDICO" },
  { nome: "MASCARA", tipo: "MATERIAL MÉDICO" },
  { nome: "MICROPORE 2.5 X 10", tipo: "MATERIAL MÉDICO" },
  { nome: "MICROPORE 10 X 4.5", tipo: "MATERIAL MÉDICO" },
  { nome: "MICROPORE 5 X 4.5", tipo: "MATERIAL MÉDICO" },
  { nome: "PAPEL DE MACA", tipo: "MATERIAL MÉDICO" },
  { nome: "PAPEL GRALL G", tipo: "MATERIAL MÉDICO" },
  { nome: "PAPEL GRALL P", tipo: "MATERIAL MÉDICO" },
  { nome: "PRESERVATIVO", tipo: "MATERIAL MÉDICO" },
  { nome: "SCALP 21", tipo: "MATERIAL MÉDICO" },
  { nome: "SCALP 23", tipo: "MATERIAL MÉDICO" },
  { nome: "SERINGA 5 ML COM ROSCA", tipo: "MATERIAL MÉDICO" },
  { nome: "SERINGA 10 ML COM ROSCA", tipo: "MATERIAL MÉDICO" },
  { nome: "SERINGA 20 ML COM ROSCA", tipo: "MATERIAL MÉDICO" },
  { nome: "SERINGA 3 ML COM ROSCA", tipo: "MATERIAL MÉDICO" },
  { nome: "SORO 0.9 DE 10 ML", tipo: "MATERIAL MÉDICO" },
  { nome: "STOPPER", tipo: "MATERIAL MÉDICO" },
  { nome: "CAMPO ESTERIL", tipo: "MATERIAL MÉDICO" },
  { nome: "CRIOTERAPIA", tipo: "MATERIAL MÉDICO" },
  { nome: "ROPIVACAINA", tipo: "MATERIAL MÉDICO" },
  { nome: "ELETRODO", tipo: "MATERIAL MÉDICO" },
  { nome: "EQUIPO DE SORO", tipo: "MATERIAL MÉDICO" },
  { nome: "SORO DE 1 LITRO", tipo: "MATERIAL MÉDICO" },
  { nome: "SORO DE 500 ML", tipo: "MATERIAL MÉDICO" },
  { nome: "SORO DE 250 ML", tipo: "MATERIAL MÉDICO" },
  { nome: "SORO DE 100 ML", tipo: "MATERIAL MÉDICO" },
  { nome: "IODO", tipo: "MATERIAL MÉDICO" },
  { nome: "AQUOSA 0,2%", tipo: "MATERIAL MÉDICO" },
  { nome: "DETERGENTE ENZIMATICO", tipo: "MATERIAL MÉDICO" },
  { nome: "VASELINA", tipo: "MATERIAL MÉDICO" },
  { nome: "ALCOOL ISOPROPILICO", tipo: "MATERIAL MÉDICO" },
  { nome: "CLOREXIDINA 2%", tipo: "MATERIAL MÉDICO" },
  { nome: "AQUOSA 0,5%", tipo: "MATERIAL MÉDICO" },
  { nome: "ABOCATH 20", tipo: "MATERIAL MÉDICO" },
  { nome: "ABOCATH 22", tipo: "MATERIAL MÉDICO" },
  { nome: "ABOCATH 24", tipo: "MATERIAL MÉDICO" },
  { nome: "COTONETE", tipo: "MATERIAL MÉDICO" },
  { nome: "SWAB", tipo: "MATERIAL MÉDICO" }
];

function atualizarSelectsMateriais() {
  const selectEntrada = document.getElementById('materialEntrada');
  const selectSaida = document.getElementById('materialSaida');

  selectEntrada.innerHTML = '<option value="">Selecione o material</option>';
  selectSaida.innerHTML = '<option value="">Selecione o material</option>';

  materiais.forEach(mat => {
    const option = `<option value="${mat.nome}">${mat.nome}</option>`;
    selectEntrada.innerHTML += option;
    selectSaida.innerHTML += option;
  });
}

atualizarSelectsMateriais();

function mostrarTela(id) {
  document.querySelectorAll('.container').forEach(div => div.style.display = 'none');
  const div = document.getElementById(id);
  if (div) div.style.display = 'block';
  if (id === 'relatorioEstoque') atualizarEstoque();
  if (id === 'relatorioHistorico') atualizarHistorico();
  if (id === 'materiais') mostrarListaMateriais();
}

function registrarEntrada() {
  const material = document.getElementById('materialEntrada').value;
  const data = document.getElementById('dataEntrada').value;
  const quantidade = parseInt(document.getElementById('quantidadeEntrada').value);
  const tipo = document.getElementById('tipoEntrada').value;

  if (!material || !data || isNaN(quantidade)) return alert('Preencha todos os campos.');

  estoque[material] = (estoque[material] || 0) + quantidade;
  historico.push({ tipo: 'Entrada', material, data, quantidade, detalhes: `${quantidade} ${tipo}` });

  alert('Entrada registrada!');

  document.getElementById('dataEntrada').value = '';
  document.getElementById('quantidadeEntrada').value = '';
  document.getElementById('materialEntrada').value = '';

  mostrarTela('entrada');
}

function registrarSaida() {
  const material = document.getElementById('materialSaida').value;
  const data = document.getElementById('dataSaida').value;
  const quantidade = parseInt(document.getElementById('quantidadeSaida').value);
  const responsavel = document.getElementById('responsavelSaida').value;

  if (!material || !data || isNaN(quantidade) || !responsavel) return alert('Preencha todos os campos.');

  if (!estoque[material] || estoque[material] < quantidade) {
    alert('Estoque insuficiente!');
    return;
  }

  estoque[material] -= quantidade;
  historico.push({ tipo: 'Saída', material, data, quantidade, detalhes: `Por: ${responsavel}` });

  alert('Saída registrada!');

  document.getElementById('dataSaida').value = '';
  document.getElementById('quantidadeSaida').value = '';
  document.getElementById('responsavelSaida').value = '';
  document.getElementById('materialSaida').value = '';

  mostrarTela('saida');
}

function atualizarEstoque() {
  const tabela = document.getElementById('tabelaEstoque');
  tabela.innerHTML = '<tr><th>Material</th><th>Quantidade</th></tr>';
  for (let mat in estoque) {
    const row = `<tr><td>${mat}</td><td>${estoque[mat]}</td></tr>`;
    tabela.innerHTML += row;
  }
}

function atualizarHistorico() {
  const tabela = document.getElementById('tabelaHistorico');
  tabela.innerHTML = '<tr><th>Tipo</th><th>Material</th><th>Data</th><th>Quantidade</th><th>Detalhes</th></tr>';
  historico.forEach(reg => {
    const row = `<tr><td>${reg.tipo}</td><td>${reg.material}</td><td>${reg.data}</td><td>${reg.quantidade}</td><td>${reg.detalhes}</td></tr>`;
    tabela.innerHTML += row;
  });
}

function adicionarMaterial() {
  const nome = document.getElementById('novoMaterial').value;
  const tipo = document.getElementById('tipoMaterial').value;
  if (!nome) return alert('Digite o nome do material.');
  materiais.push({ nome, tipo });
  document.getElementById('novoMaterial').value = '';
  atualizarSelectsMateriais();
  mostrarListaMateriais();
}

function mostrarListaMateriais() {
  const div = document.getElementById('listaMateriais');
  if (materiais.length === 0) {
    div.innerHTML = '<p>Nenhum material adicionado.</p>';
    return;
  }
  let html = '<table><tr><th>Nome</th><th>Tipo</th><th>Ação</th></tr>';
  materiais.forEach((mat, index) => {
    html += `<tr>
      <td>${mat.nome}</td>
      <td>${mat.tipo}</td>
      <td><button onclick="excluirMaterial(${index})">Excluir</button></td>
    </tr>`;
  });
  html += '</table>';
  div.innerHTML = html;
}

function excluirMaterial(index) {
  if (confirm('Tem certeza que deseja excluir este material?')) {
    materiais.splice(index, 1);
    atualizarSelectsMateriais();
    mostrarListaMateriais();
  }
}
