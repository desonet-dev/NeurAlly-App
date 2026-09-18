// ============================================================================
// SERVIÇO DE ANOTAÇÕES DO PSICÓLOGO (Firebase Firestore)
// ============================================================================
// Anotações que o profissional faz sobre atendimentos/pacientes.
//
// Estrutura salva no Firestore:
//   usuarios/{uid}/anotacoes/{anotacaoId}
//     - titulo: string
//     - texto: string
//     - paciente: string (nome do paciente, opcional)
//     - criadoEm: timestamp do servidor (usado para ordenar)
//
// As regras de segurança do Firestore (veja FIREBASE_SETUP.md) garantem
// que cada profissional só acessa as próprias anotações.
// ============================================================================

import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig.js';
import { garantirLogado } from './authService.js';

function colecaoDoUsuario(uid) {
  return collection(db, 'usuarios', uid, 'anotacoes');
}

/**
 * Adiciona uma nova anotação.
 * @param {{ titulo: string, texto: string, paciente?: string }} anotacao
 */
export async function adicionarAnotacao({ titulo, texto, paciente = '' }) {
  const uid = await garantirLogado();
  await addDoc(colecaoDoUsuario(uid), {
    titulo,
    texto,
    paciente,
    criadoEm: serverTimestamp(),
  });
}

/**
 * Atualiza uma anotação existente.
 * @param {string} id
 * @param {{ titulo: string, texto: string, paciente?: string }} anotacao
 */
export async function atualizarAnotacao(id, { titulo, texto, paciente = '' }) {
  const uid = await garantirLogado();
  await updateDoc(doc(db, 'usuarios', uid, 'anotacoes', id), {
    titulo,
    texto,
    paciente,
    atualizadoEm: serverTimestamp(),
  });
}

/** Apaga uma anotação pelo id. */
export async function removerAnotacao(id) {
  const uid = await garantirLogado();
  await deleteDoc(doc(db, 'usuarios', uid, 'anotacoes', id));
}

/**
 * Escuta em tempo real todas as anotações do profissional, da mais
 * recente para a mais antiga. Retorna uma Promise que resolve para a
 * função de cancelar a escuta.
 */
export async function escutarAnotacoes(aoAtualizar, aoFalhar) {
  const uid = await garantirLogado();
  // Ordenamos no próprio app (e não com orderBy no Firestore) para não
  // exigir a criação de índices extras no console do Firebase.
  const consulta = query(colecaoDoUsuario(uid));

  return onSnapshot(
    consulta,
    (snapshot) => {
      const anotacoes = snapshot.docs
        .map((documento) => ({ id: documento.id, ...documento.data() }))
        .sort((a, b) => {
          // Logo apos addDoc, o serverTimestamp ainda nao voltou do servidor
          // e criadoEm vem null. Tratamos esse caso como "agora" para a
          // anotacao recem-criada ja aparecer no topo, sem pular de lugar
          // quando a confirmacao chega.
          const tempoA = a.criadoEm?.toMillis ? a.criadoEm.toMillis() : Number.MAX_SAFE_INTEGER;
          const tempoB = b.criadoEm?.toMillis ? b.criadoEm.toMillis() : Number.MAX_SAFE_INTEGER;
          return tempoB - tempoA; // mais recentes primeiro
        });
      aoAtualizar(anotacoes);
    },
    (erro) => {
      console.warn('Erro ao escutar anotações:', erro);
      if (aoFalhar) aoFalhar(erro);
    }
  );
}
