import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';

export default function PerfilProfissional({ route, navigation }) {
  // Recebe os dados, ou usa um mock se a navegação vier vazia para testes
  const profissional = route?.params?.profissional || { nome: 'Dr. Thiago', esp: 'Especialista em traumas' };
  
  const [selectedDay, setSelectedDay] = useState('Ter');
  const [selectedTime, setSelectedTime] = useState('9:00');

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const dias = [{ day: 'Dom', num: '3' }, { day: 'Seg', num: '4' }, { day: 'Ter', num: '5' }, { day: 'Qua', num: '6' }, { day: 'Qui', num: '7' }];
  const horarios = ['9:00', '9:30', '10:00', '10:30', '11:00', '11:30'];

  return (
    <View style={styles.container}>
      {/* Imagem de Fundo (Topo) */}
      <View style={styles.headerImageContainer}>
        {/* Substitua pela imagem em alta qualidade */}
        <Image source={require('../assets/Anderson.png')} style={styles.headerImage} resizeMode="cover" />
        
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={30} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Conteúdo Principal */}
      <ScrollView contentContainerStyle={styles.contentScroll} showsVerticalScrollIndicator={false}>
        
        {/* Card Azul Flutuante (Sobrepondo a imagem) */}
        <View style={styles.nameCard}>
          <Text style={styles.nameCardTitle}>{profissional.nome}</Text>
          <Text style={styles.nameCardSubtitle}>{profissional.esp}</Text>
        </View>

        {/* Secão Agenda */}
        <Text style={styles.sectionTitle}>Agenda</Text>
        <View style={styles.daysContainer}>
          {dias.map((d, index) => {
            const isActive = selectedDay === d.day;
            return (
              <TouchableOpacity 
                key={index} 
                style={[styles.dayCard, isActive && styles.dayCardActive]}
                onPress={() => setSelectedDay(d.day)}
              >
                <Text style={[styles.dayText, isActive && styles.textWhite]}>{d.day}</Text>
                <Text style={[styles.dayNum, isActive && styles.textWhite]}>{d.num}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Seçāo Horários */}
        <Text style={styles.sectionTitle}>Horários disponíveis</Text>
        <View style={styles.timesContainer}>
          {horarios.map((time, index) => {
            const isActive = selectedTime === time;
            return (
              <TouchableOpacity 
                key={index} 
                style={[styles.timePill, isActive && styles.timePillActive]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[styles.timeText, isActive && styles.textWhite]}>{time}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Botão Confirmar */}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={() => navigation.navigate('FinalAgendamento', {
            profissional,
            dia: selectedDay,
            horario: selectedTime,
          })}
        >
          <Text style={styles.confirmButtonText}>Confirmar</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E4F0F8' },
  headerImageContainer: { height: '35%', width: '100%', position: 'relative' },
  headerImage: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(98, 146, 214, 0.8)', borderRadius: 20, padding: 5 },
  
  contentScroll: { paddingHorizontal: 20, paddingBottom: 100 },
  nameCard: {
    backgroundColor: '#6292D6', borderRadius: 15, paddingVertical: 20, paddingHorizontal: 15,
    alignItems: 'center', marginTop: -40, marginBottom: 30, // Margem negativa para sobrepor a foto
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5,
  },
  nameCardTitle: { color: '#FFF', fontSize: 22, fontFamily: 'Montserrat-Bold', marginBottom: 5 },
  nameCardSubtitle: { color: '#FFF', fontSize: 13, fontFamily: 'Montserrat-Regular' },
  
  sectionTitle: { fontSize: 15, fontFamily: 'Montserrat-Bold', color: '#1A1A1A', marginBottom: 15, marginTop: 10 },
  
  daysContainer: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', borderRadius: 20, padding: 15, marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  dayCard: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 },
  dayCardActive: { backgroundColor: '#6292D6' },
  dayText: { fontSize: 14, fontFamily: 'Montserrat-Bold', color: '#333', marginBottom: 5 },
  dayNum: { fontSize: 16, fontFamily: 'Montserrat-Regular', color: '#333' },
  
  timesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 40 },
  timePill: { backgroundColor: '#FFF', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  timePillActive: { backgroundColor: '#FF8C42' },
  timeText: { fontSize: 13, fontFamily: 'Montserrat-Bold', color: '#999' },
  textWhite: { color: '#FFF' },
  
  confirmButton: { backgroundColor: '#6292D6', paddingVertical: 15, borderRadius: 30, alignItems: 'center', width: '90%', alignSelf: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  confirmButtonText: { color: '#FFF', fontSize: 16, fontFamily: 'Montserrat-Bold' },
});