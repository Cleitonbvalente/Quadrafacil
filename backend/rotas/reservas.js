const express = require('express');
const pool = require('../db');
const { exigirLogin, exigirCidadao } = require('../auth');
const { comTransacao, ErroDeRegra } = require('../servicos/transacao');
const {
  MODALIDADES,
  DIAS_ANTECEDENCIA,
  LIMITE_RESERVAS_ATIVAS,
  LIMITE_RESERVAS_POR_DIA,
  hojeISO,
  somarDias,
  horaAtual,
  dataValida,
  horarioValido,
  horarioJaPassou,
} = require('../regras');

const rotas = express.Router();

function situacaoDa(linha) {
  if (linha.status !== 'ativa') return linha.status;
  return horarioJaPassou(linha.data_reserva, linha.horario) ? 'concluida' : 'ativa';
}

rotas.get('/minhas', exigirLogin, async (req, res, next) => {
  try {
    const [linhas] = await pool.query(
      `SELECT id, modalidade, data_reserva, horario, status, motivo_cancelamento
       FROM reservas
       WHERE usuario_id = ? AND data_reserva >= ?
       ORDER BY data_reserva, horario`,
      [req.usuario.id, somarDias(hojeISO(), -60)],
    );
    res.json(
      linhas.map((linha) => ({
        id: linha.id,
        modalidade: linha.modalidade,
        data: linha.data_reserva,
        horario: linha.horario,
        situacao: situacaoDa(linha),
        motivo: linha.motivo_cancelamento,
      })),
    );
  } catch (erro) {
    next(erro);
  }
});

rotas.post('/', exigirCidadao, async (req, res, next) => {
  const { modalidade, data, horario } = req.body;
  const hoje = hojeISO();

  if (!modalidade || !data || !horario) {
    return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios' });
  }
  if (!MODALIDADES.includes(modalidade)) {
    return res.status(400).json({ mensagem: 'Modalidade inválida' });
  }
  if (!dataValida(data) || data < hoje || data > somarDias(hoje, DIAS_ANTECEDENCIA - 1)) {
    return res.status(400).json({ mensagem: `Escolha uma data entre hoje e os próximos ${DIAS_ANTECEDENCIA} dias` });
  }
  if (!horarioValido(data, horario)) {
    return res.status(400).json({ mensagem: 'Esse horário não faz parte do funcionamento do ginásio nesse dia' });
  }
  if (horarioJaPassou(data, horario)) {
    return res.status(400).json({ mensagem: 'Esse horário já começou. Escolha outro' });
  }

  try {
    const reserva = await comTransacao(async (conexao) => {
      const [bloqueio] = await conexao.query(
        'SELECT motivo FROM bloqueios WHERE data_bloqueio = ? AND horario = ? FOR UPDATE',
        [data, horario],
      );
      if (bloqueio.length > 0) {
        throw new ErroDeRegra(409, `Esse horário está reservado para a escola (${bloqueio[0].motivo})`);
      }

      const [[ativas]] = await conexao.query(
        `SELECT COUNT(*) AS total FROM reservas
         WHERE usuario_id = ? AND status = 'ativa'
           AND (data_reserva > ? OR (data_reserva = ? AND horario > ?))`,
        [req.usuario.id, hoje, hoje, horaAtual()],
      );
      if (ativas.total >= LIMITE_RESERVAS_ATIVAS) {
        throw new ErroDeRegra(
          409,
          `Você já tem ${LIMITE_RESERVAS_ATIVAS} reservas marcadas, que é o limite. Cancele uma ou espere ela acontecer para reservar de novo`,
        );
      }

      const [[noDia]] = await conexao.query(
        "SELECT COUNT(*) AS total FROM reservas WHERE usuario_id = ? AND status = 'ativa' AND data_reserva = ?",
        [req.usuario.id, data],
      );
      if (noDia.total >= LIMITE_RESERVAS_POR_DIA) {
        throw new ErroDeRegra(
          409,
          'Você já tem uma reserva nesse dia. Para todo mundo conseguir usar o ginásio, é permitida 1 reserva por dia',
        );
      }

      const [resultado] = await conexao.query(
        'INSERT INTO reservas (usuario_id, modalidade, data_reserva, horario) VALUES (?, ?, ?, ?)',
        [req.usuario.id, modalidade, data, horario],
      );
      return { id: resultado.insertId, modalidade, data, horario, situacao: 'ativa' };
    });
    res.status(201).json(reserva);
  } catch (erro) {
    if (erro instanceof ErroDeRegra) {
      return res.status(erro.status).json({ mensagem: erro.message });
    }
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensagem: 'Alguém acabou de reservar esse horário. Escolha outro' });
    }
    if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(401).json({ mensagem: 'Sua sessão expirou. Faça login novamente' });
    }
    next(erro);
  }
});

rotas.delete('/:id', exigirLogin, async (req, res, next) => {
  try {
    const [linhas] = await pool.query(
      'SELECT id, data_reserva, horario, status FROM reservas WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.usuario.id],
    );
    const reserva = linhas[0];
    if (!reserva) {
      return res.status(404).json({ mensagem: 'Reserva não encontrada' });
    }
    if (reserva.status !== 'ativa') {
      return res.status(409).json({ mensagem: 'Essa reserva já foi cancelada' });
    }
    if (horarioJaPassou(reserva.data_reserva, reserva.horario)) {
      return res.status(409).json({ mensagem: 'Não é possível cancelar uma reserva que já começou' });
    }
    await pool.query(
      "UPDATE reservas SET status = 'cancelada_usuario', cancelado_em = NOW() WHERE id = ? AND status = 'ativa'",
      [reserva.id],
    );
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
});

module.exports = rotas;
