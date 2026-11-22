// Regras do Jardim Zen (jogo relaxante). Tudo aqui é lógica pura: não mexe em tela nem em banco,
// por isso é fácil de testar. O estado do jogo é um objeto simples (ver estadoInicial).

export const COLUNAS = 3;
export const NUM_CANTEIROS = 9;

export const NOMES_ESTAGIOS = ['Semente', 'Broto', 'Planta jovem', 'Planta adulta'];

// Pontos de crescimento: regar dá 2, limpar uma ervinha dá 1.
export const PONTOS_POR_REGA = 2;
export const PONTOS_POR_LIMPEZA = 1;

// A planta NUNCA morre: sem cuidado por alguns dias ela só "adormece" (e acorda ao receber cuidado).
export const DIAS_PARA_ADORMECER = 4;

// Ervinhas aparecem de tempos em tempos nos canteiros com plantas (no máximo 3 por canteiro e 6 no jardim).
export const HORAS_POR_ERVA = 3;
export const MAX_ERVAS_POR_CANTEIRO = 3;
export const MAX_ERVAS_NO_JARDIM = 6;

const HORA_MS = 60 * 60 * 1000;
const DIA_MS = 24 * HORA_MS;

// Espécies. `diasParaDesbloquear` = quantos DIAS DIFERENTES com registro no diário emocional (não
// precisam ser seguidos) são necessários. `limites` = pontos acumulados para chegar em broto,
// planta jovem e planta adulta (o bonsai cresce bem mais devagar).
export const ESPECIES = {
  suculenta: {
    id: 'suculenta',
    nome: 'Suculenta',
    apelido: 'Suculenta / cacto',
    diasParaDesbloquear: 0,
    limites: [3, 8, 15],
    simbolo: 'Resiliência e força nos momentos difíceis',
    descricao: 'Suculentas e cactos atravessam longas secas guardando água. São o lembrete de que dá para atravessar fases duras e continuar de pé.',
    curiosidades: [
      'As suculentas guardam água nas folhas para enfrentar períodos de seca. Do mesmo jeito, pequenas reservas de descanso e de afeto ajudam nos dias difíceis.',
      'Elas pedem pouca água: excesso de cuidado também pode machucar. Descansar e colocar limites também faz parte de cuidar de si.',
      'Algumas espécies só florescem depois de uma fase de aperto. Às vezes, o que parece um período difícil prepara algo bonito.',
    ],
  },
  lavanda: {
    id: 'lavanda',
    nome: 'Lavanda',
    apelido: 'Lavanda',
    diasParaDesbloquear: 3,
    limites: [3, 9, 16],
    simbolo: 'Calma, tranquilidade e alívio da ansiedade',
    descricao: 'A lavanda é conhecida pelo perfume suave, muito usado em rotinas de relaxamento. Ela simboliza respirar fundo e desacelerar.',
    curiosidades: [
      'O aroma da lavanda é muito usado em rituais para relaxar antes de dormir. Criar uma rotina calmante à noite é um ótimo hábito de cuidado.',
      'A lavanda gosta de sol e de terra seca: nem tudo precisa de excesso para florescer. Fazer menos, com presença, também funciona.',
      'Ela atrai abelhas e borboletas. Cultivar calma por dentro costuma atrair boas companhias por fora.',
    ],
  },
  girassol: {
    id: 'girassol',
    nome: 'Girassol',
    apelido: 'Girassol',
    diasParaDesbloquear: 7,
    limites: [3, 9, 17],
    simbolo: 'Vitalidade, gratidão e energia',
    descricao: 'O girassol vive de luz. Ele simboliza energia, alegria de viver e o hábito de reparar no que é bom.',
    curiosidades: [
      'Girassóis jovens acompanham o movimento do sol ao longo do dia. Buscar o que nos faz bem é um jeito de se cuidar.',
      'O miolo do girassol é formado por centenas de pequenas flores que trabalham juntas. Pequenos gestos de gratidão, somados, mudam o dia.',
      'Depois de adultos, os girassóis tendem a ficar voltados para o leste, para o sol da manhã. Começar o dia com algo que acolhe faz diferença.',
    ],
  },
  bonsai: {
    id: 'bonsai',
    nome: 'Bonsai de cerejeira',
    apelido: 'Bonsai (cerejeira)',
    diasParaDesbloquear: 15,
    limites: [5, 14, 28],
    simbolo: 'Paciência, equilíbrio e foco no longo prazo',
    descricao: 'O bonsai cresce devagar e exige constância. Ele simboliza paciência com o próprio ritmo e a beleza de cuidar um pouco todo dia.',
    curiosidades: [
      'Um bonsai leva anos para ganhar forma. Constância vale mais do que pressa, tanto nas plantas quanto na saúde mental.',
      'Podas cuidadosas fazem parte do cultivo: saber soltar o que não ajuda também é uma forma de cuidar.',
      'Na cultura japonesa, a florada das cerejeiras (hanami) convida a apreciar o momento presente, mesmo sabendo que ele passa.',
    ],
  },
};

