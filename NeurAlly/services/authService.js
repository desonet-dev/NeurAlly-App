import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig.js';

export async function cadastrarUsuario({
  nome,
  email,
  senha,
  tipo,
  dataNascimento = '',
  cpf = '',
  telefone = '',
  crp = '',
}) {
  const credencial = await createUserWithEmailAndPassword(auth, email, senha);

  await setDoc(doc(db, 'usuarios', credencial.user.uid), {
    nome,
    email,
    tipo,
    dataNascimento,
    cpf,
    telefone,
    ...(tipo === 'psicologo' ? { crp } : {}),
    criadoEm: serverTimestamp(),
  });

  return credencial.user;
}

export async function entrarComEmailSenha({ email, senha }) {
  const credencial = await signInWithEmailAndPassword(auth, email, senha);
  return credencial.user;
}

export function sair() {
  return signOut(auth);
}

export function recuperarSenha({ email }) {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Espera a confirmacao do Firebase de que existe alguem logado e devolve
 * o uid. Usado pelos servicos de dados (diario, anotacoes) antes de ler
 * ou gravar qualquer coisa no Firestore.
 */
export function garantirLogado() {
  return new Promise((resolve, reject) => {
    const cancelarEscuta = onAuthStateChanged(
      auth,
      (usuario) => {
        cancelarEscuta();
        if (usuario) {
          resolve(usuario.uid);
        } else {
          reject(new Error('Nenhum usuario logado.'));
        }
      },
      reject
    );
  });
}

export async function buscarPerfil(uid) {
  const snapshot = await getDoc(doc(db, 'usuarios', uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export function observarAutenticacao(aoMudar) {
  return onAuthStateChanged(auth, aoMudar);
}

export function traduzErroFirebase(erro) {
  const codigo = erro?.code || '';
  switch (codigo) {
    case 'auth/invalid-email':
      return 'O e-mail digitado não é válido.';
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'E-mail ou senha incorretos.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas seguidas. Aguarde um pouco e tente novamente.';
    case 'auth/email-already-in-use':
      return 'Já existe uma conta cadastrada com esse e-mail.';
    case 'auth/weak-password':
      return 'A senha precisa ter pelo menos 6 caracteres.';
    case 'auth/network-request-failed':
      return 'Falha de conexão. Verifique sua internet e tente novamente.';
    case 'auth/configuration-not-found':
      return 'O login por e-mail/senha ainda não foi ativado no Firebase. Veja o FIREBASE_SETUP.md.';
    default:
      return 'Algo deu errado. Tente novamente em instantes.';
  }
}
