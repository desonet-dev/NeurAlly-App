import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig.js';
import { garantirLogado } from './authService.js';
import {
  aplicarRecompensaDoDiario,
  diasComRegistro,
  normalizarEstado,
  sincronizarComRegistros,
} from '../utils/jardim.js';

// O jogo fica salvo em usuarios/{uid}/jardim/estado (as regras do Firestore já liberam as
// subcoleções do próprio usuário). O progresso vem do diário emocional: cada registro rende gotas
// e os dias com registro liberam novas sementes.

function referenciaDoJardim(uid) {
  return doc(db, 'usuarios', uid, 'jardim', 'estado');
}

// Registros do diário em forma simples: [{ id, emocao, data }]
export async function lerRegistrosDoDiario(uid) {
  const resultado = await getDocs(collection(db, 'usuarios', uid, 'diario'));
  return resultado.docs.map((d) => ({ id: d.id, emocao: d.data().emocao, data: d.data().data }));
}

export async function carregarJardim() {
  const uid = await garantirLogado();
  const instantaneo = await getDoc(referenciaDoJardim(uid));
  return normalizarEstado(instantaneo.exists() ? instantaneo.data() : null);
}

export async function salvarJardim(estado) {
  const uid = await garantirLogado();
  await setDoc(referenciaDoJardim(uid), estado);
}

// Chamado logo depois de salvar um registro no diário: dá as gotas, libera sementes e devolve o que
// mostrar para a pessoa: { gotasGanhas, mensagem, novasEspecies, dias }.
export async function premiarRegistroDoDiario({ registroId, emocao }) {
  const uid = await garantirLogado();
  const estado = await carregarJardim();
  const registros = await lerRegistrosDoDiario(uid);

  const resultado = aplicarRecompensaDoDiario(estado, registroId, emocao, diasComRegistro(registros));
  await salvarJardim(resultado.estado);

  return {
    gotasGanhas: resultado.gotasGanhas,
    mensagem: resultado.mensagem,
    novasEspecies: resultado.novasEspecies,
    dias: diasComRegistro(registros),
  };
}

// Ao abrir o jardim: confere o diário e credita o que ainda não foi creditado (por exemplo, registros
// antigos ou um prêmio que não deu para gravar na hora). Devolve { estado, gotasGanhas, novasEspecies, dias }.
export async function sincronizarJardimComDiario(estado) {
  const uid = await garantirLogado();
  const registros = await lerRegistrosDoDiario(uid);
  const resultado = sincronizarComRegistros(estado, registros);
  return resultado;
}
