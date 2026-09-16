import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import paleta from '../styles/Tema.js';
import { useAuth } from '../contexts/AuthContext.js';

export default function PerfilPsi({ navigation }) {
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

  const MenuItem = ({ title, icon, onPress, iconFamily = 'Ionicons' }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuItemText}>{title}</Text>
      {iconFamily === 'Ionicons' ? (
        <Ionicons name={icon} size={20} color="#1A56DB" />
      ) : (
        <MaterialIcons name={icon} size={20} color="#1A56DB" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.avatarContainer}>
            <Image source={require('../assets/Anderson.png')} style={styles.avatar} />
            <TouchableOpacity style={styles.editAvatarButton}>
              <MaterialIcons name="edit" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.nomeUsuario}>{perfil?.nome || 'Psicólogo(a)'}</Text>
          {!!perfil?.crp && <Text style={styles.emailUsuario}>CRP {perfil.crp}</Text>}

          <View style={styles.divider} />

          <MenuItem title="Configurações" icon="settings-sharp" onPress={() => navigation.navigate('PerfilConfig')} />
          <MenuItem title="Dados pessoais" icon="info" iconFamily="MaterialIcons" onPress={() => navigation.navigate('PerfilDadosPsi')} />
          <MenuItem title="Disponibilidade" icon="time" onPress={() => navigation.navigate('DisponibilidadePsi')} />
          <MenuItem title="Preferências" icon="options" onPress={() => navigation.navigate('PerfilPref')} />
          <MenuItem title="Dados de exibição" icon="eye" onPress={() => navigation.navigate('ExibicaoPsi')} />

          <View style={styles.spacer} />

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Consultas prévias</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleSair}>
            <Ionicons name="log-out-outline" size={18} color="#D64545" style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>Sair da conta</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: paleta.cor.fundoCard, padding: 20 },
  card: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden', paddingBottom: 20 },
  scrollContent: { padding: 20, alignItems: 'center' },
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