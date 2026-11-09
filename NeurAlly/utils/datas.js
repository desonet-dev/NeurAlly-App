// Funções de data usadas pelas consultas. As datas ficam guardadas como texto "AAAA-MM-DD"
// (o mesmo formato do calendário) e os horários como "9:00" / "10:30".

const DIAS_LONGOS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const DIAS_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Duração considerada para saber se uma consulta de hoje já terminou.
const DURACAO_CONSULTA_MIN = 60;

export function paraISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function hojeISO() {
  return paraISO(new Date());
}

// Cria a data no fuso local (new Date('2026-11-09') usaria UTC e poderia cair no dia anterior).
export function dataDeISO(iso) {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

// "Segunda-feira, 9 Nov."
export function formatarDataLonga(iso) {
  const d = dataDeISO(iso);
  return `${DIAS_LONGOS[d.getDay()]}, ${d.getDate()} ${MESES_ABREV[d.getMonth()]}.`;
}

// "09/11/2026"
export function formatarDataBR(iso) {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function nomeDoDia(iso) {
  return DIAS_LONGOS[dataDeISO(iso).getDay()];
}

export function diaDoMes(iso) {
  return dataDeISO(iso).getDate();
}

export function mesAbreviado(iso) {
  return MESES_ABREV[dataDeISO(iso).getMonth()];
}

// Data e hora de início da consulta ({ data: '2026-11-09', horario: '9:30' }).
export function inicioDaConsulta({ data, horario }) {
  const d = dataDeISO(data);
  const [hora, minuto] = String(horario || '0:00').split(':').map(Number);
  d.setHours(hora || 0, minuto || 0, 0, 0);
  return d;
}

function minutosDoHorario(horario) {
  const [hora, minuto] = String(horario || '0:00').split(':').map(Number);
  return (hora || 0) * 60 + (minuto || 0);
}

function minutosParaTexto(total) {
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

// "9:00" -> "09:00 - 10:00"
export function faixaDeHorario(horario) {
  const inicio = minutosDoHorario(horario);
  return `${minutosParaTexto(inicio)} - ${minutosParaTexto(inicio + DURACAO_CONSULTA_MIN)}`;
}

// Blocos de 30 min que uma consulta ocupa: "9:00" -> ["09:00", "09:30"].
// Usado para reservar o horário do psicólogo e impedir consultas que se sobreponham.
export function blocosDaConsulta(horario) {
  const inicio = minutosDoHorario(horario);
  return Array.from({ length: DURACAO_CONSULTA_MIN / 30 }, (_, i) => minutosParaTexto(inicio + i * 30));
}

// A consulta ainda vale se não terminou (início + duração ainda não passou).
export function consultaEhFutura(consulta, agora = new Date()) {
  const fim = inicioDaConsulta(consulta).getTime() + DURACAO_CONSULTA_MIN * 60 * 1000;
  return fim >= agora.getTime();
}

// Chave para ordenar por data e horário ("9:00" vira "09:00").
export function chaveDeOrdem({ data, horario }) {
  return `${data} ${String(horario || '').padStart(5, '0')}`;
}

// Os 7 dias da semana atual, de segunda a domingo.
export function diasDaSemana(base = new Date()) {
  const desdeSegunda = (base.getDay() + 6) % 7;
  const segunda = new Date(base.getFullYear(), base.getMonth(), base.getDate() - desdeSegunda);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(segunda.getFullYear(), segunda.getMonth(), segunda.getDate() + i);
    return { iso: paraISO(d), abrv: DIAS_ABREV[d.getDay()], dia: d.getDate() };
  });
}
