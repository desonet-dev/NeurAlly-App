import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebaseConfig.js';
import { garantirLogado } from './authService.js';

function colecaoDoUsuario(uid) {
  return collection(db, 'usuarios', uid, 'diario');
}

/**
 * @param {{ titulo: string, texto: string, emocao: string, data: string }} registro
 */
export async function adicionarRegistro({ titulo, texto, emocao, data }) {
  const uid = await garantirLogado();
  const referencia = await addDoc(colecaoDoUsuario(uid), {
    titulo,
    texto,
    emocao,
    data,
    criadoEm: serverTimestamp(),
  });
  // Devolve o id para o Jardim Zen poder dar as gotas deste registro.
  return referencia?.id;
}

export async function escutarRegistrosPorData(data, aoAtualizar, aoFalhar) {
  const uid = await garantirLogado();
  const consulta = query(colecaoDoUsuario(uid), where('data', '==', data));

  return onSnapshot(
    consulta,
    (snapshot) => {
      const registros = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          // Enquanto o serverTimestamp nao volta do servidor, criadoEm vem
          // null; tratamos como "agora" para o registro recem-criado ja
          // entrar na posicao certa (no fim, por ordem crescente).
          const tempoA = a.criadoEm?.toMillis ? a.criadoEm.toMillis() : Number.MAX_SAFE_INTEGER;
          const tempoB = b.criadoEm?.toMillis ? b.criadoEm.toMillis() : Number.MAX_SAFE_INTEGER;
          return tempoA - tempoB;
        });
      aoAtualizar(registros);
    },
    (erro) => {
      console.warn('Erro ao escutar registros do diário:', erro);
      if (aoFalhar) aoFalhar(erro);
    }
  );
}

export async function escutarDatasComRegistro(aoAtualizar, aoFalhar) {
  const uid = await garantirLogado();
  const consulta = query(colecaoDoUsuario(uid));

  return onSnapshot(
    consulta,
    (snapshot) => {
      const datas = new Set(snapshot.docs.map((doc) => doc.data().data));
      aoAtualizar(datas);
    },
    (erro) => {
      console.warn('Erro ao escutar datas do diário:', erro);
      if (aoFalhar) aoFalhar(erro);
    }
  );
}

// Apaga um único registro do diário (não dá para desfazer).
export async function excluirRegistro(id) {
  const uid = await garantirLogado();
  await deleteDoc(doc(db, 'usuarios', uid, 'diario', id));
}

/**
 * Apaga TODOS os registros do diário emocional de quem está logado (não dá para desfazer).
 * Devolve quantos registros foram excluídos.
 */
export async function excluirTodosRegistros() {
  const uid = await garantirLogado();
  const itens = await getDocs(colecaoDoUsuario(uid));

  // Lotes de até 400 (o limite do Firestore é 500 operações por lote).
  for (let i = 0; i < itens.docs.length; i += 400) {
    const lote = writeBatch(db);
    itens.docs.slice(i, i + 400).forEach((d) => lote.delete(d.ref));
    await lote.commit();
  }
  return itens.docs.length;
}
