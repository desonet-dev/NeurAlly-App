import React, { createContext, useContext, useEffect, useState } from 'react';
import { buscarPerfil, observarAutenticacao, sair as sairService } from '../services/authService.js';

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

  const recarregarPerfil = async () => {
    if (!usuario) return;
    const perfilAtual = await buscarPerfil(usuario.uid);
    setPerfil(perfilAtual);
  };

  return (
    <AuthContext.Provider value={{ usuario, perfil, carregando, sair: sairService, recarregarPerfil }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
