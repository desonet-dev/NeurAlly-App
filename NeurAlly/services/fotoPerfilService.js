import { deleteField, doc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { db } from './firebaseConfig.js';
import { garantirLogado } from './authService.js';

// A foto de perfil fica guardada no próprio documento do usuário (usuarios/{uid}.foto), como uma
// imagem pequena em texto (data URI). Assim não é preciso configurar o Firebase Storage.
// A imagem é recortada em quadrado, reduzida para 320 px e comprimida (~20-40 KB).
const LADO_PX = 320;
const QUALIDADE = 0.6;
const LIMITE_CARACTERES = 300 * 1024; // folga bem abaixo do limite de 1 MB por documento

function erroComCodigo(code, mensagem) {
  return Object.assign(new Error(mensagem), { code });
}

// Abre a galeria do aparelho e devolve a foto já reduzida (data URI), ou null se a pessoa cancelou.
export async function escolherFotoDaGaleria() {
  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });
  if (resultado.canceled || !resultado.assets?.length) return null;

  const contexto = ImageManipulator.manipulate(resultado.assets[0].uri).resize({ width: LADO_PX });
  const imagem = await contexto.renderAsync();
  const salva = await imagem.saveAsync({ format: SaveFormat.JPEG, compress: QUALIDADE, base64: true });
  if (!salva.base64) throw erroComCodigo('foto/invalida', 'Não foi possível ler a imagem.');

  const dataUri = `data:image/jpeg;base64,${salva.base64}`;
  if (dataUri.length > LIMITE_CARACTERES) throw erroComCodigo('foto/grande', 'A imagem ficou grande demais.');
  return dataUri;
}

export async function salvarFotoPerfil(dataUri) {
  const uid = await garantirLogado();
  await updateDoc(doc(db, 'usuarios', uid), { foto: dataUri });
}

export async function removerFotoPerfil() {
  const uid = await garantirLogado();
  await updateDoc(doc(db, 'usuarios', uid), { foto: deleteField() });
}