export const ORDEM_ESPECIES = ['suculenta', 'lavanda', 'girassol', 'bonsai'];

// O que cada emoção registrada no diário rende. Tristeza rende mais gotas e uma mensagem de acolhimento.
export const RECOMPENSAS_DIARIO = {
  triste: {
    gotas: 5,
    mensagem: 'Dias nublados também trazem chuva para nutrir suas raízes.',
  },
  neutro: {
    gotas: 3,
    mensagem: 'Dias tranquilos também fazem o jardim crescer, no seu ritmo.',
  },
  feliz: {
    gotas: 3,
    mensagem: 'Que bom! Sua alegria faz o jardim florescer.',
  },
  muitofeliz: {
    gotas: 3,
    mensagem: 'Sua energia deixa o jardim ainda mais vivo!',
  },
};
const RECOMPENSA_PADRAO = { gotas: 3, mensagem: 'Obrigado por cuidar de você hoje. Seu jardim agradece!' };

export function recompensaDaEmocao(emocao) {
  return RECOMPENSAS_DIARIO[emocao] || RECOMPENSA_PADRAO;
}

export function estadoInicial(agora = Date.now()) {
  return {
    gotas: 0,
    canteiros: Array.from({ length: NUM_CANTEIROS }, () => null),
    premiados: [], // ids dos registros do diário que já deram gotas
    especiesLiberadas: ['suculenta'],
    ultimaVerificacaoErvas: agora,
    totalRegas: 0,
    totalLimpezas: 0,
  };
}

// As ervinhas de um canteiro são uma lista de posições fixas (0, 1 ou 2), para que cada uma fique
// sempre no mesmo lugar até ser limpa. Aceita também o formato antigo (apenas a quantidade).
function normalizarErvas(valor) {
  if (Array.isArray(valor)) {
    return [...new Set(valor.map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n < MAX_ERVAS_POR_CANTEIRO))].sort();
  }
  const quantidade = Math.min(MAX_ERVAS_POR_CANTEIRO, Math.max(0, Number(valor) || 0));
  return Array.from({ length: quantidade }, (_, i) => i);
}

export function quantidadeDeErvas(planta) {
  return planta ? planta.ervas.length : 0;
}

