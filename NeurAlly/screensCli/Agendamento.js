import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useFonts } from 'expo-font';
import NavBar from '../components/navBarCli.js';
import paleta from '../styles/Tema.js';

export default function Agendamento({ navigation }) {
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  // Mock de dias para desenhar o calendário visualmente igual ao protótipo
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Quinta', 'Sex', 'Sáb'];
  const calendarDays = [
    ['31', '1', '2', '3', '4', '5', '6'],
    ['7', '8', '9', '10', '11', '12', '13'],
    ['14', '15', '16', '17', '18', '19', '20'],
    ['21', '22', '23', '24', '25', '26', '27'],
    ['28', '29', '30', '1', '2', '3', '4'],
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        
        {/* Card: Suas próximas consultas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Suas próximas consultas</Text>
          <Text style={styles.cardSubtitle}>
            Verifique no calendário abaixo suas próximas consultas!
          </Text>
          
          <TouchableOpacity style={styles.orangeButtonSmall} onPress={() => navigation.navigate('FinalAgendamento')}>
            <Text style={styles.buttonTextWhite}>Agende uma consulta</Text>
          </TouchableOpacity>

          {/* Calendário */}
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              {daysOfWeek.map((day, index) => (
                <Text key={index} style={styles.calendarHeaderText}>{day}</Text>
              ))}
            </View>
            {calendarDays.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.calendarRow}>
                {week.map((day, dayIndex) => {
                  const isCurrentMonth = !(weekIndex === 0 && day === '31') && !(weekIndex === 4 && parseInt(day) < 10);
                  const isToday = day === '15' && isCurrentMonth;
                  
                  return (
                    <View key={dayIndex} style={[styles.calendarDay, isToday && styles.calendarDayActive]}>
                      <Text style={[
                        styles.calendarDayText,
                        !isCurrentMonth && styles.calendarDayTextDisabled,
                        isToday && styles.calendarDayTextActive
                      ]}>
                        {day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* Card: Busca de Profissionais */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Busca de Profissionais</Text>
          <Text style={styles.cardSubtitle}>
            Busque por profissionais qualificados, veja suas especializações, tire dúvidas e agende horários e consultas com eles!
          </Text>
          
          {/* Navega para a Tela 2 */}
          <TouchableOpacity 
            style={styles.orangeButtonLarge}
            onPress={() => navigation.navigate('BuscaProfissionais')} 
          >
            <Text style={styles.buttonTextWhite}>Conhecer profissionais</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
      <NavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: paleta.cor.fundo },
  scrollContent: { padding: 20, paddingBottom: 130 }, // Espaço para o menu flutuante
  card: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  cardTitle: { fontSize: 18, fontFamily: 'Montserrat-Bold', color: '#1A1A1A', marginBottom: 10 },
  cardSubtitle: { fontSize: 13, fontFamily: 'Montserrat-Regular', color: '#333', lineHeight: 18, marginBottom: 15 },
  orangeButtonSmall: {
    backgroundColor: '#FF8C42', alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, marginBottom: 20,
  },
  orangeButtonLarge: {
    backgroundColor: '#FF8C42', alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, marginTop: 10, width: '90%', alignItems: 'center'
  },
  buttonTextWhite: { color: '#FFF', fontFamily: 'Montserrat-Bold', fontSize: 13 },
  calendarContainer: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, overflow: 'hidden' },
  calendarHeader: { flexDirection: 'row', backgroundColor: '#6292D6', paddingVertical: 10 },
  calendarHeaderText: { flex: 1, textAlign: 'center', color: '#FFF', fontFamily: 'Montserrat-Regular', fontSize: 11 },
  calendarRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  calendarDay: { flex: 1, aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#F0F0F0' },
  calendarDayActive: { borderColor: '#6292D6', borderWidth: 2, borderRadius: 20, margin: 2 },
  calendarDayText: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#333' },
  calendarDayTextDisabled: { color: '#FFB890' }, // Cor alaranjada clara para dias de outro mês
  calendarDayTextActive: { color: '#6292D6', fontFamily: 'Montserrat-Bold' },
});