import { useCallback, useEffect, useState } from 'react';
import { escutarPsicologos } from '../services/profissionaisService.js';

// Psicólogos que criaram conta no app, sempre atualizados (aparecem na hora, sem reabrir a tela).
export default function useProfissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    setCarregando(true);
    setErro(null);
    const parar = escutarPsicologos(
      (lista) => {
        setProfissionais(lista);
        setCarregando(false);
      },
      (e) => {
        setErro(e);
        setCarregando(false);
      }
    );
    return parar;
  }, [tentativa]);

  const recarregar = useCallback(() => setTentativa((n) => n + 1), []);
  return { profissionais, carregando, erro, recarregar };
}
