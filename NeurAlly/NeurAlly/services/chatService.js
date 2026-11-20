import { db } from '../services/firebaseConfig';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  setDoc, 
  doc, 
  getDoc,
  where 
} from 'firebase/firestore';

// Mais recentes primeiro. Uma conversa que acabou de ser criada/atualizada neste aparelho ainda não
// tem horário do servidor (null), então vai para o topo.
const ordenarPorAtualizacao = (docs) => {
  const quando = (d) => {
    const t = d.data().ultimaAtualizacao;
    return t ? (t.toMillis ? t.toMillis() : Number(t) || 0) : Number.MAX_SAFE_INTEGER;
  };
  return [...docs].sort((a, b) => quando(b) - quando(a));
};

export const obterOuCriarChat = async (clienteId, psicologoId) => {
  const chatId = clienteId < psicologoId ? `${clienteId}_${psicologoId}` : `${psicologoId}_${clienteId}`;
  
  const chatRef = doc(db, 'chats', chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      participantes: [clienteId, psicologoId],
      criadoEm: serverTimestamp(),
      ultimaMensagem: 'Olá! Iniciamos a conversa.',
      ultimaAtualizacao: serverTimestamp()
    });
  }

  return chatId;
};

export const enviarMensagem = async (chatId, texto, remetenteId) => {
  try {
    const mensagensRef = collection(db, 'chats', chatId, 'mensagens');
    
    await addDoc(mensagensRef, {
      texto,
      remetenteId,
      criadoEm: serverTimestamp()
    });

    const chatRef = doc(db, 'chats', chatId);
    await setDoc(chatRef, {
      ultimaMensagem: texto,
      ultimaAtualizacao: serverTimestamp()
    }, { merge: true });
    
  } catch (error) {
    console.error("Erro ao enviar mensagem: ", error);
  }
};

export const ouvirMensagens = (chatId, callback) => {
  const mensagensRef = collection(db, 'chats', chatId, 'mensagens');
  const q = query(mensagensRef, orderBy('criadoEm', 'asc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const mensagens = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(mensagens);
  }, (error) => {
    console.error("Erro ao escutar mensagens: ", error);
  });

  return unsubscribe;
};

export const ouvirConversasDoUsuario = (userId, callback) => {
  const chatsDeTeste = [
    {
      chatId: 'chat_teste_1',
      id: 'id_psicologo_exemplo_1',
      name: 'Dra. Brinquedos',
      title: 'Psiquiatra',
      recentMessage: 'Próxima consulta dia 01/02.',
      online: true, // apenas para os dados de teste; os reais vêm de presencaService
      profilePicture: require('../assets/Anderson.png'),
    },
    {
      chatId: 'chat_teste_2',
      id: 'id_psicologo_exemplo_2',
      name: 'Dra. Aline Juliana',
      title: 'Psicólogo',
      recentMessage: 'Você é capaz em casos de trauma?',
      profilePicture: require('../assets/Anderson.png'),
    },
    {
      chatId: 'chat_teste_3',
      id: 'id_psicologo_exemplo_3',
      name: 'Dr. Carrinhos',
      title: 'Psicólogo',
      recentMessage: 'Você é noob em casos de trauma?',
      online: true, // apenas para os dados de teste
      profilePicture: require('../assets/Anderson.png'),
    }
  ];

  const chatsRef = collection(db, 'chats');
  // Sem orderBy no Firestore: combinar array-contains com orderBy exigiria criar um índice composto.
  // A ordenação (mais recente primeiro) é feita aqui, no app.
  const q = query(chatsRef, where('participantes', 'array-contains', userId));

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const listaChatsFirebase = [];

    for (const docSnap of ordenarPorAtualizacao(snapshot.docs)) {
      const chatData = docSnap.data();
      const participantes = chatData.participantes || [];
      const outroId = participantes.find(id => id !== userId);

      let dadosContato = {
        id: outroId,
        name: 'Usuário',
        title: 'Profissional',
        profilePicture: require('../assets/Anderson.png'),
      };

      if (outroId) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', outroId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            dadosContato.name = userData.nome || 'Usuário';
            dadosContato.title = userData.tipo === 'psicologo' ? 'Psicólogo' : 'Cliente';
          }
        } catch (e) {
          console.error("Erro ao buscar dados do contato: ", e);
        }
      }

      listaChatsFirebase.push({
        chatId: docSnap.id,
        ...dadosContato,
        recentMessage: chatData.ultimaMensagem || 'Nenhuma mensagem ainda...',
      });
    }

    const idsReais = new Set(listaChatsFirebase.map(c => c.chatId));
    const testesFiltrados = chatsDeTeste.filter(c => !idsReais.has(c.chatId));

    const listaFinal = [...listaChatsFirebase, ...testesFiltrados];
    callback(listaFinal);

  }, (error) => {
    console.error("Erro ao escutar conversas, exibindo apenas dados de teste: ", error);
    callback(chatsDeTeste);
  });

  return unsubscribe;
};

