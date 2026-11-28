import { useCallback, useEffect, useState } from 'react';
import { abrirChamada, encerrarChamada, escutarChamada } from '../services/chamadaService.js';
import { situacaoDaJanela } from '../utils/chamada.js';

// Estado da chamada de vídeo de uma consulta: situação da janela (cedo/aberta/encerrada), se o
// profissional já abriu a sala (em tempo real) e as ações de abrir/encerrar.
export default function useChamada(consulta) {
  const [chamada, setChamada] = useState(undefined); // undefined = ainda carregando
  const [erro, setErro] = useState(null);
  const [agora, setAgora] = useState(Date.now());

  // Relógio: reavalia a janela a cada 15 segundos (a sala abre/fecha sozinha na hora certa).
  useEffect(() => {
    const intervalo = setInterval(() => setAgora(Date.now()), 15000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (!consulta?.id) return undefined;
    setErro(null);
    return escutarChamada(
      consulta.id,
      setChamada,
      (e) => {
        setErro(e);
        setChamada(null);
      }
    );
  }, [consulta?.id]);

  const janela = situacaoDaJanela(consulta, new Date(agora));
  // Uma sala "aberta" só vale dentro da janela da consulta.
  const salaAberta = !!chamada && chamada.aberta === true && janela.situacao === 'aberta';

  const abrir = useCallback(() => abrirChamada(consulta), [consulta]);
  const encerrar = useCallback(() => encerrarChamada(consulta.id), [consulta?.id]);

  return { chamada, salaAberta, carregando: chamada === undefined, erro, janela, abrir, encerrar };
}
