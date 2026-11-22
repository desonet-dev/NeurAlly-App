import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
import LoadingScreen from './screens/Carregamento.js';
import LoginScreen from './screens/Login.js';
import CadastroScreen from './screens/Cadastro.js';
import EsqueciSenhaScreen from './screens/RecSenha.js';
import CompletarCadastroScreen from './screens/CompletarCadastro.js';

import HomeScreen from './screensCli/Home.js';
import TriagemScreen from './screensCli/Triagem.js';
import PerfilScreen from './screensCli/Perfil.js';
import DadosPessoaisScreen from './screensCli/DadosPessoais.js';
import PreferenciasScreen from './screensCli/Preferencias.js';
import ConversasScreen from './screensCli/Conversas.js';
import ConversaScreen from './screensCli/Conversa.js';
import DiarioEmocionalScreen from './screensCli/DiarioEmocional.js';
import EscreverDiarioScreen from './screensCli/EscreverDiario.js';
import AgendamentoScreen from './screensCli/Agendamento.js';
import BuscaProfissionaisScreen from './screensCli/BuscaProfissionais.js';
import PerfilProfissionalScreen from './screensCli/PerfilProfissional.js';
import FinalAgendamentoScreen from './screensCli/FinalAgendamento.js';
import PagamentoScreen from './screensCli/Pagamento.js';
import ConsultasPreviasScreen from './screens/ConsultasPrevias.js';
import DocumentoLegalScreen from './screens/DocumentoLegal.js';
import JogosRelaxantesScreen from './screens/JogosRelaxantes.js';
import JardimZenScreen from './screens/JardimZen.js';

import HomePsiScreen from './screensPsi/Home.js';
import PerfilPsiScreen from './screensPsi/Perfil.js';
import PerfilConfigScreen from './screensPsi/PerfilConfig.js';
import PerfilDadosPsiScreen from './screensPsi/DadosPessoais.js';
import DisponibilidadePsiScreen from './screensPsi/Disponibilidade.js';
import PerfilPrefScreen from './screensPsi/Preferencias.js';
import ExibicaoPsiScreen from './screensPsi/Exibicao.js';
import AnotacoesPsiScreen from './screensPsi/Anotacoes.js';
import EscreverAnotacaoPsiScreen from './screensPsi/EscreverAnotacao.js';
import AgendaPsiScreen from './screensPsi/Agenda.js';
import ConversasPsiScreen from './screensPsi/Conversas.js';

const screens = [
  { name: 'Loading', component: LoadingScreen },
  { name: 'Login', component: LoginScreen },
  { name: 'Cadastro', component: CadastroScreen },
  { name: 'EsqueciSenha', component: EsqueciSenhaScreen },
  { name: 'CompletarCadastro', component: CompletarCadastroScreen },

  { name: 'Home', component: HomeScreen },
  { name: 'Triagem', component: TriagemScreen },
  { name: 'Perfil', component: PerfilScreen },
  { name: 'DadosPessoais', component: DadosPessoaisScreen },
  { name: 'Preferencias', component: PreferenciasScreen },
  { name: 'Conversas', component: ConversasScreen },
  { name: 'Conversa', component: ConversaScreen },
  { name: 'DiarioEmocional', component: DiarioEmocionalScreen },
  { name: 'EscreverDiario', component: EscreverDiarioScreen },
  { name: 'Agendamento', component: AgendamentoScreen },
  { name: 'BuscaProfissionais', component: BuscaProfissionaisScreen },
  { name: 'PerfilProfissional', component: PerfilProfissionalScreen },
  { name: 'FinalAgendamento', component: FinalAgendamentoScreen },
  { name: 'Pagamento', component: PagamentoScreen },
  { name: 'ConsultasPrevias', component: ConsultasPreviasScreen },
  { name: 'DocumentoLegal', component: DocumentoLegalScreen },
  { name: 'JogosRelaxantes', component: JogosRelaxantesScreen },
  { name: 'JardimZen', component: JardimZenScreen },

  { name: 'HomePsi', component: HomePsiScreen },
  { name: 'PerfilPsi', component: PerfilPsiScreen },
  { name: 'PerfilConfig', component: PerfilConfigScreen },
  { name: 'PerfilDadosPsi', component: PerfilDadosPsiScreen },
  { name: 'DisponibilidadePsi', component: DisponibilidadePsiScreen },
  { name: 'PerfilPref', component: PerfilPrefScreen },
  { name: 'ExibicaoPsi', component: ExibicaoPsiScreen },
  { name: 'AnotacoesPsi', component: AnotacoesPsiScreen },
  { name: 'EscreverAnotacaoPsi', component: EscreverAnotacaoPsiScreen },
  { name: 'AgendaPsi', component: AgendaPsiScreen },
  { name: 'ConversasPsi', component: ConversasPsiScreen },
];

export default function Rotas() {
  return (
    <Stack.Navigator
      initialRouteName="Loading"
      screenOptions={{ headerShown: false }}
    >
      {screens.map(({ name, component }) => (
        <Stack.Screen key={name} name={name} component={component} />
      ))}
    </Stack.Navigator>
  );
}
