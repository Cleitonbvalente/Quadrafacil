const express = require('express');
const pool = require('../db');
const { exigirLogin } = require('../auth');

const rotas = express.Router();

rotas.get('/', exigirLogin, async (req, res, next) => {
  try {
    const [linhas] = await pool.query(
      `SELECT id, titulo, mensagem, reserva_id, lida, UNIX_TIMESTAMP(criada_em) * 1000 AS criada_ms
       FROM notificacoes
       WHERE usuario_id = ?
       ORDER BY id DESC
       LIMIT 50`,
      [req.usuario.id],
    );
    const itens = linhas.map((linha) => ({
      id: linha.id,
      titulo: linha.titulo,
      mensagem: linha.mensagem,
      reservaId: linha.reserva_id,
      lida: Boolean(linha.lida),
      criadaEm: Number(linha.criada_ms),
    }));
    res.json({ itens, naoLidas: itens.filter((item) => !item.lida).length });
  } catch (erro) {
    next(erro);
  }
});

rotas.post('/lidas', exigirLogin, async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter(Number.isInteger) : null;
    if (ids && ids.length === 0) {
      return res.status(204).send();
    }
    if (ids) {
      await pool.query('UPDATE notificacoes SET lida = 1 WHERE usuario_id = ? AND id IN (?)', [req.usuario.id, ids]);
    } else {
      await pool.query('UPDATE notificacoes SET lida = 1 WHERE usuario_id = ?', [req.usuario.id]);
    }
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
});

module.exports = rotas;
