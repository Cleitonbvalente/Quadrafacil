process.env.DB_NAME = process.env.DB_NAME_TESTE || 'quadrafacil_teste';
process.env.JWT_SECRET = 'segredo-dos-testes-automatizados';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

const app = require('../app');
const pool = require('../db');
const { garantirEstrutura } = require('../estrutura');
const { hojeISO, somarDias, ehFimDeSemana } = require('../regras');

let servidor;
let base;
const tokens = {};

const proximosDias = [1, 2, 3, 4, 5, 6].map((n) => somarDias(hojeISO(), n));
const diasUteis = proximosDias.filter((d) => !ehFimDeSemana(d));
const fimDeSemana = proximosDias.find((d) => ehFimDeSemana(d));

async function api(metodo, caminho, { corpo, token } = {}) {
  const cabecalhos = { 'Content-Type': 'application/json' };
  if (token) cabecalhos.Authorization = `Bearer ${token}`;
  const resposta = await fetch(base + caminho, {
    method: metodo,
    headers: cabecalhos,
    body: corpo === undefined ? undefined : typeof corpo === 'string' ? corpo : JSON.stringify(corpo),
  });
  const texto = await resposta.text();
  return { status: resposta.status, dados: texto ? JSON.parse(texto) : null };
}

async function entrar(email, senha) {
  const { status, dados } = await api('POST', '/api/login', { corpo: { email, senha } });
  assert.equal(status, 200, JSON.stringify(dados));
  return dados.token;
}

before(async () => {
  assert.match(process.env.DB_NAME, /_teste$/, 'Os testes só rodam num banco terminado em _teste');
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  await pool.query('DROP TABLE IF EXISTS notificacoes, bloqueios, reservas, usuarios');
  await pool.query('SET FOREIGN_KEY_CHECKS = 1');
  await garantirEstrutura();

  servidor = app.listen(0);
  await new Promise((resolve) => servidor.once('listening', resolve));
  base = `http://127.0.0.1:${servidor.address().port}`;

  tokens.demo = await entrar('demo@quadrafacil.com', '123456');
  tokens.escola = await entrar('escola@quadrafacil.com', 'escola123');
  await api('POST', '/api/cadastro', { corpo: { nome: 'Ana Souza', email: 'ana@teste.com', senha: 'segredo1' } });
  tokens.ana = await entrar('ana@teste.com', 'segredo1');
});

after(async () => {
  servidor?.close();
  await pool.end();
});

test('a API e o banco respondem', async () => {
  const { status, dados } = await api('GET', '/api/saude');
  assert.equal(status, 200);
  assert.equal(dados.banco, true);
});

test('a agenda segue o horário de funcionamento do ginásio', async () => {
  const { dados } = await api('GET', '/api/agenda');
  assert.equal(dados.length, 7);
  const util = dados.find((d) => d.data === diasUteis[0]);
  assert.equal(util.horarios.length, 5);
  assert.equal(util.horarios[0].horario, '17:00 - 18:00');
  assert.equal(util.horarios.at(-1).horario, '21:00 - 22:00');
  const fds = dados.find((d) => d.data === fimDeSemana);
  assert.equal(fds.horarios.length, 15);
  assert.equal(fds.horarios[0].horario, '07:00 - 08:00');
});

test('cadastro valida os dados e não aceita e-mail repetido', async () => {
  let r = await api('POST', '/api/cadastro', { corpo: { nome: 'Bia', email: 'bia@', senha: '123456' } });
  assert.equal(r.status, 400);
  r = await api('POST', '/api/cadastro', { corpo: { nome: 'Bia Lima', email: 'bia@teste.com', senha: '123' } });
  assert.equal(r.status, 400);
  r = await api('POST', '/api/cadastro', { corpo: { nome: 'Bia Lima', email: 'BIA@teste.com', senha: '123456' } });
  assert.equal(r.status, 201);
  r = await api('POST', '/api/cadastro', { corpo: { nome: 'Bia Lima', email: 'bia@teste.com', senha: '123456' } });
  assert.equal(r.status, 409);
});

