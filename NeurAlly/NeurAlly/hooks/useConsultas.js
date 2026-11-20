import { useEffect, useMemo, useState } from 'react';
import { escutarConsultas } from '../services/consultasService.js';
import { consultaEhFutura } from '../utils/datas.js';

// Entrega as consultas do usuário logado, sempre atualizadas.
// papel: 'cliente' (padrão, consultas que ele marcou) ou 'profissional' (consultas marcadas com ele).
//  - consultas: todas as consultas ativas (as canceladas ficam de fora)
//  - proximas: só as que ainda não passaram, em ordem
//  - datasComConsulta: Set com as datas (AAAA-MM-DD) das próximas consultas, para destacar nos calendários
export default function useConsultas(papel = 'cliente') {
  const [todas, setTodas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;
    let cancelarEscuta = () => {};

    escutarConsultas(
      papel,
      (lista) => {
        if (!ativo) return;
        setTodas(lista);
        setErro(null);
        setCarregando(false);
      },
      (erroRecebido) => {
        if (!ativo) return;
        setErro(erroRecebido);
        setCarregando(false);
      }
    )
      .then((unsubscribe) => {
        if (ativo) cancelarEscuta = unsubscribe;
        else unsubscribe();
      })
      .catch((erroRecebido) => {
        if (!ativo) return;
        setErro(erroRecebido);
        setCarregando(false);
      });

    return () => {
      ativo = false;
      cancelarEscuta();
    };
  }, [papel]);

  // Consultas canceladas não aparecem em calendários, agendas nem lembretes.
  const consultas = useMemo(() => todas.filter((c) => c.status !== 'cancelada'), [todas]);
  const proximas = useMemo(() => consultas.filter((c) => consultaEhFutura(c)), [consultas]);
  const datasComConsulta = useMemo(() => new Set(proximas.map((c) => c.data)), [proximas]);

  return { consultas, todas, proximas, datasComConsulta, carregando, erro };
}