// Garante que um estado lido do banco tenha todos os campos (e o número certo de canteiros).
export function normalizarEstado(bruto, agora = Date.now()) {
  const base = estadoInicial(agora);
  if (!bruto || typeof bruto !== 'object') return base;

  const canteiros = Array.from({ length: NUM_CANTEIROS }, (_, i) => {
    const p = Array.isArray(bruto.canteiros) ? bruto.canteiros[i] : null;
    return p && ESPECIES[p.especie]
      ? {
          especie: p.especie,
          pontos: Number(p.pontos) || 0,
          plantadaEm: Number(p.plantadaEm) || agora,
          ultimoCuidado: Number(p.ultimoCuidado) || Number(p.plantadaEm) || agora,
          ervas: normalizarErvas(p.ervas),
        }
      : null;
  });

  const liberadas = new Set(['suculenta', ...(Array.isArray(bruto.especiesLiberadas) ? bruto.especiesLiberadas : [])]);
  return {
    gotas: Math.max(0, Number(bruto.gotas) || 0),
    canteiros,
    premiados: Array.isArray(bruto.premiados) ? bruto.premiados : [],
    especiesLiberadas: ORDEM_ESPECIES.filter((id) => liberadas.has(id)),
    ultimaVerificacaoErvas: Number(bruto.ultimaVerificacaoErvas) || agora,
    totalRegas: Number(bruto.totalRegas) || 0,
    totalLimpezas: Number(bruto.totalLimpezas) || 0,
  };
}

// 0 = semente, 1 = broto, 2 = planta jovem, 3 = planta adulta
export function estagioDaPlanta(planta) {
  if (!planta) return 0;
  const limites = ESPECIES[planta.especie].limites;
  let estagio = 0;
  limites.forEach((limite) => {
    if (planta.pontos >= limite) estagio += 1;
  });
  return estagio;
}

// Progresso até o próximo estágio: { atual, necessarios, fracao } (null se já é adulta).
export function progressoDaPlanta(planta) {
  const estagio = estagioDaPlanta(planta);
  if (estagio >= 3) return null;
  const limites = ESPECIES[planta.especie].limites;
  const inicio = estagio === 0 ? 0 : limites[estagio - 1];
  const fim = limites[estagio];
  return { atual: planta.pontos - inicio, necessarios: fim - inicio, fracao: (planta.pontos - inicio) / (fim - inicio) };
}

export function plantaAdormecida(planta, agora = Date.now()) {
  return !!planta && agora - planta.ultimoCuidado > DIAS_PARA_ADORMECER * DIA_MS;
}

// Espécies liberadas para quem já registrou o diário em `dias` dias diferentes.
export function especiesPorDias(dias) {
  return ORDEM_ESPECIES.filter((id) => dias >= ESPECIES[id].diasParaDesbloquear);
}

// Próxima semente a desbloquear: { especie, faltam } ou null se já liberou todas.
export function proximaSemente(dias) {
  const id = ORDEM_ESPECIES.find((e) => dias < ESPECIES[e].diasParaDesbloquear);
  return id ? { especie: ESPECIES[id], faltam: ESPECIES[id].diasParaDesbloquear - dias } : null;
}

function comCanteiro(estado, indice, planta) {
  const canteiros = estado.canteiros.slice();
  canteiros[indice] = planta;
  return { ...estado, canteiros };
}

// Planta uma semente (grátis) em um canteiro vazio. Devolve { estado } ou { erro }.
export function plantar(estado, indice, especieId, agora = Date.now()) {
  if (indice < 0 || indice >= NUM_CANTEIROS) return { erro: 'canteiro-invalido' };
  if (estado.canteiros[indice]) return { erro: 'canteiro-ocupado' };
  if (!ESPECIES[especieId]) return { erro: 'especie-invalida' };
  if (!estado.especiesLiberadas.includes(especieId)) return { erro: 'especie-bloqueada' };

  const planta = { especie: especieId, pontos: 0, plantadaEm: agora, ultimoCuidado: agora, ervas: [] };
  return { estado: comCanteiro(estado, indice, planta) };
}

