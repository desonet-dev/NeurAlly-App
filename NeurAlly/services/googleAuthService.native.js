import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebaseConfig.js';
import { GOOGLE_WEB_CLIENT_ID } from '../constants/googleConfig.js';

let configurado = false;

function obterModulo() {
  try {
    return require('@react-native-google-signin/google-signin');
  } catch (erro) {
    return null;
  }
}

function criarErro(code, message) {
  const erro = new Error(message);
  erro.code = code;
  return erro;
}

export async function entrarComGoogle() {
  const modulo = obterModulo();
  if (!modulo?.GoogleSignin) {
    throw criarErro('google/modulo-indisponivel', 'Módulo nativo do Google Sign-In indisponível.');
  }

  if (GOOGLE_WEB_CLIENT_ID.startsWith('446072505220-pksr29jqhai0gbqqomf4bpgd85vk2glm.apps.googleusercontent.com')) {
    throw criarErro('google/sem-client-id', 'Falta preencher o Web client ID em constants/googleConfig.js.');
  }

  const { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } = modulo;

  if (!configurado) {
    GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
    configurado = true;
  }

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const resposta = await GoogleSignin.signIn();

    if (!isSuccessResponse(resposta)) return null;

    const idToken = resposta.data?.idToken;
    if (!idToken) {
      throw criarErro('google/sem-id-token', 'O Google não devolveu o idToken.');
    }

    const resultado = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
    return resultado.user;
  } catch (erro) {
    if (isErrorWithCode?.(erro) && (erro.code === statusCodes.SIGN_IN_CANCELLED || erro.code === statusCodes.IN_PROGRESS)) {
      return null;
    }
    throw erro;
  }
}

export async function sairDoGoogle() {
  try {
    await obterModulo()?.GoogleSignin?.signOut();
  } catch (erro) {
  }
}
