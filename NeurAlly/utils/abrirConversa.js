import { obterOuCriarChat } from '../services/chatService.js';

// Abre (criando, se for a primeira vez) a conversa entre quem está logado e a outra pessoa da consulta.
// papel: 'cliente' conversa com o profissional; 'profissional' conversa com o paciente.
// Lança erro se a consulta não tem a outra pessoa cadastrada (ex.: profissional de exemplo).
export async function abrirConversaDaConsulta({ navigation, consulta, papel, meuId }) {
  const ehProfissional = papel === 'profissional';
  const outroId = ehProfissional ? consulta.clienteId : consulta.profissionalId;
  if (!outroId) {
    throw Object.assign(new Error('Sem conta para conversar.'), { code: 'conversa/sem-conta' });
  }

  const chatId = await obterOuCriarChat(meuId, outroId);
  navigation.navigate('Conversa', {
    chatId,
    usuarioId: meuId,
    contato: {
      id: outroId,
      name: ehProfissional ? consulta.clienteNome || 'Paciente' : consulta.profissionalNome,
      title: ehProfissional ? 'Paciente' : 'Psicólogo',
      profilePicture: require('../assets/Anderson.png'),
    },
  });
}
