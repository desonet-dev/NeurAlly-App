import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import NavBar from '../components/navBarCli.js';
import paleta from '../styles/Tema.js';
import { useAuth } from '../contexts/AuthContext.js';

export default function Perfil({ navigation }) {
  const { perfil, sair } = useAuth();
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const handleSair = () => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await sair();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          
          <View style={styles.avatarContainer}>
            <Image source={require('../assets/Anderson.png')} style={styles.avatar} />
            <TouchableOpacity style={styles.editAvatarButton}>
              <MaterialIcons name="edit" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.nomeUsuario}>{perfil?.nome || 'Usuário'}</Text>
          {!!perfil?.email && <Text style={styles.emailUsuario}>{perfil.email}</Text>}

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <Text style={styles.menuItemText}>Configurações</Text>
            <Ionicons name="settings-sharp" size={20} color="#1A56DB" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('DadosPessoais')}>
            <Text style={styles.menuItemText}>Dados pessoais</Text>
            <MaterialIcons name="security" size={20} color="#1A56DB" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Preferencias')}>
            <Text style={styles.menuItemText}>Preferências</Text>
            <Ionicons name="options" size={20} color="#1A56DB" />
          </TouchableOpacity>

          <View style={styles.spacer} />

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Consultas prévias</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Solicitar reagendamento</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleSair}>
            <Ionicons name="log-out-outline" size={18} color="#D64545" style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>Sair da conta</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
      <NavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: paleta.cor.fundoCard, padding: 20 },
  card: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden', paddingBottom: 20 },
  scrollContent: { padding: 20, paddingBottom: 100, alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 20, marginTop: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: paleta.cor.fundo },
  editAvatarButton: { position: 'absolute', bottom: 0, right: 10, backgroundColor: '#000', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  divider: { width: '100%', height: 2, backgroundColor: '#1A56DB', opacity: 0.5, marginBottom: 20 },
  nomeUsuario: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1A1A1A', marginBottom: 2 },
  emailUsuario: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#5A6B87', marginBottom: 15 },
  menuItem: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F0F4FF', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 15, marginBottom: 12 },
  menuItemText: { fontFamily: 'Montserrat-Bold', color: '#1A56DB', fontSize: 14 },
  spacer: { height: 40 },
  actionButton: { width: '100%', backgroundColor: '#F0F4FF', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 15, marginBottom: 12, alignItems: 'center' },
  actionButtonText: { fontFamily: 'Montserrat-Bold', color: '#1A56DB', fontSize: 14 },
  logoutButton: { width: '100%', flexDirection: 'row', backgroundColor: '#FDEDED', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 15, marginTop: 8, alignItems: 'center', justifyContent: 'center' },
  logoutButtonText: { fontFamily: 'Montserrat-Bold', color: '#D64545', fontSize: 14 }
});