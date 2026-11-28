import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext.js';
import useConsultas from '../hooks/useConsultas.js';
import { aoTocarNoLembrete, cancelarTodosLembretes, sincronizarLembretes } from '../services/notificacoesService.js';
import { destinoDoLembrete } from '../utils/chamada.js';

// Componente invisível: mantém os lembretes de consulta (notificações) sempre em dia.
// Fica no App.js, então vale para qualquer tela. Quando uma consulta é marcada, reagendada ou
// cancelada, o hook useConsultas atualiza e os lembretes são refeitos automaticamente.
function Sincronizador({ papel }) {
  const navigation = useNavigation();
  const { proximas } = useConsultas(papel);
  const proximasRef = useRef(proximas);
  proximasRef.current = proximas;

  // Consultas mudaram -> refaz os lembretes.
  useEffect(() => {
    sincronizarLembretes(proximas, papel);
  }, [proximas, papel]);

  // Ao voltar para o app, confere de novo (por exemplo, se a permissão foi liberada nas configurações).
  useEffect(() => {
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') sincronizarLembretes(proximasRef.current, papel);
    });
    return () => assinatura.remove();
  }, [papel]);

  // Tocar no lembrete leva para a tela das consultas.
  useEffect(
    () =>
      aoTocarNoLembrete((dados) => {
        try {
          // Consulta on-line com a sala disponível: o lembrete leva direto para a sala da consulta.
          const { rota, params } = destinoDoLembrete(proximasRef.current, dados, papel);
          navigation.navigate(rota, params);
        } catch (erro) {
          console.warn('Não foi possível abrir a tela da consulta:', erro?.message || erro);
        }
      }),
    [navigation, papel]
  );

  return null;
}

export default function LembretesConsultas() {
  const { usuario, perfil } = useAuth();
  const logado = !!usuario && !!perfil?.tipo;

  // Saiu da conta: os lembretes dela não devem continuar chegando neste aparelho.
  useEffect(() => {
    if (!usuario) cancelarTodosLembretes();
  }, [usuario]);

  if (!logado) return null;
  return <Sincronizador papel={perfil.tipo === 'psicologo' ? 'profissional' : 'cliente'} />;
}
