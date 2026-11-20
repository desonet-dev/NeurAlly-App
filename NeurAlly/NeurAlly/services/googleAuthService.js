import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebaseConfig.js';

export async function entrarComGoogle() {
  try {
    const provedor = new GoogleAuthProvider();
    provedor.setCustomParameters({ prompt: 'select_account' });
    const resultado = await signInWithPopup(auth, provedor);
    return resultado.user;
  } catch (erro) {
    if (erro?.code === 'auth/popup-closed-by-user' || erro?.code === 'auth/cancelled-popup-request') {
      return null;
    }
    throw erro;
  }
}

export async function sairDoGoogle() {}
