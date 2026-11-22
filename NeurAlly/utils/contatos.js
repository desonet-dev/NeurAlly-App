import { formatarDataLonga } from './datas.js';

// Regra das conversas: cliente e profissional só podem conversar enquanto houver uma consulta
// marcada (que ainda não passou nem foi cancelada) entre os dois.
//
// Recebe as próximas consultas (em ordem) e devolve as pessoas com quem dá para conversar:
// [{ id, uid, nome, esp, crp }] — `crp` leva o texto da próxima consulta (aparece como 3ª linha da lista).
// papel: 'cliente' (conversa com o profissional da consulta) ou 'profissional' (conversa com o paciente).
export function contatosDeConsultas(proximas, papel = 'cliente') {
  const ehProfissional = papel === 'profissional';
  const porId = new Map();

  for (const consulta of proximas || []) {
    const id = ehProfissional ? consulta.clienteId : consulta.profissionalId;
    // Profissionais de exemplo não têm conta (sem id): não dá para conversar com eles.
    if (!id || porId.has(id)) continue;

    porId.set(id, {
      id,
      uid: id,
      nome: ehProfissional ? consulta.clienteNome || 'Paciente' : consulta.profissionalNome || 'Profissional',
      esp: ehProfissional ? 'Paciente' : consulta.profissionalEsp || 'Psicólogo(a)',
      crp: `Próxima consulta: ${formatarDataLonga(consulta.data)} às ${consulta.horario}`,
    });
  }

  return [...porId.values()];
}

export function podeConversarCom(proximas, papel, outroId) {
  return !!outroId && contatosDeConsultas(proximas, papel).some((c) => c.id === outroId);
}
