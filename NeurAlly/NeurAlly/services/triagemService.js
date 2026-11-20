import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig.js';
import { garantirLogado } from './authService.js';

// Um único documento por usuário: refazer a triagem substitui o resultado anterior.
function documentoDaTriagem(uid) {
  return doc(db, 'usuarios', uid, 'triagem', 'atual');
}

/**
 * @param {{
 *   respostas: { id: string, pergunta: string, opcao: string, texto: string }[],
 *   urgencia: string
 * }} triagem
 */
export async function salvarTriagem({ respostas, urgencia }) {
  const uid = await garantirLogado();
  await setDoc(documentoDaTriagem(uid), {
    respostas,
    urgencia,
    versao: 1,
    concluidaEm: serverTimestamp(),
  });
}

export async function buscarTriagem() {
  const uid = await garantirLogado();
  const snapshot = await getDoc(documentoDaTriagem(uid));
  return snapshot.exists() ? snapshot.data() : null;
}