test('login informa o perfil e bloqueia muitas tentativas erradas', async () => {
  const r = await api('POST', '/api/login', { corpo: { email: 'escola@quadrafacil.com', senha: 'escola123' } });
  assert.equal(r.dados.usuario.perfil, 'escola');
  for (let i = 0; i < 8; i++) {
    const errada = await api('POST', '/api/login', { corpo: { email: 'bia@teste.com', senha: 'errada' } });
    assert.equal(errada.status, 401);
  }
  const travado = await api('POST', '/api/login', { corpo: { email: 'bia@teste.com', senha: '123456' } });
  assert.equal(travado.status, 429);
});

test('não aceita reserva fora do funcionamento', async () => {
  const r = await api('POST', '/api/reservas', {
    token: tokens.demo,
    corpo: { modalidade: 'Futsal', data: diasUteis[0], horario: '07:00 - 08:00' },
  });
  assert.equal(r.status, 400);
  assert.match(r.dados.mensagem, /funcionamento/);
});

test('reserva, conflito e limite por dia', async () => {
  const vaga = { modalidade: 'Futsal', data: diasUteis[0], horario: '18:00 - 19:00' };
  let r = await api('POST', '/api/reservas', { token: tokens.demo, corpo: vaga });
  assert.equal(r.status, 201);

  r = await api('POST', '/api/reservas', { token: tokens.ana, corpo: { ...vaga, modalidade: 'Vôlei' } });
  assert.equal(r.status, 409);

  r = await api('POST', '/api/reservas', { token: tokens.demo, corpo: { ...vaga, horario: '20:00 - 21:00' } });
  assert.equal(r.status, 409);
  assert.match(r.dados.mensagem, /1 reserva por dia/);

  const agendaDemo = await api('GET', '/api/agenda', { token: tokens.demo });
  const agendaAna = await api('GET', '/api/agenda', { token: tokens.ana });
  const status = (agenda) =>
    agenda.dados.find((d) => d.data === vaga.data).horarios.find((h) => h.horario === vaga.horario).status;
  assert.equal(status(agendaDemo), 'minha');
  assert.equal(status(agendaAna), 'reservado');
});

test('limite de reservas ativas por pessoa', async () => {
  const outrosDias = proximosDias.filter((d) => d !== diasUteis[0]).slice(0, 3);
  const respostas = [];
  for (const data of outrosDias) {
    respostas.push(
      await api('POST', '/api/reservas', {
        token: tokens.demo,
        corpo: { modalidade: 'Basquete', data, horario: '19:00 - 20:00' },
      }),
    );
  }
  assert.deepEqual(
    respostas.map((r) => r.status),
    [201, 201, 409],
  );
  assert.match(respostas[2].dados.mensagem, /limite/);
});

test('cada perfil só acessa o que é seu', async () => {
  let r = await api('POST', '/api/reservas', {
    token: tokens.escola,
    corpo: { modalidade: 'Futsal', data: diasUteis[1], horario: '17:00 - 18:00' },
  });
  assert.equal(r.status, 403);
  r = await api('GET', '/api/escola/agenda', { token: tokens.ana });
  assert.equal(r.status, 403);
  r = await api('GET', '/api/escola/agenda');
  assert.equal(r.status, 401);
});

