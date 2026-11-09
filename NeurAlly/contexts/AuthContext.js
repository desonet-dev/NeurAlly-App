import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { buscarPerfilComTentativas, observarAutenticacao, sair as sairService } from '../services/authService.js';
import { guardarTipoLocal } from '../services/perfilLocal.js';
import { publicarPsicologo } from '../services/profissionaisService.js';
import { definirPresenca, INTERVALO_HEARTBEAT_MS } from '../services/presencaService.js';
import { sairDoGoogle } from '../services/googleAuthService';
import { auth } from '../services/firebaseConfig.js';

const AuthContext = createContext({
  usuario: null,
  perfil: null,
  erroPerfil: false,
  carregando: true,
  sair: async () => {},
  recarregarPerfil: async () => {},
});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  // true quando NÃO conseguimos ler o perfil (falha de conexão/permissão). É diferente de o perfil
  // não existir ou estar sem `tipo`: só nesse segundo caso a tela de completar cadastro faz sentido.
  const [erroPerfil, setErroPerfil] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const carregarPerfil = async (uid) => {
    try {
      const perfilAtual = await buscarPerfilComTentativas(uid);
      setPerfil(perfilAtual);
      setErroPerfil(false);
      if (perfilAtual?.tipo) guardarTipoLocal(uid, perfilAtual.tipo);
      // Psicólogos que se cadastraram antes do diretório existir passam a aparecer na busca.
      if (perfilAtual?.tipo === 'psicologo') publicarPsicologo(uid, perfilAtual);
    } catch (erro) {
      console.warn('Erro ao buscar perfil do usuário:', erro);
      setPerfil(null);
      setErroPerfil(true);
    }
  };

  useEffect(() => {
    const cancelar = observarAutenticacao(async (usuarioAtual) => {
      setUsuario(usuarioAtual);

      if (usuarioAtual) {
        await carregarPerfil(usuarioAtual.uid);
      } else {
        setPerfil(null);
        setErroPerfil(false);
      }

      setCarregando(false);
    });

    return cancelar;
  }, []);

  // Se a leitura do perfil falhou, continua tentando em segundo plano até conseguir.
  useEffect(() => {
    const uid = usuario?.uid;
    if (!erroPerfil || !uid) return undefined;

    const timer = setInterval(() => carregarPerfil(uid), 10000);
    return () => clearInterval(timer);
  }, [erroPerfil, usuario?.uid]);

  // Presença online: marca como online enquanto o app está aberto (heartbeat a cada minuto)
  // e como offline quando o app vai para segundo plano.
  useEffect(() => {
    const uid = usuario?.uid;
    if (!uid) return undefined;

    let timer = null;
    const iniciar = () => {
      definirPresenca(uid, true);
      clearInterval(timer);
      timer = setInterval(() => definirPresenca(uid, true), INTERVALO_HEARTBEAT_MS);
    };
    const parar = () => {
      clearInterval(timer);
      timer = null;
      definirPresenca(uid, false);
    };

    if (AppState.currentState === 'active') iniciar();
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') iniciar();
      else parar();
    });

    return () => {
      assinatura.remove();
      clearInterval(timer);
    };
  }, [usuario?.uid]);

  // Marca como offline ANTES de encerrar a sessão (depois de sair, o Firestore não aceitaria a escrita).
  const sair = async () => {
    if (usuario?.uid) await definirPresenca(usuario.uid, false);
    await sairDoGoogle();
    return sairService();
  };

  // Usa o usuário do Firebase diretamente (e não o estado `usuario`) porque logo após o cadastro
  // o estado do React ainda pode estar desatualizado, e o perfil acabou de ser gravado.
  const recarregarPerfil = async () => {
    const uid = auth.currentUser?.uid || usuario?.uid;
    if (!uid) return;
    const perfilAtual = await buscarPerfilComTentativas(uid);
    setPerfil(perfilAtual);
    setErroPerfil(false);
    if (perfilAtual?.tipo) guardarTipoLocal(uid, perfilAtual.tipo);
  };

  return (
    <AuthContext.Provider value={{ usuario, perfil, erroPerfil, carregando, sair, recarregarPerfil }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
