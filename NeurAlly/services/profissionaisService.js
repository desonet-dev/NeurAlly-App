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

// Exemplos mostrados enquanto ainda não há psicólogos cadastrados no app (não têm uid, então
// não dão acesso a uma agenda nem a uma conversa de verdade).
export const PROFISSIONAIS_EXEMPLO = [
  { id: '1', nome: 'João Mendonça', exp: '25 anos de atuação', crp: 'CRP XX/00000', esp: 'Especialista em Neuropsicologia' },
  { id: '2', nome: 'Caroline de Jesus', exp: '25 anos de atuação', crp: 'CRP XX/00000', esp: 'Especialista em Neuropsicologia' },
  { id: '3', nome: 'Carla Andrade', exp: '25 anos de atuação', crp: 'CRP XX/00000', esp: 'Especialista em Neuropsicologia' },
];

// Lista os profissionais disponíveis: os psicólogos cadastrados de verdade; se não houver nenhum
// (ou se a leitura falhar), cai nos exemplos para as telas nunca ficarem vazias.
export async function carregarProfissionais() {
  try {
    const lista = await listarPsicologos();
    if (lista.length > 0) {
      return lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    }
  } catch (erro) {
    console.warn('Não foi possível listar os psicólogos:', erro?.message || erro);
  }
  return PROFISSIONAIS_EXEMPLO;
}

// "João Mendonça" -> "joao mendonca": busca sem diferenciar maiúsculas nem acentos.
export function normalizarTexto(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Filtra pelo que a pessoa digitou na barra de pesquisa (nome, especialidade ou CRP).
// Todas as palavras digitadas precisam aparecer em algum desses campos.
export function filtrarProfissionais(lista, busca) {
  const palavras = normalizarTexto(busca).split(/\s+/).filter(Boolean);
  if (palavras.length === 0) return lista;

  return lista.filter((p) => {
    const texto = normalizarTexto(`${p.nome} ${p.esp} ${p.crp}`);
    return palavras.every((palavra) => texto.includes(palavra));
  });
}
