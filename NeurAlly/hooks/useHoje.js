import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { hojeISO } from '../utils/datas.js';

// Data de hoje (AAAA-MM-DD) sempre atualizada: se o app ficar aberto de um dia para o outro,
// ou voltar do segundo plano em outro dia, os calendários passam a começar no dia certo.
export default function useHoje() {
  const [hoje, setHoje] = useState(hojeISO());

  useEffect(() => {
    const conferir = () => setHoje((atual) => {
      const novo = hojeISO();
      return novo === atual ? atual : novo;
    });

    const intervalo = setInterval(conferir, 60 * 1000);
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') conferir();
    });
    return () => {
      clearInterval(intervalo);
      assinatura.remove();
    };
  }, []);

  return hoje;
}
