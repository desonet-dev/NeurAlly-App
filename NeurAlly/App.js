import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import Rotas from './Rotas.js'
import { AuthProvider } from './contexts/AuthContext.js'
import { TemaProvider, useTema } from './contexts/TemaContext.js'
import LembretesConsultas from './components/LembretesConsultas.js'

// Navegação com o fundo do tema escolhido (evita "piscar" branco entre telas no tema escuro).
function Navegacao() {
  const { escuro, cor } = useTema()
  const base = escuro ? DarkTheme : DefaultTheme
  const tema = {
    ...base,
    colors: { ...base.colors, background: cor.bg('#E4F0F8'), card: cor.bg('#FFF'), text: cor.fg('#1A1A1A') },
  }

  return (
    <NavigationContainer theme={tema}>
      <StatusBar style={escuro ? 'light' : 'dark'} />
      <LembretesConsultas />
      <Rotas />
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <TemaProvider>
      <AuthProvider>
        <Navegacao />
      </AuthProvider>
    </TemaProvider>
  )
}
