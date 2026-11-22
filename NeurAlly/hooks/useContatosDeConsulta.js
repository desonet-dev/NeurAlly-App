import { useMemo } from 'react';
import useConsultas from './useConsultas.js';
import { contatosDeConsultas } from '../utils/contatos.js';

// Pessoas com quem quem está logado pode conversar agora: as que têm consulta marcada com ele.
// papel: 'cliente' ou 'profissional'.
export default function useContatosDeConsulta(papel = 'cliente') {
  const { proximas, carregando, erro } = useConsultas(papel);
  const contatos = useMemo(() => contatosDeConsultas(proximas, papel), [proximas, papel]);
  const podeConversarCom = (id) => !!id && contatos.some((c) => c.id === id);
  return { contatos, podeConversarCom, carregando, erro };
}
