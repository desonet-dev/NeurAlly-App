import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig.js';
import { guardarTipoLocal } from './perfilLocal.js';
import { publicarPsicologo } from './profissionaisService.js';

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
  guardarTipoLocal(credencial.user.uid, tipo);
  if (tipo === 'psicologo') publicarPsicologo(credencial.user.uid, { nome, crp });

  return credencial.user;
}

// Cria/completa o documento usuarios/{uid}. Usado no primeiro acesso com Google, quando a conta
// do Firebase Auth já existe mas ainda não há tipo (cliente/psicólogo), CPF etc.
export async function completarPerfil(uid, {
  nome,
  email,
  tipo,
  dataNascimento = '',
  cpf = '',
  telefone = '',
  crp = '',
}) {
  await setDoc(
    doc(db, 'usuarios', uid),
    {
      nome,
      email,
      tipo,
      dataNascimento,
      cpf,
      telefone,
      ...(tipo === 'psicologo' ? { crp } : {}),
      criadoEm: serverTimestamp(),
    },
    { merge: true }
  );
  guardarTipoLocal(uid, tipo);
  if (tipo === 'psicologo') publicarPsicologo(uid, { nome, crp });
}

// Decide para qual tela ir depois de entrar. Sem `tipo` o cadastro está incompleto
// (o documento pode existir só com os campos de presença online).
export function rotaInicial(perfil) {
  if (!perfil?.tipo) return 'CompletarCadastro';
  return perfil.tipo === 'psicologo' ? 'HomePsi' : 'Home';
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

// A conta tem senha própria (e-mail/senha)? Contas criadas só com o Google não têm.
export function contaUsaSenha() {
  return !!auth.currentUser?.providerData?.some((p) => p.providerId === 'password');
}

// Confirma a senha atual (o Firebase exige login recente para operações sensíveis).
export async function confirmarSenhaAtual(senhaAtual) {
  const usuario = auth.currentUser;
  if (!usuario?.email) throw Object.assign(new Error('Nenhum usuario logado.'), { code: 'auth/no-current-user' });
  await reauthenticateWithCredential(usuario, EmailAuthProvider.credential(usuario.email, senhaAtual));
}

// Troca a senha: confirma a atual e grava a nova.
export async function alterarSenha({ senhaAtual, novaSenha }) {
  await confirmarSenhaAtual(senhaAtual);
  await updatePassword(auth.currentUser, novaSenha);
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

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Igual a buscarPerfil, mas tenta de novo quando a leitura falha por conexão instável
// (ex.: "client is offline" logo que o app abre). Só desiste depois de algumas tentativas.
// Erro de leitura NÃO é o mesmo que "perfil sem tipo": quem chama deve tratar os dois casos separados.
export async function buscarPerfilComTentativas(uid, tentativas = 3) {
  let ultimoErro;
  for (let i = 0; i < tentativas; i++) {
    try {
      return await buscarPerfil(uid);
    } catch (erro) {
      ultimoErro = erro;
      if (erro?.code === 'permission-denied') break; // tentar de novo não resolve
      if (i < tentativas - 1) await esperar(800 * (i + 1));
    }
  }
  throw ultimoErro;
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
    case 'auth/requires-recent-login':
      return 'Por segurança, saia da conta, entre novamente e tente de novo.';
    case 'auth/network-request-failed':
      return 'Falha de conexão. Verifique sua internet e tente novamente.';
    case 'auth/configuration-not-found':
      return 'O login por e-mail/senha ainda não foi ativado no Firebase. Veja o FIREBASE_SETUP.md.';
    default:
      return 'Algo deu errado. Tente novamente em instantes.';
  }
}
