import { NavigationContainer } from '@react-navigation/native'
import Rotas from './Rotas.js'
import { AuthProvider } from './contexts/AuthContext.js'
import LembretesConsultas from './components/LembretesConsultas.js'

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <LembretesConsultas />
        <Rotas />
      </NavigationContainer>
    </AuthProvider>
  )
}
