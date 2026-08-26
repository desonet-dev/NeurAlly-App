import { createDrawerNavigator } from '@react-navigation/drawer';
const Drawer = createDrawerNavigator();

import LoadingScreen from './screens/Carregamento.js';
import HomeScreen from './screensCli/Home.js';
import PerfilScreen from './screens/Perfil.js';
import ConversasScreen from './screensCli/Conversas.js';
import TriagemScreen from './screensCli/Triagem.js';
import ConversaScreen from './screensCli/Conversa.js';
import CadastroScreen from './screens/Cadastro.js';
import EsqueciSenhaScreen from './screens/RecSenha.js';
import LoginScreen from './screens/Login.js'

const screens = [
  { name: 'Home', component: HomeScreen },
  { name: 'Triagem', component: TriagemScreen },
  { name: 'Esqueci Senha', component: EsqueciSenhaScreen},
  { name: 'Login', component: LoginScreen},
  { name: 'Cadastro', component: CadastroScreen},
  { name: 'Perfil', component: PerfilScreen },
  { name: 'Conversa', component: ConversaScreen},
  { name: 'Conversas', component: ConversasScreen},
  { name: 'Loading', component: LoadingScreen },
];

export default function Rotas() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      {screens.map(({ name, component }) => (
        <Drawer.Screen
          key={name}
          name={name}
          component={component}
        />
      ))}
    </Drawer.Navigator>
  );
}