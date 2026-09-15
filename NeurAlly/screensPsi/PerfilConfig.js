import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import paleta from '../styles/Tema.js';

export default function PerfilConfig({ navigation }) {
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const ConfigButton = ({ title }) => (
    <TouchableOpacity style={styles.button}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#1A56DB" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configurações</Text>
        </View>

        <View style={styles.divider} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <ConfigButton title="Alterar senha" />
          <ConfigButton title="Autenticação em 2 etapas" />
          <ConfigButton title="Termos de uso" />
          <ConfigButton title="Política de privacidade" />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Excluir/desativar conta</Text>
            <Ionicons name="trash-outline" size={20} color="#1A56DB" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: paleta.cor.fundoCard, padding: 20 },
  card: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10 },
  headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#1A56DB', marginLeft: 10 },
  divider: { height: 2, backgroundColor: '#1A56DB', opacity: 0.5, marginHorizontal: 20, marginBottom: 20 },
  scrollContent: { paddingHorizontal: 20 },
  button: { width: '100%', backgroundColor: '#F0F4FF', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 15, marginBottom: 15, alignItems: 'flex-start' },
  buttonText: { fontFamily: 'Montserrat-Bold', color: '#1A56DB', fontSize: 14 },
  footer: { padding: 20, paddingBottom: 30 },
  deleteButton: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F0F4FF', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 15, borderWidth: 1, borderColor: '#D9E4FF' },
  deleteButtonText: { fontFamily: 'Montserrat-Bold', color: '#1A56DB', fontSize: 14 }
});