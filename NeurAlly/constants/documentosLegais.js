// Textos exibidos nas telas "Termos de uso" e "Política de privacidade".
// ATENÇÃO: são um modelo base escrito para o funcionamento atual do app. Antes de publicar
// o app em loja, peça para um(a) advogado(a) revisar e complete o contato do responsável.

export const ULTIMA_ATUALIZACAO = '18 de novembro de 2026';

export const DOCUMENTOS = {
  termos: {
    titulo: 'Termos de uso',
    resumo: 'Regras para usar o NeurAlly, um aplicativo de apoio à saúde mental que conecta pessoas e psicólogos.',
    secoes: [
      {
        titulo: '1. Sobre o aplicativo',
        texto:
          'O NeurAlly ajuda você a acompanhar suas emoções (diário emocional e triagem), encontrar psicólogos, agendar consultas e conversar com profissionais. Ao criar uma conta ou usar o aplicativo, você concorda com estes termos.',
      },
      {
        titulo: '2. O NeurAlly não é atendimento de emergência',
        texto:
          'O aplicativo não substitui atendimento médico ou psicológico presencial e não é um serviço de urgência. Se você estiver em crise ou em risco, procure ajuda imediata: ligue 188 (Centro de Valorização da Vida, 24 horas), 192 (SAMU) ou vá ao pronto-socorro mais próximo.',
      },
      {
        titulo: '3. Sua conta',
        texto:
          'Você deve informar dados verdadeiros no cadastro e manter sua senha em segurança. Tudo o que for feito com a sua conta é de sua responsabilidade. Você pode trocar a senha ou excluir a conta a qualquer momento em Perfil > Configurações.',
      },
      {
        titulo: '4. Psicólogos',
        texto:
          'Os psicólogos cadastrados são profissionais independentes, responsáveis pelo próprio atendimento e pelo cumprimento das normas do Conselho Federal de Psicologia, inclusive o sigilo profissional. O NeurAlly não interfere na condução clínica das consultas.',
      },
      {
        titulo: '5. Consultas, cancelamentos e reagendamentos',
        texto:
          'Você pode marcar, reagendar e cancelar consultas pelo aplicativo. Ao cancelar ou reagendar, o horário reservado é liberado para outras pessoas. Regras de pagamento, reembolso e antecedência mínima podem ser combinadas diretamente com o profissional.',
      },
      {
        titulo: '6. Uso adequado',
        texto:
          'Não use o aplicativo para fraudar, ofender, assediar, enviar conteúdo ilegal, tentar acessar contas de outras pessoas ou prejudicar o funcionamento do serviço. Contas que descumprirem estas regras podem ser suspensas.',
      },
      {
        titulo: '7. Disponibilidade',
        texto:
          'Trabalhamos para manter o aplicativo no ar, mas podem ocorrer instabilidades, manutenções e mudanças de funcionalidades. Lembretes de consulta dependem das permissões de notificação do seu aparelho.',
      },
      {
        titulo: '8. Alterações destes termos',
        texto:
          'Podemos atualizar estes termos. Quando houver mudanças importantes, avisaremos pelo aplicativo. Continuar usando o NeurAlly depois disso significa que você aceita a nova versão.',
      },
    ],
  },

  privacidade: {
    titulo: 'Política de privacidade',
    resumo: 'Como o NeurAlly coleta, usa e protege os seus dados, de acordo com a Lei Geral de Proteção de Dados (LGPD).',
    secoes: [
      {
        titulo: '1. Dados que coletamos',
        texto:
          'Cadastro: nome, e-mail, data de nascimento, CPF, telefone e, para psicólogos, o CRP. Uso do app: diário emocional, respostas da triagem, anotações (psicólogos), consultas agendadas (data, horário, modalidade e pagamento escolhido), mensagens trocadas nas conversas e informação de presença (se você está online).',
      },
      {
        titulo: '2. Dados sensíveis',
        texto:
          'Informações sobre saúde mental são dados pessoais sensíveis. Elas só são usadas para oferecer as funcionalidades que você escolhe usar e nunca são vendidas nem usadas para publicidade.',
      },
      {
        titulo: '3. Para que usamos os dados',
        texto:
          'Para criar e proteger sua conta, permitir agendamentos e conversas, enviar lembretes de consultas, mostrar psicólogos disponíveis e melhorar o funcionamento do aplicativo. A base legal é a execução do serviço que você solicitou e o seu consentimento, que você pode retirar a qualquer momento.',
      },
      {
        titulo: '4. Quem pode ver seus dados',
        texto:
          'O psicólogo que você escolhe vê seu nome e os dados da consulta marcada com ele; as mensagens de uma conversa só são visíveis para os dois participantes. Seu diário e sua triagem ficam acessíveis apenas para você. O diretório público de psicólogos mostra só nome, CRP e especialidade.',
      },
      {
        titulo: '5. Onde os dados ficam guardados',
        texto:
          'Os dados ficam em serviços de nuvem do Google (Firebase), com regras de acesso que restringem cada informação ao seu titular ou aos participantes autorizados. Preferências de tema e idioma ficam apenas no seu aparelho.',
      },
      {
        titulo: '6. Notificações',
        texto:
          'Os lembretes de consulta são notificações agendadas no seu próprio aparelho. Você pode desativá-las nas configurações do sistema.',
      },
      {
        titulo: '7. Seus direitos',
        texto:
          'Pela LGPD você pode confirmar se tratamos seus dados, acessá-los, corrigi-los, pedir a exclusão, revogar o consentimento e pedir informações sobre compartilhamento. Parte disso você faz direto no app (editar dados pessoais e excluir a conta).',
      },
      {
        titulo: '8. Exclusão da conta',
        texto:
          'Ao excluir a conta em Perfil > Configurações, apagamos seu perfil, diário, anotações e triagem e cancelamos suas consultas futuras. Registros que precisem ser mantidos por obrigação legal ou profissional poderão ser conservados pelo período exigido.',
      },
      {
        titulo: '9. Menores de idade',
        texto:
          'O aplicativo é voltado para maiores de 18 anos. O uso por menores deve ser autorizado e acompanhado por um responsável legal.',
      },
      {
        titulo: '10. Contato e alterações',
        texto:
          'Dúvidas e pedidos sobre seus dados podem ser feitos pelos canais de contato do aplicativo. Esta política pode ser atualizada, e a data da última atualização aparece no topo desta tela.',
      },
    ],
  },
};
