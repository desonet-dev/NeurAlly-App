import * as Crypto from 'expo-crypto';
import { ABRE_ANTES_MIN, FECHA_DEPOIS_MIN } from '../constants/video.js';
import { DURACAO_CONSULTA_MIN, inicioDaConsulta } from './datas.js';

// Só consultas on-line e não canceladas têm chamada de vídeo.
export function consultaTemVideo(consulta) {
  return !!consulta && consulta.modalidade === 'online' && consulta.status !== 'cancelada';
}

// Quando a sala abre e fecha para uma consulta.
export function janelaDaChamada(consulta) {
  const inicio = inicioDaConsulta(consulta);
  const fim = new Date(inicio.getTime() + DURACAO_CONSULTA_MIN * 60 * 1000);
  return {
    inicio,
    fim,
    abreEm: new Date(inicio.getTime() - ABRE_ANTES_MIN * 60 * 1000),
    fechaEm: new Date(fim.getTime() + FECHA_DEPOIS_MIN * 60 * 1000),
  };
}

// Onde estamos em relação à janela da chamada:
//  'cedo' (a sala ainda não abriu), 'aberta' (dá para entrar) ou 'encerrada' (já passou).
export function situacaoDaJanela(consulta, agora = new Date()) {
  const janela = janelaDaChamada(consulta);
  const t = agora.getTime();
  let situacao = 'aberta';
  if (t < janela.abreEm.getTime()) situacao = 'cedo';
  else if (t > janela.fechaEm.getTime()) situacao = 'encerrada';

  return {
    ...janela,
    situacao,
    minutosParaAbrir: Math.max(0, Math.ceil((janela.abreEm.getTime() - t) / 60000)),
  };
}

// Nome da sala: aleatório e impossível de adivinhar (o endereço da sala é o que protege a consulta).
const ALFABETO = 'abcdefghijklmnopqrstuvwxyz0123456789';
export function gerarCodigoDaSala(bytes = Crypto.getRandomBytes(24)) {
  let codigo = '';
  for (let i = 0; i < bytes.length; i += 1) codigo += ALFABETO[bytes[i] % ALFABETO.length];
  return `neurally-${codigo}`;
}

// Endereço para entrar na sala. As opções vão no "#" (não são enviadas ao servidor):
//  - sem o aviso "abrir no aplicativo" do celular; sem convite para terceiros; com o seu nome já preenchido.
export function montarUrlDaSala({ servidor, sala, nome }) {
  const opcoes = [
    'config.disableDeepLinking=true',
    'config.disableInviteFunctions=true',
    `config.subject=${encodeURIComponent('"Consulta NeurAlly"')}`,
    `userInfo.displayName=${encodeURIComponent(JSON.stringify(nome || 'Participante'))}`,
  ];
  return `${String(servidor).replace(/\/$/, '')}/${sala}#${opcoes.join('&')}`;
}

// Só os campos necessários, simples de enviar entre telas (a consulta do banco traz datas do Firestore).
export function consultaParaNavegacao(c) {
  return {
    id: c.id,
    profissionalId: c.profissionalId || null,
    clienteId: c.clienteId || null,
    profissionalNome: c.profissionalNome || '',
    clienteNome: c.clienteNome || '',
    data: c.data,
    horario: c.horario,
    modalidade: c.modalidade,
    status: c.status || 'agendada',
  };
}

// Para onde levar a pessoa ao tocar num lembrete de consulta: consulta on-line com a sala disponível
// abre a sala; qualquer outra abre a lista de consultas (cliente: Agendamento; psicólogo: Agenda).
export function destinoDoLembrete(consultas, dados, papel, agora = new Date()) {
  const consulta = (consultas || []).find((c) => c.id === dados?.consultaId);
  if (consulta && consultaTemVideo(consulta) && situacaoDaJanela(consulta, agora).situacao === 'aberta') {
    return { rota: 'SalaConsulta', params: { consulta: consultaParaNavegacao(consulta) } };
  }
  return { rota: papel === 'profissional' ? 'AgendaPsi' : 'Agendamento', params: undefined };
}
