import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useFonts } from 'expo-font';
import NavBar from '../components/navBarCli.js';
import DynamicCalendar from '../components/DynamicCalendar.js';
import paleta from '../styles/Tema.js';

// Função auxiliar para pegar a data atual no formato ISO (AAAA-MM-DD)
function getHojeISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export default function Agendamento({ navigation }) {
  // Estado para controlar a data selecionada no calendário
  const [selectedDate, setSelectedDate] = useState(getHojeISO());

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Suas próximas consultas</Text>
          <Text style={styles.cardSubtitle}>
            Verifique no calendário abaixo suas próximas consultas!
          </Text>

          <TouchableOpacity style={styles.orangeButtonSmall} onPress={() => navigation.navigate('FinalAgendamento')}>
            <Text style={styles.buttonTextWhite}>Agende uma consulta</Text>
          </TouchableOpacity>

          <DynamicCalendar
            selectedDate={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Busca de Profissionais</Text>
          <Text style={styles.cardSubtitle}>
            Busque por profissionais qualificados, veja suas especializações, tire dúvidas e agende horários e consultas com eles!
          </Text>

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
  container: {
    flex: 1,
    backgroundColor: paleta.cor.fundo
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 130
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#1A1A1A',
    marginBottom: 10
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#333',
    lineHeight: 18,
    marginBottom: 15
  },
  orangeButtonSmall: {
    backgroundColor: '#FF8C42',
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  orangeButtonLarge: {
    backgroundColor: '#FF8C42',
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    width: '90%',
    alignItems: 'center'
  },
  buttonTextWhite: {
    color: '#FFF',
    fontFamily: 'Montserrat-Bold',
    fontSize: 13
  },
});