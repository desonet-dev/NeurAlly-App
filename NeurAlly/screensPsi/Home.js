import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import paleta from '../styles/Tema.js';
import NavBarPsi from '../components/navBarPsi.js';
import { useAuth } from '../contexts/AuthContext.js';
import useConsultas from '../hooks/useConsultas.js';
import { diasDaSemana, faixaDeHorario, formatarDataLonga, hojeISO } from '../utils/datas.js';

export default function HomePsicologo({ navigation }) {
  const { perfil } = useAuth();
  // Consultas que os clientes marcaram com este psicólogo.
  const { proximas, datasComConsulta } = useConsultas('profissional');
  const proximaConsulta = proximas[0];
  const primeiroNome = perfil?.nome?.trim().split(' ')[0] || '';
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const semana = diasDaSemana();
  const hoje = hojeISO();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.greetingText}>Olá,</Text>
            <Text style={styles.nameText}>{primeiroNome || 'Doutor(a)'}</Text>
          </View>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarMock} />
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Procure por um paciente" 
            placeholderTextColor="#888"
          />
        </View>

        {proximaConsulta ? (
          <TouchableOpacity style={styles.appointmentCard} activeOpacity={0.8} onPress={() => navigation.navigate('AgendaPsi')}>
            <View style={styles.appointmentHeader}>
              <View style={styles.doctorAvatar}>
                <Ionicons name="person" size={24} color="#6292D6" />
              </View>
              <View style={styles.appointmentInfo}>
                <Text style={styles.doctorName}>{proximaConsulta.clienteNome || 'Paciente'}</Text>
                <Text style={styles.doctorSpecialty}>
                  {proximaConsulta.modalidade === 'online' ? 'Consulta on-line' : 'Consulta presencial'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6292D6" />
            </View>
            <View style={styles.divider} />
            <View style={styles.appointmentFooter}>
              <View style={styles.footerItem}>
                <Ionicons name="calendar-outline" size={16} color="#6292D6" />
                <Text style={styles.footerText}>{formatarDataLonga(proximaConsulta.data)}</Text>
              </View>
              <View style={styles.footerItem}>
                <Ionicons name="time-outline" size={16} color="#6292D6" />
                <Text style={styles.footerText}>{faixaDeHorario(proximaConsulta.horario)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.appointmentCard}>
            <Text style={styles.doctorName}>Nenhuma consulta agendada</Text>
            <Text style={styles.doctorSpecialty}>As consultas marcadas com você aparecem aqui.</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Próximas consultas</Text>

        <View style={styles.calendarRow}>
          {semana.map((item) => {
            const temConsulta = datasComConsulta.has(item.iso);
            const ehHoje = item.iso === hoje;
            return (
              <TouchableOpacity
                key={item.iso}
                style={[styles.dayBox, ehHoje && styles.dayBoxHoje, temConsulta && styles.dayBoxActive]}
                onPress={() => navigation.navigate('AgendaPsi')}
                accessibilityLabel={`${item.abrv}, dia ${item.dia}${temConsulta ? ', com consulta' : ''}`}
              >
                <Text style={[styles.dayText, temConsulta && styles.dayTextActive]}>{item.abrv}</Text>
                <Text style={[styles.dateText, temConsulta && styles.dateTextActive]}>{item.dia}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.orangeCard} onPress={() => navigation.navigate('AnotacoesPsi')}>
          <Text style={styles.orangeCardText}>Anotações</Text>
          <Ionicons name="chevron-forward" size={24} color="#FFF" />
        </TouchableOpacity>

      </ScrollView>

      <NavBarPsi />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: paleta.cor.fundo },
  scrollContent: { padding: 20, paddingBottom: 130 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greetingText: { fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#333' },
  nameText: { fontFamily: 'Montserrat-Bold', fontSize: 22, color: '#1A1A1A' },
  avatarContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#75CB6B', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarMock: { width: '100%', height: '100%', backgroundColor: '#75CB6B' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 25, paddingHorizontal: 15, height: 50, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#333' },
  appointmentCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  appointmentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  doctorAvatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },
  appointmentInfo: { flex: 1, marginLeft: 15 },
  doctorName: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: '#1A56DB' },
  doctorSpecialty: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#666' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  appointmentFooter: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5 },
  footerItem: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontFamily: 'Montserrat-Regular', fontSize: 11, color: '#666', marginLeft: 5 },
  sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#333', marginBottom: 10 },
  calendarRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', borderRadius: 15, padding: 8, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  dayBox: { flex: 1, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 2, marginHorizontal: 1, borderRadius: 10, borderWidth: 1.5, borderColor: 'transparent' },
  dayBoxHoje: { borderColor: '#6292D6' },
  dayBoxActive: { backgroundColor: '#6292D6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  dayText: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#333', marginBottom: 4 },
  dayTextActive: { color: '#FFF' },
  dateText: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: '#333' },
  dateTextActive: { color: '#FFF' },
  orangeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#E29558', borderRadius: 15, padding: 20, height: 120, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  orangeCardText: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#FFF' }
});