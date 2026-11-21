const pool = require('../db');
const { somarDias, ehFimDeSemana, funcionamentoDoDia, horariosDoDia, horarioJaPassou } = require('../regras');

async function montarAgenda(inicio, quantidade, { usuarioId = null, comDetalhes = false } = {}) {
  const fim = somarDias(inicio, quantidade - 1);

  const [reservas] = await pool.query(
    `SELECT r.id, r.data_reserva, r.horario, r.modalidade, r.usuario_id, u.nome
     FROM reservas r
     JOIN usuarios u ON u.id = r.usuario_id
     WHERE r.status = 'ativa' AND r.data_reserva BETWEEN ? AND ?`,
    [inicio, fim],
  );
  const [bloqueios] = await pool.query(
    'SELECT id, data_bloqueio, horario, motivo FROM bloqueios WHERE data_bloqueio BETWEEN ? AND ?',
    [inicio, fim],
  );

  const reservaPorVaga = new Map(reservas.map((r) => [`${r.data_reserva}|${r.horario}`, r]));
  const bloqueioPorVaga = new Map(bloqueios.map((b) => [`${b.data_bloqueio}|${b.horario}`, b]));

  const dias = [];
  for (let i = 0; i < quantidade; i++) {
    const data = somarDias(inicio, i);
    const { abre, fecha } = funcionamentoDoDia(data);

    const horarios = horariosDoDia(data).map((horario) => {
      const chave = `${data}|${horario}`;
      const reserva = reservaPorVaga.get(chave);
      const bloqueio = bloqueioPorVaga.get(chave);

      let status = 'livre';
      if (bloqueio) status = 'escola';
      else if (horarioJaPassou(data, horario)) status = 'passado';
      else if (reserva) status = usuarioId && reserva.usuario_id === usuarioId ? 'minha' : 'reservado';

      const item = { horario, status };
      if (bloqueio) item.motivo = bloqueio.motivo;
      if (comDetalhes) {
        item.bloqueio = bloqueio ? { id: bloqueio.id, motivo: bloqueio.motivo } : null;
        item.reserva = reserva ? { id: reserva.id, nome: reserva.nome, modalidade: reserva.modalidade } : null;
      }
      return item;
    });

    dias.push({
      data,
      fimDeSemana: ehFimDeSemana(data),
      abre: `${String(abre).padStart(2, '0')}:00`,
      fecha: `${String(fecha).padStart(2, '0')}:00`,
      horarios,
    });
  }
  return dias;
}

module.exports = { montarAgenda };
