const MODALIDADES = ['Futsal', 'Vôlei', 'Basquete', 'Handebol', 'Badminton', 'Outro'];

const FUNCIONAMENTO = {
  diasUteis: { abre: 17, fecha: 22 },
  fimDeSemana: { abre: 7, fecha: 22 },
};

const DIAS_ANTECEDENCIA = 7;
const DIAS_ANTECEDENCIA_ESCOLA = 60;
const LIMITE_RESERVAS_ATIVAS = 3;
const LIMITE_RESERVAS_POR_DIA = 1;

const DIAS_COM_ARTIGO = [
  'no domingo',
  'na segunda-feira',
  'na terça-feira',
  'na quarta-feira',
  'na quinta-feira',
  'na sexta-feira',
  'no sábado',
];

const doisDigitos = (n) => String(n).padStart(2, '0');

function paraISO(data) {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

function deISO(texto) {
  const [ano, mes, dia] = texto.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

function hojeISO() {
  return paraISO(new Date());
}

function somarDias(texto, quantidade) {
  const data = deISO(texto);
  data.setDate(data.getDate() + quantidade);
  return paraISO(data);
}

function horaAtual() {
  const agora = new Date();
  return `${doisDigitos(agora.getHours())}:${doisDigitos(agora.getMinutes())}`;
}

function dataValida(texto) {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const [ano, mes, dia] = texto.split('-').map(Number);
  const data = deISO(texto);
  return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
}

function ehFimDeSemana(texto) {
  const dia = deISO(texto).getDay();
  return dia === 0 || dia === 6;
}

function funcionamentoDoDia(texto) {
  return ehFimDeSemana(texto) ? FUNCIONAMENTO.fimDeSemana : FUNCIONAMENTO.diasUteis;
}

function horariosDoDia(texto) {
  const { abre, fecha } = funcionamentoDoDia(texto);
  const lista = [];
  for (let hora = abre; hora < fecha; hora++) {
    lista.push(`${doisDigitos(hora)}:00 - ${doisDigitos(hora + 1)}:00`);
  }
  return lista;
}

function horarioValido(texto, horario) {
  return horariosDoDia(texto).includes(horario);
}

function inicioDoHorario(horario) {
  return horario.split(' - ')[0];
}

function horarioJaPassou(texto, horario) {
  const hoje = hojeISO();
  if (texto < hoje) return true;
  if (texto > hoje) return false;
  return inicioDoHorario(horario) <= horaAtual();
}

function emailValido(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function descreverData(texto) {
  const data = deISO(texto);
  return `${DIAS_COM_ARTIGO[data.getDay()]}, ${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}`;
}

function descreverHorario(horario) {
  const [inicio, fim] = horario.split(' - ');
  return `das ${inicio.replace(':00', 'h')} às ${fim.replace(':00', 'h')}`;
}

module.exports = {
  MODALIDADES,
  FUNCIONAMENTO,
  DIAS_ANTECEDENCIA,
  DIAS_ANTECEDENCIA_ESCOLA,
  LIMITE_RESERVAS_ATIVAS,
  LIMITE_RESERVAS_POR_DIA,
  hojeISO,
  somarDias,
  horaAtual,
  dataValida,
  ehFimDeSemana,
  funcionamentoDoDia,
  horariosDoDia,
  horarioValido,
  horarioJaPassou,
  emailValido,
  descreverData,
  descreverHorario,
};
