import { PermissionsAndroid, Platform } from 'react-native';

// Antes de entrar na chamada, pede câmera e microfone (no Android a permissão é pedida na hora; no iPhone
// e na web o próprio sistema pergunta quando a sala abre). Devolve true se pode seguir.
export async function liberarCameraEMicrofone() {
  if (Platform.OS !== 'android') return true;
  try {
    const resposta = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);
    return Object.values(resposta).every((r) => r === PermissionsAndroid.RESULTS.GRANTED);
  } catch (erro) {
    console.warn('Não foi possível pedir as permissões de vídeo:', erro?.message || erro);
    return false;
  }
}