export const ouvirConversasDoPsicologo = (userId, callback) => {
  const pacientesDeTeste = [
    {
      chatId: 'chat_teste_psi_1',
      id: 'id_paciente_1',
      name: 'Marina Alves',
      title: 'Em acompanhamento',
      recentMessage: 'Obrigada pela sessão de hoje!',
      emAcompanhamento: true,
      profilePicture: require('../assets/Anderson.png'),
    },
    {
      chatId: 'chat_teste_psi_2',
      id: 'id_paciente_2',
      name: 'Rafael Dias',
      title: 'Primeira consulta',
      recentMessage: 'Posso remarcar para quinta?',
      emAcompanhamento: true,
      profilePicture: require('../assets/Anderson.png'),
    },
    {
      chatId: 'chat_teste_psi_3',
      id: 'id_paciente_3',
      name: 'Carla Souza',
      title: 'Em acompanhamento',
      recentMessage: 'Fiz os exercícios que combinamos.',
      emAcompanhamento: false,
      profilePicture: require('../assets/Anderson.png'),
    },
    {
      chatId: 'chat_teste_psi_4',
      id: 'id_paciente_4',
      name: 'Bruno Lima',
      title: 'Retorno',
      recentMessage: 'Até a próxima semana.',
      emAcompanhamento: false,
      profilePicture: require('../assets/Anderson.png'),
    },
    {
      chatId: 'chat_teste_psi_5',
      id: 'id_paciente_5',
      name: 'Helena Costa',
      title: 'Primeira consulta',
      recentMessage: 'Gostaria de marcar um horário.',
      emAcompanhamento: false,
      profilePicture: require('../assets/Anderson.png'),
    },
    {
      chatId: 'chat_teste_psi_6',
      id: 'id_paciente_6',
      name: 'Diego Martins',
      title: 'Em acompanhamento',
      recentMessage: 'Consegui dormir melhor esta semana.',
      emAcompanhamento: false,
      profilePicture: require('../assets/Anderson.png'),
    },
  ];

  const chatsRef = collection(db, 'chats');
  // Sem orderBy no Firestore: combinar array-contains com orderBy exigiria criar um índice composto.
  // A ordenação (mais recente primeiro) é feita aqui, no app.
  const q = query(chatsRef, where('participantes', 'array-contains', userId));

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const listaChatsFirebase = [];

    for (const docSnap of ordenarPorAtualizacao(snapshot.docs)) {
      const chatData = docSnap.data();
      const participantes = chatData.participantes || [];
      const outroId = participantes.find(id => id !== userId);

      let dadosContato = {
        id: outroId,
        name: 'Paciente',
        title: 'Cliente',
        emAcompanhamento: true,
        profilePicture: require('../assets/Anderson.png'),
      };

      if (outroId) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', outroId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            dadosContato.name = userData.nome || 'Paciente';
            dadosContato.title = userData.tipo === 'psicologo' ? 'Profissional' : 'Cliente';
          }
        } catch (e) {
          console.error("Erro ao buscar dados do paciente: ", e);
        }
      }

      listaChatsFirebase.push({
        chatId: docSnap.id,
        ...dadosContato,
        recentMessage: chatData.ultimaMensagem || 'Nenhuma mensagem ainda...',
      });
    }

    const idsReais = new Set(listaChatsFirebase.map(c => c.chatId));
    const testesFiltrados = pacientesDeTeste.filter(c => !idsReais.has(c.chatId));

    const listaFinal = [...listaChatsFirebase, ...testesFiltrados];
    callback(listaFinal);

  }, (error) => {
    console.error("Erro ao escutar conversas do psicólogo, exibindo testes: ", error);
    callback(pacientesDeTeste);
  });

  return unsubscribe;
};