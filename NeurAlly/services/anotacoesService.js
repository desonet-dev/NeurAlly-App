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
  doc,
  query,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig.js';
import { garantirLogado } from './diarioService.js';

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
          const tempoA = a.criadoEm?.toMillis ? a.criadoEm.toMillis() : 0;
          const tempoB = b.criadoEm?.toMillis ? b.criadoEm.toMillis() : 0;
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