test('a escola bloqueia o horário, a reserva é cancelada e a pessoa é notificada', async () => {
  const data = diasUteis[0];
  const motivo = 'Jogos Escolares Municipais';

  const vazio = await api('POST', '/api/escola/bloqueios', {
    token: tokens.escola,
    corpo: { data, horarios: ['18:00 - 19:00'], motivo: '' },
  });
  assert.equal(vazio.status, 400);

  const r = await api('POST', '/api/escola/bloqueios', {
    token: tokens.escola,
    corpo: { data, horarios: ['17:00 - 18:00', '18:00 - 19:00'], motivo },
  });
  assert.equal(r.status, 201);
  assert.equal(r.dados.bloqueados, 2);
  assert.equal(r.dados.reservasCanceladas.length, 1);
  assert.equal(r.dados.reservasCanceladas[0].nome, 'Cleiton Barbosa Valente');

  const notificacoes = await api('GET', '/api/notificacoes', { token: tokens.demo });
  assert.equal(notificacoes.dados.naoLidas, 1);
  assert.match(notificacoes.dados.itens[0].mensagem, new RegExp(motivo));
  assert.match(notificacoes.dados.itens[0].mensagem, /das 18h às 19h/);

  const minhas = await api('GET', '/api/reservas/minhas', { token: tokens.demo });
  const cancelada = minhas.dados.find((m) => m.data === data && m.horario === '18:00 - 19:00');
  assert.equal(cancelada.situacao, 'cancelada_escola');
  assert.equal(cancelada.motivo, motivo);

  const agenda = await api('GET', '/api/agenda');
  const vaga = agenda.dados.find((d) => d.data === data).horarios.find((h) => h.horario === '18:00 - 19:00');
  assert.equal(vaga.status, 'escola');
  assert.equal(vaga.motivo, motivo);

  const tentativa = await api('POST', '/api/reservas', {
    token: tokens.ana,
    corpo: { modalidade: 'Vôlei', data, horario: '17:00 - 18:00' },
  });
  assert.equal(tentativa.status, 409);
  assert.match(tentativa.dados.mensagem, /escola/);

  const lidas = await api('POST', '/api/notificacoes/lidas', { token: tokens.demo, corpo: {} });
  assert.equal(lidas.status, 204);
  const depois = await api('GET', '/api/notificacoes', { token: tokens.demo });
  assert.equal(depois.dados.naoLidas, 0);
});

test('a escola libera o horário e ele volta a ficar livre', async () => {
  const data = diasUteis[0];
  const painel = await api('GET', `/api/escola/agenda?inicio=${data}&dias=1`, { token: tokens.escola });
  const ids = painel.dados[0].horarios.filter((h) => h.bloqueio).map((h) => h.bloqueio.id);
  assert.equal(ids.length, 2);

  const r = await api('POST', '/api/escola/bloqueios/liberar', { token: tokens.escola, corpo: { ids } });
  assert.equal(r.dados.liberados, 2);

  const agenda = await api('GET', '/api/agenda');
  const vaga = agenda.dados.find((d) => d.data === data).horarios.find((h) => h.horario === '17:00 - 18:00');
  assert.equal(vaga.status, 'livre');
});

test('a escola não bloqueia horário fora do funcionamento nem no passado', async () => {
  let r = await api('POST', '/api/escola/bloqueios', {
    token: tokens.escola,
    corpo: { data: diasUteis[0], horarios: ['08:00 - 09:00'], motivo: 'Aula' },
  });
  assert.equal(r.status, 400);
  r = await api('POST', '/api/escola/bloqueios', {
    token: tokens.escola,
    corpo: { data: somarDias(hojeISO(), -1), horarios: ['18:00 - 19:00'], motivo: 'Aula' },
  });
  assert.equal(r.status, 400);
});

test('cancelamento pela própria pessoa', async () => {
  const minhas = await api('GET', '/api/reservas/minhas', { token: tokens.demo });
  const ativa = minhas.dados.find((m) => m.situacao === 'ativa');

  let r = await api('DELETE', `/api/reservas/${ativa.id}`, { token: tokens.ana });
  assert.equal(r.status, 404);
  r = await api('DELETE', `/api/reservas/${ativa.id}`, { token: tokens.demo });
  assert.equal(r.status, 204);
  r = await api('DELETE', `/api/reservas/${ativa.id}`, { token: tokens.demo });
  assert.equal(r.status, 409);

  const depois = await api('GET', '/api/reservas/minhas', { token: tokens.demo });
  assert.equal(depois.dados.find((m) => m.id === ativa.id).situacao, 'cancelada_usuario');
});

test('erros de rota e de formato respondem em JSON', async () => {
  let r = await api('GET', '/api/nao-existe');
  assert.equal(r.status, 404);
  r = await api('POST', '/api/login', { corpo: '{quebrado' });
  assert.equal(r.status, 400);
});

test('a mensagem usa o artigo certo para cada dia da semana', () => {
  const { descreverData, descreverHorario } = require('../regras');
  assert.equal(descreverData('2026-11-21'), 'no sábado, 21/11');
  assert.equal(descreverData('2026-11-17'), 'na terça-feira, 17/11');
  assert.equal(descreverHorario('07:00 - 08:00'), 'das 07h às 08h');
});
