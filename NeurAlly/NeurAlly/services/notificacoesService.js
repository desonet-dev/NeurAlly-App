import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { formatarDataLonga, inicioDaConsulta } from '../utils/datas.js';

// Lembretes de consultas: notificações LOCAIS agendadas no próprio aparelho (não dependem de
// servidor nem de internet e continuam valendo com o app fechado).
// Funcionam no Expo Go, no build de desenvolvimento e no app instalado. Na web não há suporte.

const CANAL = 'consultas';
const PREFIXO = 'consulta-';
// iOS guarda no máximo 64 notificações agendadas por app.
const LIMITE_AGENDADAS = 60;

// Quanto tempo ANTES da consulta cada lembrete é enviado (em minutos).
// Para mudar os avisos, é só editar esta lista (ex.: [24 * 60, 60, 15]).
export const ANTECEDENCIAS_MIN = [24 * 60, 60];

const suportado = Platform.OS !== 'web';

if (suportado) {
  // Mostra o aviso mesmo com o app aberto (por padrão ele só apareceria com o app fechado).
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

function textoDoLembrete(consulta, papel, minutosAntes) {
  const quem =
    papel === 'profissional'
      ? `com ${consulta.clienteNome || 'o paciente'}`
      : `com ${consulta.profissionalNome || 'o profissional'}`;
  const tipo = consulta.modalidade === 'online' ? 'on-line' : 'presencial';

  if (minutosAntes >= 24 * 60) {
    return {
      titulo: 'Consulta amanhã',
      corpo: `Você tem uma consulta ${tipo} ${quem} amanhã (${formatarDataLonga(consulta.data)}) às ${consulta.horario}.`,
    };
  }
  if (minutosAntes >= 60) {
    const horas = Math.round(minutosAntes / 60);
    return {
      titulo: 'Sua consulta está chegando',
      corpo: `Sua consulta ${tipo} ${quem} começa em ${horas} ${horas === 1 ? 'hora' : 'horas'}, às ${consulta.horario}.`,
    };
  }
  return {
    titulo: 'Sua consulta está chegando',
    corpo: `Sua consulta ${tipo} ${quem} começa em ${minutosAntes} minutos, às ${consulta.horario}.`,
  };
}

/**
 * Calcula quais lembretes devem existir para as consultas dadas (só os que ainda estão no futuro).
 * Função pura (não mexe no aparelho), por isso é fácil de testar.
 * O identificador inclui consulta, antecedência e o horário do aviso: se a consulta for
 * reagendada, o identificador muda e o lembrete antigo é substituído.
 */
export function montarLembretes(consultas, papel = 'cliente', agora = new Date()) {
  const lembretes = [];

  for (const consulta of consultas || []) {
    if (!consulta?.id || !consulta.data || !consulta.horario || consulta.status === 'cancelada') continue;
    const inicio = inicioDaConsulta(consulta);

    for (const minutosAntes of ANTECEDENCIAS_MIN) {
      const quando = new Date(inicio.getTime() - minutosAntes * 60 * 1000);
      if (quando.getTime() <= agora.getTime()) continue;

      const { titulo, corpo } = textoDoLembrete(consulta, papel, minutosAntes);
      lembretes.push({
        identifier: `${PREFIXO}${consulta.id}-${minutosAntes}-${quando.getTime()}`,
        consultaId: consulta.id,
        quando,
        titulo,
        corpo,
      });
    }
  }

  return lembretes.sort((a, b) => a.quando - b.quando).slice(0, LIMITE_AGENDADAS);
}

async function prepararCanalAndroid() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CANAL, {
    name: 'Lembretes de consultas',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#6196DA',
  });
}

// Pede a permissão para enviar notificações (só pergunta se ainda não foi decidido).
export async function garantirPermissaoNotificacoes() {
  if (!suportado) return false;
  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  if (atual.canAskAgain === false) return false;
  const pedida = await Notifications.requestPermissionsAsync();
  return !!pedida.granted;
}

// Evita duas sincronizações ao mesmo tempo (as consultas podem atualizar em sequência).
let fila = Promise.resolve();
function enfileirar(tarefa) {
  fila = fila.then(tarefa).catch((erro) => {
    console.warn('Erro nos lembretes de consulta:', erro?.message || erro);
  });
  return fila;
}

async function lembretesAgendados() {
  const todas = await Notifications.getAllScheduledNotificationsAsync();
  return todas.filter((n) => String(n.identifier).startsWith(PREFIXO));
}

/**
 * Deixa agendados no aparelho exatamente os lembretes das consultas informadas:
 * cria os que faltam e remove os de consultas canceladas, reagendadas ou que já passaram.
 * Pode ser chamada quantas vezes quiser (é idempotente).
 */
export function sincronizarLembretes(consultas, papel = 'cliente') {
  if (!suportado) return Promise.resolve();

  return enfileirar(async () => {
    const desejados = montarLembretes(consultas, papel);
    const idsDesejados = new Set(desejados.map((l) => l.identifier));

    const existentes = await lembretesAgendados();
    await Promise.all(
      existentes
        .filter((n) => !idsDesejados.has(n.identifier))
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
    );

    const faltando = desejados.filter((l) => !existentes.some((n) => n.identifier === l.identifier));
    if (faltando.length === 0) return;

    // Só pergunta a permissão quando existe de fato algo para lembrar.
    if (!(await garantirPermissaoNotificacoes())) return;
    await prepararCanalAndroid();

    for (const lembrete of faltando) {
      await Notifications.scheduleNotificationAsync({
        identifier: lembrete.identifier,
        content: {
          title: lembrete.titulo,
          body: lembrete.corpo,
          sound: true,
          data: { tipo: 'lembrete-consulta', consultaId: lembrete.consultaId },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: lembrete.quando,
          channelId: CANAL,
        },
      });
    }
  });
}

// Remove todos os lembretes de consulta deste aparelho (usado ao sair da conta).
export function cancelarTodosLembretes() {
  if (!suportado) return Promise.resolve();

  return enfileirar(async () => {
    const existentes = await lembretesAgendados();
    await Promise.all(existentes.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
  });
}

// Chama `aoAbrir(dados)` quando a pessoa toca em um lembrete. Devolve a função para parar de escutar.
export function aoTocarNoLembrete(aoAbrir) {
  if (!suportado) return () => {};

  const assinatura = Notifications.addNotificationResponseReceivedListener((resposta) => {
    const dados = resposta?.notification?.request?.content?.data;
    if (dados?.tipo === 'lembrete-consulta') aoAbrir(dados);
  });
  return () => assinatura.remove();
}
