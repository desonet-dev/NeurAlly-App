import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { carregarJardim, salvarJardim, sincronizarJardimComDiario } from '../services/jardimService.js';
import { gerarErvas, limparErva, plantar, regar, removerPlanta } from '../utils/jardim.js';

const ATRASO_PARA_SALVAR_MS = 600;

// Estado do Jardim Zen: carrega, confere o diário, faz as ervinhas aparecerem e salva cada cuidado.
// As ações (plantar, regar, limpar, remover) atualizam a tela na hora e gravam em seguida.
export default function useJardim() {
  const [estado, setEstado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [erroAoSalvar, setErroAoSalvar] = useState(false);
  const [dias, setDias] = useState(0);
  const [novidades, setNovidades] = useState(null); // { gotasGanhas, novasEspecies } vindos do diário

  const estadoRef = useRef(null);
  const temporizador = useRef(null);
  const pendente = useRef(false);

  const gravarAgora = useCallback(async () => {
    if (temporizador.current) {
      clearTimeout(temporizador.current);
      temporizador.current = null;
    }
    if (!pendente.current || !estadoRef.current) return;
    pendente.current = false;
    try {
      await salvarJardim(estadoRef.current);
      setErroAoSalvar(false);
    } catch (e) {
      console.warn('Erro ao salvar o jardim:', e);
      pendente.current = true;
      setErroAoSalvar(true);
    }
  }, []);

  const agendarGravacao = useCallback(() => {
    pendente.current = true;
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(gravarAgora, ATRASO_PARA_SALVAR_MS);
  }, [gravarAgora]);

  const definirEstado = useCallback((novo, gravar = true) => {
    estadoRef.current = novo;
    setEstado(novo);
    if (gravar) agendarGravacao();
  }, [agendarGravacao]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      let atual = await carregarJardim();
      const antes = atual;

      const sincronizado = await sincronizarJardimComDiario(atual);
      atual = sincronizado.estado;
      setDias(sincronizado.dias);
      if (sincronizado.gotasGanhas > 0 || sincronizado.novasEspecies.length > 0) {
        setNovidades({ gotasGanhas: sincronizado.gotasGanhas, novasEspecies: sincronizado.novasEspecies });
      }

      atual = gerarErvas(atual, Date.now());
      definirEstado(atual, sincronizado.mudou || atual !== antes);
    } catch (e) {
      console.warn('Erro ao carregar o jardim:', e);
      setErro(e);
    } finally {
      setCarregando(false);
    }
  }, [definirEstado]);

  useEffect(() => {
    carregar();
    // Ao sair da tela ou do app, grava o que estiver pendente.
    const assinatura = AppState.addEventListener('change', (s) => {
      if (s !== 'active') gravarAgora();
    });
    return () => {
      assinatura.remove();
      gravarAgora();
    };
  }, [carregar, gravarAgora]);

  // Aplica uma regra do jogo sobre o estado mais recente. Devolve o resultado da regra.
  const aplicar = useCallback((regra) => {
    if (!estadoRef.current) return { erro: 'sem-estado' };
    const resultado = regra(estadoRef.current);
    if (resultado.estado) definirEstado(resultado.estado);
    return resultado;
  }, [definirEstado]);

  return {
    estado,
    carregando,
    erro,
    erroAoSalvar,
    dias,
    novidades,
    limparNovidades: () => setNovidades(null),
    recarregar: carregar,
    plantar: (indice, especie) => aplicar((e) => plantar(e, indice, especie, Date.now())),
    regar: (indice) => aplicar((e) => regar(e, indice, Date.now())),
    limpar: (indice, slot) => aplicar((e) => limparErva(e, indice, slot, Date.now())),
    remover: (indice) => aplicar((e) => removerPlanta(e, indice)),
  };
}