// Rega uma planta: gasta 1 gota. Devolve { estado, subiuDeEstagio, acordou, estagio } ou { erro }.
export function regar(estado, indice, agora = Date.now()) {
  const planta = estado.canteiros[indice];
  if (!planta) return { erro: 'sem-planta' };
  if (estado.gotas < 1) return { erro: 'sem-gotas' };

  const antes = estagioDaPlanta(planta);
  const acordou = plantaAdormecida(planta, agora);
  const nova = { ...planta, pontos: planta.pontos + PONTOS_POR_REGA, ultimoCuidado: agora };
  const depois = estagioDaPlanta(nova);

  return {
    estado: { ...comCanteiro(estado, indice, nova), gotas: estado.gotas - 1, totalRegas: estado.totalRegas + 1 },
    subiuDeEstagio: depois > antes,
    acordou,
    estagio: depois,
  };
}

// Remove uma ervinha do canteiro (a limpeza também conta como cuidado e dá 1 ponto à planta).
// `slot` = posição da ervinha (0, 1 ou 2); sem informar, tira a primeira.
export function limparErva(estado, indice, slot, agora = Date.now()) {
  const planta = estado.canteiros[indice];
  if (!planta || planta.ervas.length < 1) return { erro: 'sem-erva' };
  const alvo = slot === undefined || slot === null ? planta.ervas[0] : slot;
  if (!planta.ervas.includes(alvo)) return { erro: 'sem-erva' };

  const antes = estagioDaPlanta(planta);
  const nova = { ...planta, ervas: planta.ervas.filter((s) => s !== alvo), pontos: planta.pontos + PONTOS_POR_LIMPEZA, ultimoCuidado: agora };
  return {
    estado: { ...comCanteiro(estado, indice, nova), totalLimpezas: estado.totalLimpezas + 1 },
    subiuDeEstagio: estagioDaPlanta(nova) > antes,
    estagio: estagioDaPlanta(nova),
  };
}

export function removerPlanta(estado, indice) {
  if (!estado.canteiros[indice]) return { erro: 'sem-planta' };
  return { estado: comCanteiro(estado, indice, null) };
}

// Faz aparecer ervinhas conforme o tempo passou desde a última verificação.
// `sorteio` devolve um número entre 0 e 1 (injetável para testes).
export function gerarErvas(estado, agora = Date.now(), sorteio = Math.random) {
  const ocupados = estado.canteiros.map((p, i) => (p ? i : -1)).filter((i) => i >= 0);
  if (ocupados.length === 0) return { ...estado, ultimaVerificacaoErvas: agora };

  const aparecem = Math.floor((agora - estado.ultimaVerificacaoErvas) / (HORAS_POR_ERVA * HORA_MS));
  if (aparecem <= 0) return estado;

  let canteiros = estado.canteiros.map((p) => (p ? { ...p } : null));
  let total = canteiros.reduce((soma, p) => soma + (p ? p.ervas.length : 0), 0);

  for (let n = 0; n < aparecem && total < MAX_ERVAS_NO_JARDIM; n += 1) {
    const candidatos = ocupados.filter((i) => canteiros[i].ervas.length < MAX_ERVAS_POR_CANTEIRO);
    if (candidatos.length === 0) break;
    const escolhido = candidatos[Math.min(candidatos.length - 1, Math.floor(sorteio() * candidatos.length))];
    const livres = POSICOES_ERVAS.map((_, s) => s).filter((s) => !canteiros[escolhido].ervas.includes(s));
    const slot = livres[Math.min(livres.length - 1, Math.floor(sorteio() * livres.length))];
    canteiros[escolhido].ervas = [...canteiros[escolhido].ervas, slot].sort();
    total += 1;
  }
  return { ...estado, canteiros, ultimaVerificacaoErvas: agora };
}

// Posições (0 a 1, dentro do canteiro) onde cada ervinha é desenhada.
export const POSICOES_ERVAS = [
  { x: 0.2, y: 0.74 },
  { x: 0.8, y: 0.7 },
  { x: 0.5, y: 0.88 },
];

