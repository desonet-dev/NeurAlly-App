import { NavigationContainer } from '@react-navigation/native'
import Rotas from './Rotas.js'
import { AuthProvider } from './contexts/AuthContext.js'

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Rotas />
      </NavigationContainer>
    </AuthProvider>
  )
}