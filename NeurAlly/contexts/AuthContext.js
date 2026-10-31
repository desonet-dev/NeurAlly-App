import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { buscarPerfil, observarAutenticacao, sair as sairService } from '../services/authService.js';
import { definirPresenca, INTERVALO_HEARTBEAT_MS } from '../services/presencaService.js';
import { sairDoGoogle } from '../services/googleAuthService';

const AuthContext = createContext({
  usuario: null,
  perfil: null,
  carregando: true,
  sair: async () => {},
  recarregarPerfil: async () => {},
});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const cancelar = observarAutenticacao(async (usuarioAtual) => {
      setUsuario(usuarioAtual);

      if (usuarioAtual) {
        try {
          const perfilAtual = await buscarPerfil(usuarioAtual.uid);
          setPerfil(perfilAtual);
        } catch (erro) {
          console.warn('Erro ao buscar perfil do usuário:', erro);
          setPerfil(null);
        }
      } else {
        setPerfil(null);
      }

      setCarregando(false);
    });

    return cancelar;
  }, []);

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

  const recarregarPerfil = async () => {
    if (!usuario) return;
    const perfilAtual = await buscarPerfil(usuario.uid);
    setPerfil(perfilAtual);
  };

  return (
    <AuthContext.Provider value={{ usuario, perfil, carregando, sair, recarregarPerfil }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
