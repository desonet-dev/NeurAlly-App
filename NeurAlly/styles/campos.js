import { Platform } from 'react-native';

// Na web, o navegador pinta o texto de campos preenchidos automaticamente (e-mail, senha...) de preto,
// mesmo no tema escuro. Declarar o esquema de cores do campo faz o navegador usar texto claro no escuro.
// Uso dentro de um estilo de campo: { ...campoWeb(cor) }
export const campoWeb = (cor) => (Platform.OS === 'web' ? { colorScheme: cor.escuro ? 'dark' : 'light' } : {});
