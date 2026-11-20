import { db } from './firebaseConfig';
import {
  collection,
  doc,
  documentId,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

// Presença online guardada em usuarios/{uid}: { online: boolean, ultimoAcesso: Timestamp }.
// Enquanto o app está aberto, o AuthContext atualiza `ultimoAcesso` a cada minuto (heartbeat).
// Se o app fechar sem avisar (bateria acabou, aba fechada), `ultimoAcesso` para de andar
// e a pessoa deixa de aparecer como online depois de TEMPO_LIMITE_ONLINE_MS.
export const INTERVALO_HEARTBEAT_MS = 60 * 1000;
export const TEMPO_LIMITE_ONLINE_MS = 3 * 60 * 1000;

export async function definirPresenca(uid, online) {
  if (!uid) return;
  try {
    await setDoc(
      doc(db, 'usuarios', uid),
      { online, ultimoAcesso: serverTimestamp() },
      { merge: true }
    );
  } catch (erro) {
    // Presença é um extra: nunca deve quebrar o app (ex.: regras do Firestore bloqueando a escrita).
    console.warn('Não foi possível atualizar a presença:', erro?.message || erro);
  }
}

function estaOnline(dados) {
  if (!dados?.online) return false;
  // Logo após gravar, serverTimestamp() ainda é null no cache local: nesse caso vale como "agora".
  const ultimo = typeof dados.ultimoAcesso?.toMillis === 'function' ? dados.ultimoAcesso.toMillis() : Date.now();
  return Date.now() - ultimo < TEMPO_LIMITE_ONLINE_MS;
}

// Escuta em tempo real quais dos `ids` estão online. callback recebe um array de ids.
// Retorna a função para cancelar a escuta.
export function ouvirContatosOnline(ids, callback) {
  const lista = [...new Set((ids || []).filter(Boolean))];
  if (lista.length === 0) {
    callback([]);
    return () => {};
  }

  // O Firestore limita o operador "in" a 30 valores por consulta.
  const blocos = [];
  for (let i = 0; i < lista.length; i += 30) blocos.push(lista.slice(i, i + 30));

  const dadosPorBloco = {};
  const emitir = () => {
    const onlineAgora = Object.values(dadosPorBloco)
      .flat()
      .filter(({ dados }) => estaOnline(dados))
      .map(({ id }) => id);
    callback(onlineAgora);
  };

  const cancelamentos = blocos.map((bloco, indice) =>
    onSnapshot(
      query(collection(db, 'usuarios'), where(documentId(), 'in', bloco)),
      (snapshot) => {
        dadosPorBloco[indice] = snapshot.docs.map((d) => ({ id: d.id, dados: d.data() }));
        emitir();
      },
      (erro) => {
        console.warn('Erro ao escutar contatos online:', erro?.message || erro);
        dadosPorBloco[indice] = [];
        emitir();
      }
    )
  );

  // Reavalia o limite de tempo mesmo quando nenhum documento muda.
  const timer = setInterval(emitir, INTERVALO_HEARTBEAT_MS);

  return () => {
    clearInterval(timer);
    cancelamentos.forEach((cancelar) => cancelar());
  };
}
