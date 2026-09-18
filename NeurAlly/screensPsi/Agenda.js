import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import NavBarPsi from '../components/navBarPsi.js';
import paleta from '../styles/Tema.js';

export default function AgendaPsi({ navigation }) {
  const [diaSelecionado, setDiaSelecionado] = useState('Seg');

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const dias = [
    { dia: 'Seg', data: '4' },
    { dia: 'Ter', data: '5' },
    { dia: 'Qua', data: '6' },
    { dia: 'Qui', data: '7' },
    { dia: 'Sex', data: '8' },
  ];

  // Dados de exemplo — quando houver agendamentos reais no Firestore,
  // basta trocar este objeto por uma consulta, no mesmo padrão usado
  // no diário emocional e nas anotações.
  const consultasPorDia = {
    Seg: [
      { id: '1', paciente: 'Marina Alves', horario: '09:00 - 10:00', tipo: 'Sessão individual' },
      { id: '2', paciente: 'Rafael Dias', horario: '11:00 - 12:00', tipo: 'Primeira consulta' },
    ],
    Ter: [
      { id: '3', paciente: 'Carla Souza', horario: '14:00 - 15:00', tipo: 'Sessão individual' },
    ],
    Qua: [
      { id: '4', paciente: 'Marina Alves', horario: '09:00 - 10:00', tipo: 'Sessão individual' },
      { id: '5', paciente: 'Bruno Lima', horario: '16:00 - 17:00', tipo: 'Retorno' },
    ],
    Qui: [],
    Sex: [
      { id: '6', paciente: 'Rafael Dias', horario: '10:00 - 11:00', tipo: 'Sessão individual' },
    ],
  };

  const consultas = consultasPorDia[diaSelecionado] || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

        <Text style={styles.pageTitle}>Agenda</Text>
        <Text style={styles.pageSubtitle}>Suas consultas da semana.</Text>

        <View style={styles.calendarRow}>
          {dias.map((item) => {
            const ativo = item.dia === diaSelecionado;
            return (
              <TouchableOpacity
                key={item.dia}
                style={[styles.dayBox, ativo && styles.dayBoxActive]}
                onPress={() => setDiaSelecionado(item.dia)}
              >
                <Text style={[styles.dayText, ativo && styles.dayTextActive]}>{item.dia}</Text>
                <Text style={[styles.dateText, ativo && styles.dateTextActive]}>{item.data}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {consultas.length === 0 ? (
          <View style={styles.avisoContainer}>
            <Text style={styles.avisoTexto}>Nenhuma consulta marcada para este dia.</Text>
          </View>
        ) : (
          consultas.map((consulta) => (
            <View key={consulta.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={22} color="#6292D6" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.pacienteNome}>{consulta.paciente}</Text>
                  <Text style={styles.consultaTipo}>{consulta.tipo}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6292D6" />
              </View>

              <View style={styles.divider} />

              <View style={styles.cardFooter}>
                <Ionicons name="time-outline" size={16} color="#6292D6" />
                <Text style={styles.horarioText}>{consulta.horario}</Text>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity
          style={styles.disponibilidadeButton}
          onPress={() => navigation.navigate('DisponibilidadePsi')}
        >
          <Ionicons name="settings-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.disponibilidadeText}>Editar disponibilidade</Text>
        </TouchableOpacity>

      </ScrollView>

      <NavBarPsi />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: paleta.cor.fundo },
  scrollContent: { padding: 20, paddingBottom: 130 },
  pageTitle: { fontFamily: 'Montserrat-Bold', fontSize: 24, color: '#1A1A1A', marginBottom: 4 },
  pageSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#5A6B87', marginBottom: 20 },
  calendarRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  dayBox: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  dayBoxActive: { backgroundColor: '#6292D6' },
  dayText: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#333', marginBottom: 4 },
  dayTextActive: { color: '#FFF' },
  dateText: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: '#333' },
  dateTextActive: { color: '#FFF' },
  card: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 15 },
  pacienteNome: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: '#1A56DB' },
  consultaTipo: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#666' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5 },
  horarioText: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#666', marginLeft: 6 },
  avisoContainer: { paddingVertical: 30, alignItems: 'center' },
  avisoTexto: { fontSize: 13, fontFamily: 'Montserrat-Regular', color: '#5A6B87', textAlign: 'center' },
  disponibilidadeButton: { flexDirection: 'row', backgroundColor: '#6292D6', borderRadius: 15, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  disponibilidadeText: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: '#FFF' }
});
