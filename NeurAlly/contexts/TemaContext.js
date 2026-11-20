import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { criarMapeadorEscuro, MAPEADOR_CLARO } from '../styles/coresTema.js';

// Tema (Claro / Escuro / Padrão do sistema) e idioma escolhidos em Preferências.
// Ficam salvos no aparelho (AsyncStorage), então valem já na abertura do app, antes do login.
export const TEMA_CLARO = 'Claro';
export const TEMA_ESCURO = 'Escuro';
export const TEMA_SISTEMA = 'Padrão do sistema';
export const IDIOMA_PADRAO = 'Português (Brasil)';

const CHAVE_TEMA = 'neurally:tema';
const CHAVE_IDIOMA = 'neurally:idioma';

const mapeadorEscuro = criarMapeadorEscuro();

const TemaContext = createContext({
  preferenciaTema: TEMA_SISTEMA,
  setPreferenciaTema: () => {},
  idioma: IDIOMA_PADRAO,
  setIdioma: () => {},
  escuro: false,
  cor: MAPEADOR_CLARO,
});

export function TemaProvider({ children }) {
  const sistema = useColorScheme();
  const [preferenciaTema, setTema] = useState(TEMA_SISTEMA);
  const [idioma, setIdiomaEstado] = useState(IDIOMA_PADRAO);

  // Lê o que foi salvo na última vez.
  useEffect(() => {
    let ativo = true;
    AsyncStorage.multiGet([CHAVE_TEMA, CHAVE_IDIOMA])
      .then((itens) => {
        if (!ativo) return;
        const tema = itens.find(([chave]) => chave === CHAVE_TEMA)?.[1];
        const lingua = itens.find(([chave]) => chave === CHAVE_IDIOMA)?.[1];
        if ([TEMA_CLARO, TEMA_ESCURO, TEMA_SISTEMA].includes(tema)) setTema(tema);
        if (lingua) setIdiomaEstado(lingua);
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);

  // Faz também os componentes nativos (teclado, janelas) seguirem o tema escolhido.
  useEffect(() => {
    try {
      Appearance.setColorScheme(
        preferenciaTema === TEMA_CLARO ? 'light' : preferenciaTema === TEMA_ESCURO ? 'dark' : null
      );
    } catch (erro) {
      // Plataformas sem suporte: só o visual do app muda.
    }
  }, [preferenciaTema]);

  const escuro = preferenciaTema === TEMA_ESCURO || (preferenciaTema === TEMA_SISTEMA && sistema === 'dark');

  const setPreferenciaTema = (valor) => {
    setTema(valor);
    AsyncStorage.setItem(CHAVE_TEMA, valor).catch(() => {});
  };
  const setIdioma = (valor) => {
    setIdiomaEstado(valor);
    AsyncStorage.setItem(CHAVE_IDIOMA, valor).catch(() => {});
  };

  const valor = useMemo(
    () => ({
      preferenciaTema,
      setPreferenciaTema,
      idioma,
      setIdioma,
      escuro,
      cor: escuro ? mapeadorEscuro : MAPEADOR_CLARO,
    }),
    [preferenciaTema, idioma, escuro]
  );

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

export function useTema() {
  return useContext(TemaContext);
}

// Cria os estilos da tela já na cor do tema atual (refeitos quando o tema muda).
// Uso: const [styles, cor] = useEstilos(criarStyles);
export function useEstilos(criar) {
  const { cor } = useContext(TemaContext);
  const styles = useMemo(() => criar(cor), [cor]);
  return [styles, cor];
}
