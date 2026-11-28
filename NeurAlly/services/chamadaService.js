import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig.js';
import { garantirLogado } from './authService.js';
import { gerarCodigoDaSala } from '../utils/chamada.js';

// Estado da chamada de vídeo de uma consulta: chamadas/{consultaId}
//   { consultaId, profissionalId, clienteId, sala, aberta, abertaEm, encerradaEm }
// Só o psicólogo da consulta abre e encerra; os dois podem ler (regras do Firestore).
function referencia(consultaId) {
  return doc(db, 'chamadas', consultaId);
}

// Escuta, em tempo real, se o profissional já abriu a sala. Devolve a função para parar de escutar.
export function escutarChamada(consultaId, aoAtualizar, aoFalhar) {
  return onSnapshot(
    referencia(consultaId),
    (snapshot) => aoAtualizar(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
    (erro) => {
      console.warn('Erro ao escutar a chamada:', erro?.message || erro);
      if (aoFalhar) aoFalhar(erro);
    }
  );
}

// Profissional abre a sala. Se a consulta já teve uma sala (ele saiu e voltou), reaproveita o mesmo endereço.
export async function abrirChamada(consulta) {
  await garantirLogado();
  const existente = await getDoc(referencia(consulta.id));
  const sala = existente.exists() && existente.data().sala ? existente.data().sala : gerarCodigoDaSala();

  const dados = {
    consultaId: consulta.id,
    profissionalId: consulta.profissionalId,
    clienteId: consulta.clienteId,
    sala,
    aberta: true,
    abertaEm: Date.now(),
    encerradaEm: null,
  };
  await setDoc(referencia(consulta.id), dados);
  return { id: consulta.id, ...dados };
}

// Profissional encerra a chamada para todos.
export async function encerrarChamada(consultaId) {
  await garantirLogado();
  await setDoc(referencia(consultaId), { aberta: false, encerradaEm: Date.now() }, { merge: true });
}
