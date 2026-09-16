import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import paleta from '../styles/Tema.js';
import { useAuth } from '../contexts/AuthContext.js';

export default function HomePsicologo({ navigation }) {
  const { perfil } = useAuth();
  const primeiroNome = perfil?.nome?.trim().split(' ')[0] || '';
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const days = [
    { day: 'Dom', date: '3', active: true },
    { day: 'Seg', date: '4', active: false },
    { day: 'Ter', date: '5', active: false },
    { day: 'Qua', date: '6', active: false },
    { day: 'Qui', date: '7', active: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
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

        <View style={styles.appointmentCard}>
          <View style={styles.appointmentHeader}>
            <View style={styles.doctorAvatar}>
              <Ionicons name="person" size={24} color="#6292D6" />
            </View>
            <View style={styles.appointmentInfo}>
              <Text style={styles.doctorName}>Paciente Carrinhos</Text>
              <Text style={styles.doctorSpecialty}>Paciente de traumas</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6292D6" />
          </View>
          <View style={styles.divider} />
          <View style={styles.appointmentFooter}>
            <View style={styles.footerItem}>
              <Ionicons name="calendar-outline" size={16} color="#6292D6" />
              <Text style={styles.footerText}>Domingo, 12 Jun.</Text>
            </View>
            <View style={styles.footerItem}>
              <Ionicons name="time-outline" size={16} color="#6292D6" />
              <Text style={styles.footerText}>11:00 - 12:00</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Próximas consultas</Text>

        <View style={styles.calendarRow}>
          {days.map((item, index) => (
            <View key={index} style={[styles.dayBox, item.active && styles.dayBoxActive]}>
              <Text style={[styles.dayText, item.active && styles.dayTextActive]}>{item.day}</Text>
              <Text style={[styles.dateText, item.active && styles.dateTextActive]}>{item.date}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.orangeCard}>
          <Text style={styles.orangeCardText}>Anotações</Text>
          <Ionicons name="chevron-forward" size={24} color="#FFF" />
        </TouchableOpacity>

      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={22} color="#1A56DB" />
          <Text style={[styles.navText, { color: '#1A56DB' }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="happy-outline" size={22} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="calendar-outline" size={22} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbubble-outline" size={22} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('PerfilPsi')}>
          <Ionicons name="person-outline" size={22} color="#888" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: paleta.cor.fundo },
  scrollContent: { padding: 20, paddingBottom: 100 },
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
  calendarRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  dayBox: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  dayBoxActive: { backgroundColor: '#6292D6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  dayText: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#333', marginBottom: 4 },
  dayTextActive: { color: '#FFF' },
  dateText: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: '#333' },
  dateTextActive: { color: '#FFF' },
  orangeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#E29558', borderRadius: 15, padding: 20, height: 120, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  orangeCardText: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#FFF' },
  bottomNav: { position: 'absolute', bottom: 15, left: 20, right: 20, backgroundColor: '#FFF', borderRadius: 25, flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 5 },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontFamily: 'Montserrat-Regular', fontSize: 10, marginTop: 2 }
});