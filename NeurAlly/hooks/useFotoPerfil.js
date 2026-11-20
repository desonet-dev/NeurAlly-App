import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { escolherFotoDaGaleria, removerFotoPerfil, salvarFotoPerfil } from '../services/fotoPerfilService.js';

const placeholder = require('../assets/perfil.png');

// Foto de perfil de quem está logado: o que mostrar (foto ou imagem padrão) e as ações de trocar/remover.
// Igual para cliente e psicólogo (a imagem padrão é a mesma).
export default function useFotoPerfil() {
  const { perfil, recarregarPerfil } = useAuth();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const foto = perfil?.foto || null;
  const origem = foto ? { uri: foto } : placeholder;

  const traduzir = (e) => {
    const codigo = e?.code || '';
    if (codigo === 'foto/grande') return 'A foto ficou grande demais. Tente outra imagem.';
    if (codigo === 'permission-denied') return 'Sem permissão para salvar a foto. Verifique as regras do Firestore.';
    return 'Não foi possível atualizar a foto. Verifique sua conexão e tente novamente.';
  };

  // Escolhe uma imagem na galeria do aparelho e salva como foto de perfil.
  const escolher = async () => {
    if (salvando) return;
    setErro('');
    try {
      const nova = await escolherFotoDaGaleria();
      if (!nova) return; // cancelou
      setSalvando(true);
      await salvarFotoPerfil(nova);
      await recarregarPerfil();
    } catch (e) {
      console.warn('Erro ao trocar a foto de perfil:', e);
      setErro(traduzir(e));
    } finally {
      setSalvando(false);
    }
  };

  // Volta para a imagem padrão.
  const remover = async () => {
    if (salvando) return;
    setErro('');
    setSalvando(true);
    try {
      await removerFotoPerfil();
      await recarregarPerfil();
    } catch (e) {
      console.warn('Erro ao remover a foto de perfil:', e);
      setErro(traduzir(e));
    } finally {
      setSalvando(false);
    }
  };

  return { foto, origem, escolher, remover, salvando, erro, limparErro: () => setErro('') };
}

// Para telas que só precisam mostrar a foto (ex.: ícone da Home).
export function useOrigemDaFoto() {
  const { perfil } = useAuth();
  return perfil?.foto ? { uri: perfil.foto } : placeholder;
}
