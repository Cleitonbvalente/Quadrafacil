const express = require('express');
const pool = require('../db');
const { exigirEscola } = require('../auth');
const { montarAgenda } = require('../servicos/agenda');
const { comTransacao, ErroDeRegra } = require('../servicos/transacao');
const {
  DIAS_ANTECEDENCIA_ESCOLA,
  hojeISO,
  somarDias,
  dataValida,
  horarioValido,
  horarioJaPassou,
  descreverData,
  descreverHorario,
} = require('../regras');

const rotas = express.Router();

rotas.use(exigirEscola);

rotas.get('/agenda', async (req, res, next) => {
  const hoje = hojeISO();
  const inicio = dataValida(req.query.inicio) && req.query.inicio >= hoje ? req.query.inicio : hoje;
  const dias = Math.min(Math.max(Number(req.query.dias) || 30, 1), DIAS_ANTECEDENCIA_ESCOLA);
  try {
    res.json(await montarAgenda(inicio, dias, { comDetalhes: true }));
  } catch (erro) {
    next(erro);
  }
});

function mensagemDeCancelamento(reserva, motivo) {
  return (
    `Sua reserva de ${reserva.modalidade} ${descreverData(reserva.data_reserva)}, ${descreverHorario(reserva.horario)}, ` +
    `foi cancelada porque a escola vai precisar do ginásio nesse horário. Motivo: ${motivo}. ` +
    'Pedimos desculpas pelo transtorno. Você pode escolher outro horário livre na agenda.'
  );
}

rotas.post('/bloqueios', async (req, res, next) => {
  const hoje = hojeISO();
  const data = req.body.data;
  const motivo = String(req.body.motivo || '').trim();
  const horarios = Array.isArray(req.body.horarios) ? [...new Set(req.body.horarios)] : [];

  if (!dataValida(data) || data < hoje || data > somarDias(hoje, DIAS_ANTECEDENCIA_ESCOLA - 1)) {
    return res
      .status(400)
      .json({ mensagem: `Escolha uma data entre hoje e os próximos ${DIAS_ANTECEDENCIA_ESCOLA} dias` });
  }
  if (horarios.length === 0) {
    return res.status(400).json({ mensagem: 'Selecione pelo menos um horário' });
  }
  if (horarios.some((horario) => !horarioValido(data, horario))) {
    return res.status(400).json({ mensagem: 'Há horários fora do funcionamento do ginásio nesse dia' });
  }
  if (horarios.some((horario) => horarioJaPassou(data, horario))) {
    return res.status(400).json({ mensagem: 'Não é possível bloquear horários que já começaram' });
  }
  if (motivo.length < 3 || motivo.length > 200) {
    return res
      .status(400)
      .json({ mensagem: 'Informe o motivo do bloqueio (ele será enviado para quem tinha reserva)' });
  }

  try {
    const resultado = await comTransacao(async (conexao) => {
      let novos = 0;
      for (const horario of horarios) {
        const [inserido] = await conexao.query(
          'INSERT IGNORE INTO bloqueios (data_bloqueio, horario, motivo, criado_por) VALUES (?, ?, ?, ?)',
          [data, horario, motivo, req.usuario.id],
        );
        novos += inserido.affectedRows;
      }

      const [afetadas] = await conexao.query(
        `SELECT r.id, r.usuario_id, r.modalidade, r.data_reserva, r.horario, u.nome
         FROM reservas r
         JOIN usuarios u ON u.id = r.usuario_id
         WHERE r.status = 'ativa' AND r.data_reserva = ? AND r.horario IN (?)
         FOR UPDATE`,
        [data, horarios],
      );

      for (const reserva of afetadas) {
        await conexao.query(
          "UPDATE reservas SET status = 'cancelada_escola', motivo_cancelamento = ?, cancelado_em = NOW() WHERE id = ?",
          [motivo, reserva.id],
        );
        await conexao.query('INSERT INTO notificacoes (usuario_id, titulo, mensagem, reserva_id) VALUES (?, ?, ?, ?)', [
          reserva.usuario_id,
          'Reserva cancelada pela escola',
          mensagemDeCancelamento(reserva, motivo),
          reserva.id,
        ]);
      }

      return {
        bloqueados: novos,
        jaEstavamBloqueados: horarios.length - novos,
        reservasCanceladas: afetadas.map((r) => ({ nome: r.nome, horario: r.horario, modalidade: r.modalidade })),
      };
    });
    res.status(201).json(resultado);
  } catch (erro) {
    if (erro instanceof ErroDeRegra) {
      return res.status(erro.status).json({ mensagem: erro.message });
    }
    next(erro);
  }
});

rotas.post('/bloqueios/liberar', async (req, res, next) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter(Number.isInteger) : [];
  if (ids.length === 0) {
    return res.status(400).json({ mensagem: 'Selecione pelo menos um bloqueio para liberar' });
  }
  try {
    const [resultado] = await pool.query('DELETE FROM bloqueios WHERE id IN (?)', [ids]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Bloqueio não encontrado' });
    }
    res.json({ liberados: resultado.affectedRows });
  } catch (erro) {
    next(erro);
  }
});

module.exports = rotas;
