const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./db');

function usuariosPadrao() {
  return [
    {
      nome: 'Cleiton Barbosa Valente',
      email: 'demo@quadrafacil.com',
      senha: '123456',
      perfil: 'cidadao',
    },
    {
      nome: process.env.ESCOLA_NOME || 'Administração da Escola',
      email: (process.env.ESCOLA_EMAIL || 'escola@quadrafacil.com').toLowerCase(),
      senha: process.env.ESCOLA_SENHA || 'escola123',
      perfil: 'escola',
    },
  ];
}

async function tabelaExiste(tabela) {
  const [linhas] = await pool.query(
    'SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
    [tabela],
  );
  return linhas.length > 0;
}

async function colunaExiste(tabela, coluna) {
  const [linhas] = await pool.query(
    'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [tabela, coluna],
  );
  return linhas.length > 0;
}

async function atualizarVersoesAntigas() {
  if ((await tabelaExiste('reservas')) && !(await colunaExiste('reservas', 'status'))) {
    await pool.query('DROP TABLE reservas');
    console.log('A tabela de reservas foi recriada no formato novo (as reservas de teste antigas foram apagadas).');
  }
  if ((await tabelaExiste('usuarios')) && !(await colunaExiste('usuarios', 'perfil'))) {
    await pool.query(
      "ALTER TABLE usuarios ADD COLUMN perfil ENUM('cidadao', 'escola') NOT NULL DEFAULT 'cidadao' AFTER senha",
    );
  }
}

async function criarTabelas() {
  const sql = fs.readFileSync(path.join(__dirname, 'sql', 'tabelas.sql'), 'utf8');
  const comandos = sql
    .split(';')
    .map((comando) => comando.trim())
    .filter(Boolean);
  for (const comando of comandos) {
    await pool.query(comando);
  }
}

async function garantirUsuario({ nome, email, senha, perfil }) {
  const [linhas] = await pool.query('SELECT id, senha, perfil FROM usuarios WHERE email = ?', [email]);
  if (linhas.length === 0) {
    const hash = await bcrypt.hash(senha, 10);
    await pool.query('INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)', [
      nome,
      email,
      hash,
      perfil,
    ]);
    return;
  }
  const atual = linhas[0];
  if (!atual.senha.startsWith('$2')) {
    const hash = await bcrypt.hash(senha, 10);
    await pool.query('UPDATE usuarios SET senha = ? WHERE id = ?', [hash, atual.id]);
  }
  if (atual.perfil !== perfil) {
    await pool.query('UPDATE usuarios SET perfil = ? WHERE id = ?', [perfil, atual.id]);
  }
}

async function garantirEstrutura() {
  await atualizarVersoesAntigas();
  await criarTabelas();
  for (const usuario of usuariosPadrao()) {
    await garantirUsuario(usuario);
  }
}

module.exports = { garantirEstrutura, usuariosPadrao };
