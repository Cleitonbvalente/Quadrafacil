export function resumoDoDia(dia) {
  const resumo = { livre: 0, reservado: 0, escola: 0, minha: 0, passado: 0 };
  for (const item of dia?.horarios || []) {
    resumo[item.status] = (resumo[item.status] || 0) + 1;
  }
  return resumo;
}

export function marcadoresDaAgenda(agenda) {
  const marcadores = {};
  for (const dia of agenda) {
    const tipos = new Set(dia.horarios.map((h) => h.status));
    marcadores[dia.data] = ['minha', 'escola', 'reservado'].filter((tipo) => tipos.has(tipo));
  }
  return marcadores;
}

export function primeiroDiaDisponivel(agenda, status = ['livre']) {
  const encontrado = agenda.find((dia) => dia.horarios.some((h) => status.includes(h.status)));
  return (encontrado || agenda[0])?.data ?? null;
}

export function textoLivres(quantidade) {
  if (quantidade === 0) return 'Nenhum horário livre';
  return quantidade === 1 ? '1 horário livre' : `${quantidade} horários livres`;
}
