import { useMemo } from 'react';
import useConsultas from './useConsultas.js';
import { contatosDeConsultas } from '../utils/contatos.js';

// Pessoas com quem quem está logado pode conversar: as com quem já marcou pelo menos uma consulta
// (não cancelada). Depois da primeira consulta a conversa fica liberada, mesmo sem consulta marcada agora.
// papel: 'cliente' ou 'profissional'.
export default function useContatosDeConsulta(papel = 'cliente') {
  const { consultas, carregando, erro } = useConsultas(papel);
  const contatos = useMemo(() => contatosDeConsultas(consultas, papel), [consultas, papel]);
  const podeConversarCom = (id) => !!id && contatos.some((c) => c.id === id);
  return { contatos, podeConversarCom, carregando, erro };
}
