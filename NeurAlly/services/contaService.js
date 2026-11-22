import { collection, deleteDoc, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { auth, db } from './firebaseConfig.js';
import { confirmarSenhaAtual, contaUsaSenha } from './authService.js';
import { cancelarConsulta } from './consultasService.js';
import { pausarPresenca } from './presencaService.js';
import { sairDoGoogle } from './googleAuthService';
import { consultaEhFutura } from '../utils/datas.js';

// Subcoleções guardadas dentro de usuarios/{uid}.
const SUBCOLECOES = ['diario', 'anotacoes', 'triagem', 'jardim'];

// Contas do Google não têm senha para confirmar: o Firebase só permite excluir se o login for recente.
const LOGIN_RECENTE_MS = 4 * 60 * 1000;

function erroComCodigo(code, mensagem) {
  return Object.assign(new Error(mensagem), { code });
}

async function apagarSubcolecao(uid, nome) {
  const itens = await getDocs(collection(db, 'usuarios', uid, nome));
  // Lotes de até 400 (o limite do Firestore é 500 operações por lote).
  for (let i = 0; i < itens.docs.length; i += 400) {
    const lote = writeBatch(db);
    itens.docs.slice(i, i + 400).forEach((d) => lote.delete(d.ref));
    await lote.commit();
  }
}

// Cancela as consultas futuras da pessoa, liberando os horários na agenda do psicólogo.
async function cancelarConsultasFuturas(uid, tipo) {
  const campo = tipo === 'psicologo' ? 'profissionalId' : 'clienteId';
  const por = tipo === 'psicologo' ? 'profissional' : 'cliente';
  const resultado = await getDocs(query(collection(db, 'consultas'), where(campo, '==', uid)));

  for (const d of resultado.docs) {
    const consulta = { id: d.id, ...d.data() };
    if (consulta.status === 'agendada' && consultaEhFutura(consulta)) {
      try {
        await cancelarConsulta(consulta, por);
      } catch (erro) {
        console.warn('Não foi possível cancelar a consulta', d.id, erro?.message || erro);
      }
    }
  }
}

/**
 * Exclui a conta de forma permanente:
 *  1. confirma a identidade (senha; no Google, login recente);
 *  2. cancela as consultas futuras;
 *  3. apaga diário, anotações, triagem, o perfil público (psicólogos) e o perfil;
 *  4. apaga a conta de login.
 * Lança erros com `code` (ex.: 'auth/invalid-credential', 'auth/requires-recent-login').
 */
export async function excluirConta({ senha = '', tipo }) {
  const usuario = auth.currentUser;
  if (!usuario) throw erroComCodigo('auth/no-current-user', 'Nenhum usuario logado.');
  const uid = usuario.uid;

  // 1) Identidade
  if (contaUsaSenha()) {
    if (!senha) throw erroComCodigo('conta/senha-obrigatoria', 'Informe sua senha.');
    await confirmarSenhaAtual(senha);
  } else {
    const ultimoLogin = Date.parse(usuario.metadata?.lastSignInTime || '') || 0;
    if (Date.now() - ultimoLogin > LOGIN_RECENTE_MS) {
      throw erroComCodigo('auth/requires-recent-login', 'É preciso entrar novamente antes de excluir a conta.');
    }
  }

  pausarPresenca(true);
  try {
    // 2) e 3) Dados
    await cancelarConsultasFuturas(uid, tipo);
    for (const nome of SUBCOLECOES) await apagarSubcolecao(uid, nome);
    if (tipo === 'psicologo') {
      try {
        await deleteDoc(doc(db, 'psicologos', uid));
      } catch (erro) {
        console.warn('Não foi possível remover o perfil público:', erro?.message || erro);
      }
    }
    await deleteDoc(doc(db, 'usuarios', uid));

    // 4) Conta de login
    await deleteUser(usuario);
  } catch (erro) {
    pausarPresenca(false);
    throw erro;
  }

  try {
    await sairDoGoogle();
  } catch (erro) {
    // A conta já foi excluída; limpar a sessão do Google é só um extra.
  }
  pausarPresenca(false);
}
