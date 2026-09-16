import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig.js';

export function garantirLogado() {
  return new Promise((resolve, reject) => {
    const cancelarEscuta = onAuthStateChanged(
      auth,
      (usuario) => {
        cancelarEscuta();
        if (usuario) {
          resolve(usuario.uid);
        } else {
          reject(new Error('Nenhum usuário logado.'));
        }
      },
      reject
    );
  });
}

function colecaoDoUsuario(uid) {
  return collection(db, 'usuarios', uid, 'diario');
}

/**
 * @param {{ titulo: string, texto: string, emocao: string, data: string }} registro
 */
export async function adicionarRegistro({ titulo, texto, emocao, data }) {
  const uid = await garantirLogado();
  await addDoc(colecaoDoUsuario(uid), {
    titulo,
    texto,
    emocao,
    data,
    criadoEm: serverTimestamp(),
  });
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
          const tempoA = a.criadoEm?.toMillis ? a.criadoEm.toMillis() : 0;
          const tempoB = b.criadoEm?.toMillis ? b.criadoEm.toMillis() : 0;
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
