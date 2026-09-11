import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  SafeAreaView, TextInput 
} from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Calendar, LocaleConfig } from 'react-native-calendars';

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

export default function FinalAgendamento({ navigation }) {
  const [selectedDate, setSelectedDate] = useState('2026-08-15');
  const [modalidade, setModalidade] = useState('presencial');
  const [horario, setHorario] = useState('9:00');
  const [profissional, setProfissional] = useState('');

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../assets/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../assets/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const horarios = ['9:00', '9:30', '10:00', '10:30', '11:00', '11:30'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#1A56DB" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agendamento</Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Escolha um profissional" 
            placeholderTextColor="#888"
            value={profissional}
            onChangeText={setProfissional}
          />
        </View>

        <View style={styles.calendarWrapper}>
          <Calendar
            current={'2026-08-15'}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: 'transparent',
                selectedTextColor: '#6292D6',
              }
            }}
            theme={{
              calendarBackground: '#FFF',
              textSectionTitleColor: '#FFF',
              selectedDayBackgroundColor: 'transparent',
              selectedDayTextColor: '#6292D6',
              todayTextColor: '#6292D6',
              dayTextColor: '#333',
              textDisabledColor: '#FFB890',
              arrowColor: '#FFF',
              monthTextColor: '#FFF',
              textDayFontFamily: 'Montserrat-Regular',
              textMonthFontFamily: 'Montserrat-Bold',
              textDayHeaderFontFamily: 'Montserrat-Regular',
              textDayFontSize: 12,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12,
              'stylesheet.calendar.header': {
                header: {
                  backgroundColor: '#6292D6',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 10,
                },
                dayHeader: {
                  color: '#FFF',
                  fontFamily: 'Montserrat-Regular',
                  fontSize: 12,
                  marginTop: 10,
                  marginBottom: 10,
                },
                week: {
                  marginTop: 0,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  backgroundColor: '#6292D6',
                  paddingHorizontal: 10,
                }
              },
              'stylesheet.day.basic': {
                selected: {
                  borderColor: '#6292D6',
                  borderWidth: 1.5,
                  borderRadius: 20,
                }
              }
            }}
          />
        </View>

        <Text style={styles.sectionTitle}>Modalidade</Text>
        <View style={styles.modalidadeContainer}>
          <TouchableOpacity 
            style={[styles.modalidadeCard, modalidade === 'presencial' && styles.modalidadeCardActive]}
            onPress={() => setModalidade('presencial')}
          >
            <Text style={[styles.modalidadeText, modalidade === 'presencial' && styles.modalidadeTextActive]}>Presencial</Text>
            <Text style={[styles.modalidadePrice, modalidade === 'presencial' && styles.modalidadeTextActive]}>R$20,00</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modalidadeCard, modalidade === 'online' && styles.modalidadeCardActive]}
            onPress={() => setModalidade('online')}
          >
            <Text style={[styles.modalidadeText, modalidade === 'online' && styles.modalidadeTextActive]}>On-line</Text>
            <Text style={[styles.modalidadePrice, modalidade === 'online' && styles.modalidadeTextActive]}>R$20,00</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Horários disponíveis</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horariosContainer}>
          {horarios.map((item, index) => {
            const isSelected = horario === item;
            return (
              <TouchableOpacity 
                key={index} 
                style={[styles.horarioPill, isSelected && styles.horarioPillActive]}
                onPress={() => setHorario(item)}
              >
                <Text style={[styles.horarioText, isSelected && styles.horarioTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={() => navigation.navigate('Pagamento')}
        >
          <Text style={styles.confirmButtonText}>Confirmar</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E4F0F8' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#1A56DB', marginLeft: 10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 25, paddingHorizontal: 15, height: 50, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#333' },
  calendarWrapper: { borderRadius: 15, overflow: 'hidden', marginBottom: 20, backgroundColor: '#FFF', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#333', marginBottom: 12 },
  modalidadeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalidadeCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 15, paddingVertical: 20, alignItems: 'center', marginHorizontal: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3, borderWidth: 2, borderColor: 'transparent' },
  modalidadeCardActive: { backgroundColor: '#FFF', borderColor: '#1A56DB' },
  modalidadeText: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1A56DB', marginBottom: 5 },
  modalidadePrice: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1A56DB' },
  modalidadeTextActive: { color: '#1A56DB' },
  horariosContainer: { paddingBottom: 20 },
  horarioPill: { backgroundColor: '#FFF', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 20, marginRight: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  horarioPillActive: { backgroundColor: '#FF8C42' },
  horarioText: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: '#333' },
  horarioTextActive: { color: '#FFF' },
  confirmButton: { backgroundColor: '#6292D6', borderRadius: 25, paddingVertical: 18, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  confirmButtonText: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#FFF' }
});