import {
  collection,
  doc,
  getDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebaseConfig.js';
import { garantirLogado } from './authService.js';
import { blocosDaConsulta, chaveDeOrdem } from '../utils/datas.js';

// Coleções (regras em firestore.rules, na raiz do projeto):
//  - consultas: uma por consulta; aparece para o cliente (clienteId) e para o psicólogo (profissionalId).
//  - reservas:  uma por bloco de 30 min ocupado na agenda de um psicólogo. O id é fixo
//               (psicólogo + dia + bloco) e as regras não deixam sobrescrever, então dois clientes
//               nunca conseguem reservar o mesmo horário. Guarda só dados não pessoais.
const COLECAO = 'consultas';
const RESERVAS = 'reservas';

function idDaReserva(profissionalId, data, bloco) {
  return `${profissionalId}_${data}_${bloco.replace(':', '')}`;
}

function erroHorarioOcupado() {
  const erro = new Error('Esse horário já está reservado.');
  erro.code = 'consulta/horario-ocupado';
  return erro;
}

/**
 * Grava uma consulta agendada pelo usuário logado (o cliente).
 * `data` no formato AAAA-MM-DD e `horario` como "9:00".
 * `profissionalId` é o uid do psicólogo; fica vazio quando o profissional é só um exemplo da lista
 * (nesse caso não há agenda para reservar).
 * Lança erro com code 'consulta/horario-ocupado' se o horário do psicólogo já foi reservado.
 */
export async function agendarConsulta({
  clienteNome = '',
  profissionalId = null,
  profissionalNome,
  profissionalEsp = '',
  data,
  horario,
  modalidade,
  metodoPagamento = '',
  valor = 0,
}) {
  const uid = await garantirLogado();
  const consultaRef = doc(collection(db, COLECAO));
  const blocos = profissionalId ? blocosDaConsulta(horario) : [];

  // Tudo ou nada: ou grava a consulta E reserva os blocos, ou não grava nada.
  const lote = writeBatch(db);
  lote.set(consultaRef, {
    clienteId: uid,
    clienteNome,
    profissionalId: profissionalId || null,
    profissionalNome,
    profissionalEsp,
    data,
    horario,
    modalidade,
    metodoPagamento,
    valor,
    status: 'agendada',
    criadoEm: serverTimestamp(),
  });
  blocos.forEach((bloco) => {
    lote.set(doc(db, RESERVAS, idDaReserva(profissionalId, data, bloco)), {
      profissionalId,
      data,
      bloco,
      clienteId: uid,
      consultaId: consultaRef.id,
      criadoEm: serverTimestamp(),
    });
  });

  try {
    await lote.commit();
  } catch (erro) {
    // Se a reserva já existia, as regras recusam o lote: confirma se foi isso para avisar direito.
    await lancarSeHorarioOcupado(blocos.map((bloco) => idDaReserva(profissionalId, data, bloco)));
    throw erro;
  }

  return consultaRef.id;
}

// Escuta em tempo real as consultas do usuário logado, já ordenadas por data e horário.
//  papel = 'cliente'      -> consultas que ele marcou (clienteId)
//  papel = 'profissional' -> consultas marcadas com ele (profissionalId)
// Devolve (via Promise) a função para parar de escutar.
export async function escutarConsultas(papel, aoAtualizar, aoFalhar) {
  const uid = await garantirLogado();
  const campo = papel === 'profissional' ? 'profissionalId' : 'clienteId';

  return onSnapshot(
    query(collection(db, COLECAO), where(campo, '==', uid)),
    (snapshot) => {
      const consultas = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => chaveDeOrdem(a).localeCompare(chaveDeOrdem(b)));
      aoAtualizar(consultas);
    },
    (erro) => {
      console.warn('Erro ao escutar consultas:', erro);
      if (aoFalhar) aoFalhar(erro);
    }
  );
}

