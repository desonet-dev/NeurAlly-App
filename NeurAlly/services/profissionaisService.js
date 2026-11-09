import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig.js';

// Diretório público de psicólogos: psicologos/{uid} guarda só o que o cliente precisa ver na busca
// (nome e CRP). Dados sensíveis (CPF, telefone, nascimento) ficam apenas em usuarios/{uid}.
const jaPublicados = new Set();

export async function publicarPsicologo(uid, { nome, crp = '', especialidade = '' }) {
  if (!uid || jaPublicados.has(uid)) return;
  try {
    await setDoc(doc(db, 'psicologos', uid), { nome: nome || '', crp, especialidade }, { merge: true });
    jaPublicados.add(uid);
  } catch (erro) {
    console.warn('Não foi possível publicar o psicólogo no diretório:', erro?.message || erro);
  }
}

// Psicólogos cadastrados no app, no formato usado pelas telas de busca.
// `uid` identifica o psicólogo de verdade: é ele que liga a consulta à agenda dele.
export async function listarPsicologos() {
  const snapshot = await getDocs(collection(db, 'psicologos'));

  return snapshot.docs.map((d) => {
    const dados = d.data();
    return {
      id: d.id,
      uid: d.id,
      nome: dados.nome || 'Psicólogo(a)',
      exp: '',
      crp: dados.crp ? `CRP ${dados.crp}` : '',
      esp: dados.especialidade || 'Psicólogo(a)',
    };
  });
}
