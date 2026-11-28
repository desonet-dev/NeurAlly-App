import { collection, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig.js';
import { filtrarPorTexto, normalizarTexto as normalizar } from '../utils/busca.js';

// Diretório público de psicólogos: psicologos/{uid} guarda só o que o cliente precisa ver na busca
// e no perfil público (nome, CRP, especialidade, biografia e foto). Dados sensíveis (CPF, telefone,
// nascimento) ficam apenas em usuarios/{uid}.
const ultimaPublicacao = new Map();

// Cria/atualiza a ficha pública do psicólogo. Só grava de novo quando algo mudou (nome, CRP, foto...).
export async function publicarPsicologo(uid, perfil = {}) {
  if (!uid) return;
  const dados = {
    nome: perfil.nomeSocial || perfil.nome || '',
    crp: perfil.crp || '',
    especialidade: perfil.especialidade || '',
    biografia: perfil.biografia || '',
    foto: perfil.foto || '',
  };
  const assinatura = JSON.stringify(dados);
  if (ultimaPublicacao.get(uid) === assinatura) return;

  try {
    await setDoc(doc(db, 'psicologos', uid), dados, { merge: true });
    ultimaPublicacao.set(uid, assinatura);
  } catch (erro) {
    console.warn('Não foi possível publicar o psicólogo no diretório:', erro?.message || erro);
  }
}

function paraProfissional(id, dados) {
  return {
    id,
    uid: id,
    nome: dados.nome || 'Psicólogo(a)',
    exp: '',
    crp: dados.crp ? `CRP ${dados.crp}` : '',
    esp: dados.especialidade || 'Psicólogo(a)',
    bio: dados.biografia || '',
    foto: dados.foto || '',
  };
}

// Escuta, em tempo real, os psicólogos que criaram conta no app (só os de verdade, sem exemplos).
// `uid` identifica o psicólogo: é ele que liga a consulta à agenda e à conversa.
// Devolve a função para parar de escutar.
export function escutarPsicologos(aoAtualizar, aoFalhar) {
  return onSnapshot(
    collection(db, 'psicologos'),
    (snapshot) => {
      const lista = snapshot.docs.map((d) => paraProfissional(d.id, d.data()));
      aoAtualizar(lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
    },
    (erro) => {
      console.warn('Não foi possível listar os psicólogos:', erro?.message || erro);
      if (aoFalhar) aoFalhar(erro);
    }
  );
}

export async function buscarPsicologo(uid) {
  const instantaneo = await getDoc(doc(db, 'psicologos', uid));
  return instantaneo.exists() ? paraProfissional(uid, instantaneo.data()) : null;
}

// "João Mendonça" -> "joao mendonca": busca sem diferenciar maiúsculas nem acentos.
export const normalizarTexto = normalizar;

// Filtra pelo que a pessoa digitou na barra de pesquisa (nome, especialidade ou CRP).
export function filtrarProfissionais(lista, busca) {
  return filtrarPorTexto(lista, busca, (p) => [p.nome, p.esp, p.crp]);
}
