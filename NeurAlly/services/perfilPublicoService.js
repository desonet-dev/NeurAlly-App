import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig.js';

// Perfil público de uma pessoa do app. Devolve SÓ o que pode ser mostrado para os outros:
//  - todos: nome e foto;
//  - psicólogos: também CRP, especialidade e biografia (vêm do diretório público `psicologos`).
// CPF, e-mail, telefone, data de nascimento e endereço nunca saem daqui.
export async function carregarPerfilPublico(id) {
  const [usuario, psicologo] = await Promise.all([
    getDoc(doc(db, 'usuarios', id)),
    getDoc(doc(db, 'psicologos', id)).catch(() => null),
  ]);

  const u = usuario.exists() ? usuario.data() : {};
  const p = psicologo && psicologo.exists() ? psicologo.data() : {};
  const ehPsicologo = u.tipo === 'psicologo' || !!(psicologo && psicologo.exists());

  const perfil = {
    id,
    tipo: ehPsicologo ? 'psicologo' : 'cliente',
    nome: p.nome || u.nomeSocial || u.nome || '',
    foto: u.foto || p.foto || '',
  };

  if (ehPsicologo) {
    perfil.crp = p.crp || u.crp || '';
    perfil.especialidade = p.especialidade || '';
    perfil.biografia = p.biografia || u.biografia || '';
  }
  return perfil;
}
