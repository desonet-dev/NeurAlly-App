import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { entrarComGoogle } from '../services/googleAuthService';
import { buscarPerfil, rotaInicial, traduzErroFirebase } from '../services/authService.js';

// Alert.alert não aparece no navegador (react-native-web), então usamos window.alert por lá.
function avisar(titulo, mensagem) {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensagem}`);
  } else {
    Alert.alert(titulo, mensagem);
  }
}

function traduzErroGoogle(erro) {
  switch (erro?.code) {
    case 'google/modulo-indisponivel':
      return 'O login com Google precisa do app instalado a partir de um development build. Ele não funciona no Expo Go.';
    case 'google/sem-client-id':
      return 'Falta preencher o Web client ID em constants/googleConfig.js.';
    case 'google/sem-id-token':
      return 'O Google não devolveu as credenciais. Confira o Web client ID e o SHA-1 cadastrado no Firebase.';
    case 'auth/operation-not-allowed':
      return 'O provedor Google ainda não foi ativado no Firebase (Authentication > Sign-in method).';
    case 'auth/account-exists-with-different-credential':
      return 'Já existe uma conta com esse e-mail usando outro método de login.';
    case 'auth/popup-blocked':
      return 'O navegador bloqueou a janela de login. Libere pop-ups para este site e tente de novo.';
    case 'auth/unauthorized-domain':
      return 'Este endereço não está autorizado no Firebase (Authentication > Settings > Domínios autorizados).';
    default: {
      console.warn('Erro no login com Google:', erro?.code, erro?.message);
      return `${traduzErroFirebase(erro)}${erro?.code ? `\n\nCódigo: ${erro.code}` : ''}`;
    }
  }
}

// Usado nas telas de Login e Cadastro: `const { entrarComGoogle, carregandoGoogle } = useLoginGoogle(navigation)`.
export default function useLoginGoogle(navigation) {
  const [carregandoGoogle, setCarregandoGoogle] = useState(false);

  const entrar = async () => {
    if (carregandoGoogle) return;
    setCarregandoGoogle(true);
    try {
      const usuario = await entrarComGoogle();
      if (!usuario) return; // cancelou

      const perfil = await buscarPerfil(usuario.uid);
      const rota = rotaInicial(perfil);

      // Primeira vez com Google: ainda não existe o tipo de conta (cliente/psicólogo).
      const params = rota === 'CompletarCadastro'
        ? { nome: usuario.displayName || '', email: usuario.email || '' }
        : undefined;

      navigation.reset({ index: 0, routes: [{ name: rota, params }] });
    } catch (erro) {
      avisar('Não foi possível entrar com o Google', traduzErroGoogle(erro));
    } finally {
      setCarregandoGoogle(false);
    }
  };

  return { entrarComGoogle: entrar, carregandoGoogle };
}
