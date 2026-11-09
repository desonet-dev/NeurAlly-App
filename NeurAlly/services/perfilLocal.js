import AsyncStorage from '@react-native-async-storage/async-storage';

// Guarda no aparelho o tipo de conta (cliente/psicólogo) de cada usuário que já completou o cadastro.
// Serve de reserva quando a leitura do perfil no Firestore falha (sem internet, conexão instável):
// sem isso o app achava que o cadastro estava incompleto e mostrava a tela "Quase lá!" de novo.
const chave = (uid) => `@neurally/tipo/${uid}`;

export async function guardarTipoLocal(uid, tipo) {
  if (!uid || !tipo) return;
  try {
    await AsyncStorage.setItem(chave(uid), tipo);
  } catch (erro) {
    console.warn('Não foi possível guardar o tipo de conta no aparelho:', erro?.message || erro);
  }
}

export async function lerTipoLocal(uid) {
  if (!uid) return null;
  try {
    return await AsyncStorage.getItem(chave(uid));
  } catch (erro) {
    return null;
  }
}
