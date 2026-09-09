import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function Perfil({ navigation }) {
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../assets/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../assets/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

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

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#9EBDF0', padding: 20 },
  card: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden', paddingBottom: 20 },
  scrollContent: { padding: 20, alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 20, marginTop: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E4F0F8' },
  editAvatarButton: { position: 'absolute', bottom: 0, right: 10, backgroundColor: '#000', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  divider: { width: '100%', height: 2, backgroundColor: '#1A56DB', opacity: 0.5, marginBottom: 20 },
  menuItem: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F0F4FF', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 15, marginBottom: 12 },
  menuItemText: { fontFamily: 'Montserrat-Bold', color: '#1A56DB', fontSize: 14 },
  spacer: { height: 40 },
  actionButton: { width: '100%', backgroundColor: '#F0F4FF', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 15, marginBottom: 12, alignItems: 'center' },
  actionButtonText: { fontFamily: 'Montserrat-Bold', color: '#1A56DB', fontSize: 14 }
});