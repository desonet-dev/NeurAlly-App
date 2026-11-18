import { useEffect, useState } from 'react';
import { carregarProfissionais } from '../services/profissionaisService.js';

// Carrega os profissionais disponíveis (psicólogos cadastrados; exemplos se ainda não houver nenhum).
export default function useProfissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    carregarProfissionais().then((lista) => {
      if (!ativo) return;
      setProfissionais(lista);
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, []);

  return { profissionais, carregando };
}