// Escuta os blocos de 30 min já ocupados de um psicólogo num dia. Devolve um Set de "HH:MM"
// e a função para parar de escutar.
// `ignorarConsultaId`: ao reagendar, os blocos da própria consulta não contam como ocupados.
export function escutarHorariosOcupados(profissionalId, data, aoAtualizar, aoFalhar, ignorarConsultaId = null) {
  return onSnapshot(
    query(collection(db, RESERVAS), where('profissionalId', '==', profissionalId), where('data', '==', data)),
    (snapshot) =>
      aoAtualizar(
        new Set(
          snapshot.docs
            .filter((d) => !ignorarConsultaId || d.data().consultaId !== ignorarConsultaId)
            .map((d) => d.data().bloco)
        )
      ),
    (erro) => {
      console.warn('Erro ao escutar horários ocupados:', erro);
      if (aoFalhar) aoFalhar(erro);
    }
  );
}

// Confere se algum dos ids de reserva já existe (alguém reservou antes) e, se sim, lança o erro
// 'consulta/horario-ocupado'. Usado quando o lote de gravação é recusado pelas regras.
async function lancarSeHorarioOcupado(idsDeReserva) {
  for (const id of idsDeReserva) {
    try {
      const existente = await getDoc(doc(db, RESERVAS, id));
      if (existente.exists()) throw erroHorarioOcupado();
    } catch (e) {
      if (e?.code === 'consulta/horario-ocupado') throw e;
    }
  }
}

/**
 * Cancela uma consulta: marca como 'cancelada' e libera os horários reservados na agenda do
 * psicólogo (assim outra pessoa já pode marcar aquele horário). Tudo ou nada.
 *  - `consulta`: objeto vindo do useConsultas (precisa de id, profissionalId, horario).
 *  - `por`: 'cliente' ou 'profissional' (quem cancelou).
 */
export async function cancelarConsulta(consulta, por = 'cliente') {
  await garantirLogado();
  if (!consulta?.id) throw new Error('Consulta inválida.');

  const lote = writeBatch(db);
  lote.update(doc(db, COLECAO, consulta.id), {
    status: 'cancelada',
    canceladaPor: por,
    canceladaEm: serverTimestamp(),
  });

  if (consulta.profissionalId) {
    blocosDaConsulta(consulta.horario).forEach((bloco) => {
      lote.delete(doc(db, RESERVAS, idDaReserva(consulta.profissionalId, consulta.data, bloco)));
    });
  }

  await lote.commit();
}

/**
 * Reagenda uma consulta para outro dia/horário (e, se quiser, outra modalidade).
 * Libera os blocos antigos e reserva os novos no mesmo lote; se o novo horário já estiver
 * ocupado, nada muda e lança 'consulta/horario-ocupado'.
 */
export async function reagendarConsulta(consulta, { data, horario, modalidade }) {
  await garantirLogado();
  if (!consulta?.id) throw new Error('Consulta inválida.');

  const profissionalId = consulta.profissionalId || null;
  const idsAntigos = profissionalId
    ? blocosDaConsulta(consulta.horario).map((b) => idDaReserva(profissionalId, consulta.data, b))
    : [];
  const blocosNovos = profissionalId ? blocosDaConsulta(horario) : [];
  const idsNovos = blocosNovos.map((b) => idDaReserva(profissionalId, data, b));

  // Blocos que continuam sendo da consulta (ex.: 9:00 -> 9:30 mantém o bloco 9:30) não são
  // apagados nem recriados; só liberamos o que sobrou e reservamos o que é novo.
  const aLiberar = idsAntigos.filter((id) => !idsNovos.includes(id));
  const aReservar = blocosNovos.filter((_, i) => !idsAntigos.includes(idsNovos[i]));

  const lote = writeBatch(db);
  lote.update(doc(db, COLECAO, consulta.id), {
    data,
    horario,
    modalidade: modalidade || consulta.modalidade,
    reagendadaEm: serverTimestamp(),
  });
  aLiberar.forEach((id) => lote.delete(doc(db, RESERVAS, id)));
  aReservar.forEach((bloco) => {
    lote.set(doc(db, RESERVAS, idDaReserva(profissionalId, data, bloco)), {
      profissionalId,
      data,
      bloco,
      clienteId: consulta.clienteId,
      consultaId: consulta.id,
      criadoEm: serverTimestamp(),
    });
  });

  try {
    await lote.commit();
  } catch (erro) {
    await lancarSeHorarioOcupado(aReservar.map((b) => idDaReserva(profissionalId, data, b)));
    throw erro;
  }
}
