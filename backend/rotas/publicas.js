const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { gerarToken, loginOpcional } = require('../auth');
const limitador = require('../servicos/limitador');
const { montarAgenda } = require('../servicos/agenda');
const {
  MODALIDADES,
  FUNCIONAMENTO,
  DIAS_ANTECEDENCIA,
  LIMITE_RESERVAS_ATIVAS,
  LIMITE_RESERVAS_POR_DIA,
  hojeISO,
  emailValido,
} = require('../regras');

const rotas = express.Router();

rotas.get('/saude', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, banco: true });
  } catch (erro) {
    res
      .status(503)
      .json({ ok: false, banco: false, mensagem: 'A API está no ar, mas não conseguiu falar com o MySQL' });
  }
});

rotas.get('/config', (req, res) => {
  res.json({
    ginasio: process.env.GINASIO_NOME || 'Ginásio Municipal',
    modalidades: MODALIDADES,
    diasAntecedencia: DIAS_ANTECEDENCIA,
    limites: { ativas: LIMITE_RESERVAS_ATIVAS, porDia: LIMITE_RESERVAS_POR_DIA },
    funcionamento: {
      diasUteis: `${FUNCIONAMENTO.diasUteis.abre}h às ${FUNCIONAMENTO.diasUteis.fecha}h`,
      fimDeSemana: `${FUNCIONAMENTO.fimDeSemana.abre}h às ${FUNCIONAMENTO.fimDeSemana.fecha}h`,
    },
  });
});

rotas.get('/agenda', loginOpcional, async (req, res, next) => {
  try {
    const dias = await montarAgenda(hojeISO(), DIAS_ANTECEDENCIA, { usuarioId: req.usuario?.id });
    res.json(dias);
  } catch (erro) {
    next(erro);
  }
});

rotas.post('/cadastro', async (req, res, next) => {
  const nome = String(req.body.nome || '').trim();
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();
  const senha = String(req.body.senha || '');

  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios' });
  }
  if (nome.length < 3 || nome.length > 120) {
    return res.status(400).json({ mensagem: 'Digite seu nome completo' });
  }
  if (!emailValido(email) || email.length > 150) {
    return res.status(400).json({ mensagem: 'Digite um e-mail válido' });
  }
  if (senha.length < 6) {
    return res.status(400).json({ mensagem: 'A senha precisa ter pelo menos 6 caracteres' });
  }

  try {
    const hash = await bcrypt.hash(senha, 10);
    await pool.query('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', [nome, email, hash]);
    res.status(201).json({ mensagem: 'Cadastro realizado com sucesso! Faça login para continuar' });
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensagem: 'Já existe uma conta com este e-mail' });
    }
    next(erro);
  }
});

rotas.post('/login', async (req, res, next) => {
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();
  const senha = String(req.body.senha || '');

  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios' });
  }
  if (limitador.bloqueado(req, email)) {
    return res.status(429).json({ mensagem: 'Muitas tentativas seguidas. Aguarde 15 minutos e tente de novo' });
  }

  try {
    const [linhas] = await pool.query('SELECT id, nome, email, senha, perfil FROM usuarios WHERE email = ?', [email]);
    const usuario = linhas[0];
    let confere = false;

    if (usuario && usuario.senha.startsWith('$2')) {
      confere = await bcrypt.compare(senha, usuario.senha);
    } else if (usuario && usuario.senha === senha) {
      confere = true;
      await pool.query('UPDATE usuarios SET senha = ? WHERE id = ?', [await bcrypt.hash(senha, 10), usuario.id]);
    }

    if (!confere) {
      limitador.registrarFalha(req, email);
      return res.status(401).json({ mensagem: 'E-mail ou senha incorretos' });
    }

    limitador.limpar(req, email);
    const dados = { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil };
    res.json({ usuario: dados, token: gerarToken(dados) });
  } catch (erro) {
    next(erro);
  }
});

module.exports = rotas;
