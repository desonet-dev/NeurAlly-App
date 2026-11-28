import { chaveDeOrdem, consultaEhFutura, formatarDataLonga } from './datas.js';

// Regra das conversas: cliente e profissional podem conversar a partir do momento em que existe pelo
// menos uma consulta marcada entre os dois (e não cancelada). Depois disso a conversa fica liberada,
// mesmo sem nenhuma consulta marcada no momento.
//
// Recebe as consultas ativas (todas as não canceladas, passadas ou futuras) e devolve as pessoas com
// quem dá para conversar: [{ id, uid, nome, esp, crp }] — `crp` leva o texto da consulta (3ª linha da lista):
// "Próxima consulta: ..." se ainda há consulta pela frente, senão "Última consulta: ...".
// papel: 'cliente' (conversa com o profissional da consulta) ou 'profissional' (conversa com o paciente).
export function contatosDeConsultas(consultas, papel = 'cliente', agora = new Date()) {
  const ehProfissional = papel === 'profissional';
  const porId = new Map();

  for (const consulta of consultas || []) {
    const id = ehProfissional ? consulta.clienteId : consulta.profissionalId;
    // Profissionais de exemplo não têm conta (sem id): não dá para conversar com eles.
    if (!id) continue;

    const atual = porId.get(id) || { proxima: null, ultima: null, nome: '', esp: '' };
    if (consultaEhFutura(consulta, agora)) {
      if (!atual.proxima || chaveDeOrdem(consulta) < chaveDeOrdem(atual.proxima)) atual.proxima = consulta;
    } else if (!atual.ultima || chaveDeOrdem(consulta) > chaveDeOrdem(atual.ultima)) {
      atual.ultima = consulta;
    }
    atual.nome = ehProfissional ? consulta.clienteNome || atual.nome : consulta.profissionalNome || atual.nome;
    atual.esp = ehProfissional ? 'Paciente' : consulta.profissionalEsp || atual.esp;
    porId.set(id, atual);
  }

  const lista = [...porId.entries()].map(([id, c]) => {
    const referencia = c.proxima || c.ultima;
    const rotulo = c.proxima ? 'Próxima consulta' : 'Última consulta';
    return {
      id,
      uid: id,
      nome: c.nome || (ehProfissional ? 'Paciente' : 'Profissional'),
      esp: c.esp || (ehProfissional ? 'Paciente' : 'Psicólogo(a)'),
      crp: `${rotulo}: ${formatarDataLonga(referencia.data)} às ${referencia.horario}`,
      _futura: !!c.proxima,
      _ordem: chaveDeOrdem(referencia),
    };
  });

  // Quem tem consulta pela frente vem primeiro (a mais próxima no topo); depois, a consulta mais recente.
  lista.sort((a, b) => {
    if (a._futura !== b._futura) return a._futura ? -1 : 1;
    return a._futura ? a._ordem.localeCompare(b._ordem) : b._ordem.localeCompare(a._ordem);
  });
  return lista.map(({ _futura, _ordem, ...contato }) => contato);
}

export function podeConversarCom(consultas, papel, outroId, agora = new Date()) {
  return !!outroId && contatosDeConsultas(consultas, papel, agora).some((c) => c.id === outroId);
}