// Medidas do jardim na tela: `lado` = tamanho de cada canteiro e `espaco` = distância entre eles.
export function origemDoCanteiro(indice, lado, espaco) {
  const linha = Math.floor(indice / COLUNAS);
  const coluna = indice % COLUNAS;
  return { x: coluna * (lado + espaco), y: linha * (lado + espaco) };
}

// Dado um ponto tocado (x, y, relativo ao jardim), diz quais ervinhas estão sob o dedo.
// Devolve [{ indice, slot }] (no máximo uma ervinha por canteiro a cada toque).
export function ervasTocadas(estado, x, y, lado, espaco) {
  const raio = lado * 0.24;
  const achados = [];

  estado.canteiros.forEach((planta, indice) => {
    if (!planta || planta.ervas.length < 1) return;
    const origem = origemDoCanteiro(indice, lado, espaco);
    for (const slot of planta.ervas) {
      const pos = POSICOES_ERVAS[slot];
      const cx = origem.x + pos.x * lado;
      const cy = origem.y + pos.y * lado;
      if (Math.hypot(x - cx, y - cy) <= raio) {
        achados.push({ indice, slot });
        break;
      }
    }
  });
  return achados;
}

// Aplica a recompensa de um registro do diário (idempotente: o mesmo registro nunca rende duas vezes).
// `dias` = quantos dias diferentes têm registro. Devolve { estado, gotasGanhas, mensagem, novasEspecies }.
export function aplicarRecompensaDoDiario(estado, registroId, emocao, dias) {
  const jaPremiado = estado.premiados.includes(registroId);
  const recompensa = recompensaDaEmocao(emocao);
  const gotasGanhas = jaPremiado ? 0 : recompensa.gotas;

  const liberadasAgora = especiesPorDias(dias);
  const novasEspecies = liberadasAgora.filter((id) => !estado.especiesLiberadas.includes(id));
  const especiesLiberadas = ORDEM_ESPECIES.filter((id) => estado.especiesLiberadas.includes(id) || liberadasAgora.includes(id));

  return {
    estado: {
      ...estado,
      gotas: estado.gotas + gotasGanhas,
      premiados: jaPremiado || !registroId ? estado.premiados : [...estado.premiados, registroId],
      especiesLiberadas,
    },
    gotasGanhas,
    mensagem: recompensa.mensagem,
    novasEspecies,
  };
}

// Confere os registros que já existem no diário: dá as gotas dos que ainda não renderam e libera
// sementes pelos dias com registro. `registros` = [{ id, emocao, data }].
export function sincronizarComRegistros(estado, registros) {
  const premiados = new Set(estado.premiados);
  let gotasGanhas = 0;
  const novosIds = [];

  registros.forEach((r) => {
    if (!premiados.has(r.id)) {
      premiados.add(r.id);
      novosIds.push(r.id);
      gotasGanhas += recompensaDaEmocao(r.emocao).gotas;
    }
  });

  const dias = new Set(registros.map((r) => r.data).filter(Boolean)).size;
  const liberadasAgora = especiesPorDias(dias);
  const novasEspecies = liberadasAgora.filter((id) => !estado.especiesLiberadas.includes(id));
  const especiesLiberadas = ORDEM_ESPECIES.filter((id) => estado.especiesLiberadas.includes(id) || liberadasAgora.includes(id));

  if (gotasGanhas === 0 && novasEspecies.length === 0) {
    return { estado, gotasGanhas: 0, novasEspecies: [], dias, mudou: false };
  }
  return {
    estado: { ...estado, gotas: estado.gotas + gotasGanhas, premiados: [...estado.premiados, ...novosIds], especiesLiberadas },
    gotasGanhas,
    novasEspecies,
    dias,
    mudou: true,
  };
}

// Quantos dias diferentes têm registro (para mostrar o progresso das sementes).
export function diasComRegistro(registros) {
  return new Set(registros.map((r) => r.data).filter(Boolean)).size;
}
