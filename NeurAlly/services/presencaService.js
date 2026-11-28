import { db } from './firebaseConfig';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';

// Presença online guardada em usuarios/{uid}: { online: boolean, ultimoAcesso: Timestamp }.
// Enquanto o app está aberto, o AuthContext atualiza `ultimoAcesso` a cada minuto (heartbeat).
// Se o app fechar sem avisar (bateria acabou, aba fechada), `ultimoAcesso` para de andar
// e a pessoa deixa de aparecer como online depois de TEMPO_LIMITE_ONLINE_MS.
export const INTERVALO_HEARTBEAT_MS = 60 * 1000;
export const TEMPO_LIMITE_ONLINE_MS = 3 * 60 * 1000;

// Durante a exclusão da conta a presença é pausada: senão uma atualização atrasada recriaria o
// documento do usuário logo depois de apagado.
let presencaPausada = false;
export function pausarPresenca(pausar) {
  presencaPausada = !!pausar;
}

export async function definirPresenca(uid, online) {
  if (!uid || presencaPausada) return;
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
// Cada contato é escutado pelo próprio documento (usuarios/{id}): é o que as regras do Firestore permitem
// (consultas em lote na coleção `usuarios` são bloqueadas), por isso antes ninguém aparecia como ativo.
export function ouvirContatosOnline(ids, callback) {
  const lista = [...new Set((ids || []).filter(Boolean))];
  if (lista.length === 0) {
    callback([]);
    return () => {};
  }

  const dadosPorId = {};
  const emitir = () => {
    callback(lista.filter((id) => dadosPorId[id] && estaOnline(dadosPorId[id])));
  };

  const cancelamentos = lista.map((id) =>
    onSnapshot(
      doc(db, 'usuarios', id),
      (snapshot) => {
        dadosPorId[id] = snapshot.exists() ? snapshot.data() : null;
        emitir();
      },
      (erro) => {
        console.warn('Erro ao escutar contato online:', erro?.message || erro);
        dadosPorId[id] = null;
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
