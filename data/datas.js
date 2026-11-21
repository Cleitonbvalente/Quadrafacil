const SEMANA_CURTA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const SEMANA_LONGA = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
];
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESES_LONGOS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const doisDigitos = (n) => String(n).padStart(2, '0');

function paraISO(data) {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

export function deISO(texto) {
  const [ano, mes, dia] = texto.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function hojeISO() {
  return paraISO(new Date());
}

export function amanhaISO() {
  const data = new Date();
  data.setDate(data.getDate() + 1);
  return paraISO(data);
}

export function partesDaData(texto) {
  const data = deISO(texto);
  return {
    semana: texto === hojeISO() ? 'Hoje' : SEMANA_CURTA[data.getDay()],
    dia: doisDigitos(data.getDate()),
    mes: MESES[data.getMonth()],
  };
}

export function formatarData(texto) {
  if (!texto) return '';
  const data = deISO(texto);
  const dataCurta = `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}`;
  if (texto === hojeISO()) return `Hoje, ${dataCurta}`;
  if (texto === amanhaISO()) return `Amanhã, ${dataCurta}`;
  return `${SEMANA_CURTA[data.getDay()]}, ${dataCurta}`;
}

export function formatarDataLonga(texto) {
  if (!texto) return '';
  const data = deISO(texto);
  const frase = `${SEMANA_LONGA[data.getDay()]}, ${data.getDate()} de ${MESES_LONGOS[data.getMonth()]}`;
  return frase.charAt(0).toUpperCase() + frase.slice(1);
}

export function ehFimDeSemana(texto) {
  const dia = deISO(texto).getDay();
  return dia === 0 || dia === 6;
}

export function inicioDoHorario(horario) {
  return horario ? horario.split(' - ')[0] : '';
}

export function fimDoHorario(horario) {
  return horario ? horario.split(' - ')[1] : '';
}

export function formatarHora(hora) {
  return hora ? hora.replace(':00', 'h') : '';
}

export function tempoRelativo(ms) {
  const minutos = Math.floor((Date.now() - ms) / 60000);
  if (minutos < 1) return 'agora mesmo';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return 'ontem';
  if (dias < 7) return `há ${dias} dias`;
  const data = new Date(ms);
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}`;
}

export function saudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function primeiroNome(nome) {
  return (nome || '').trim().split(/\s+/)[0] || '';
}

export function iniciais(nome) {
  return (nome || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('');
}
