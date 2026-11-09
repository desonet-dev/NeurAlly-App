import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import paleta from '../styles/Tema.js';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { diasDaSemana, hojeISO } from '../utils/datas.js';

// Calendário da semana atual (segunda a domingo).
//  - Dia com consulta marcada: fica azul.
//  - Hoje (sem consulta): ganha só um contorno azul.
//  - Demais dias: normais.
// `datasConsulta` é um Set com datas AAAA-MM-DD (vem do hook useConsultas).
export default function SmallCalendar({ datasConsulta = new Set() }) {
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return null;
  }

  const semana = diasDaSemana();
  const hoje = hojeISO();

  return (
    <View style={styles.calendarView}>
      {semana.map((d) => {
        const temConsulta = datasConsulta.has(d.iso);
        const ehHoje = d.iso === hoje;

        return (
          <TouchableOpacity
            key={d.iso}
            style={[styles.dateView, ehHoje && styles.todayDateView, temConsulta && styles.appointmentDateView]}
            onPress={() => navigation.navigate('Agendamento')}
            accessibilityLabel={`${d.abrv}, dia ${d.dia}${temConsulta ? ', com consulta marcada' : ''}`}
          >
            <Text style={[styles.dayNameText, temConsulta && styles.appointmentText]}>{d.abrv}</Text>
            <View style={{ flex: 1 }} />
            <Text style={[styles.dayNumText, temConsulta && styles.appointmentText]}>{d.dia}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  calendarView: {
    height: 87,
    flexDirection: 'row',
    backgroundColor: paleta.cor.branco,
    marginHorizontal: 20,
    marginBottom: 35,
    borderRadius: 20,
    borderBottomWidth: 5,
    borderColor: paleta.cor.cinza,
  },
  dateView: {
    flex: 1,
    margin: 2,
    paddingVertical: 8,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  todayDateView: {
    borderColor: paleta.cor.a7,
  },
  appointmentDateView: {
    backgroundColor: paleta.cor.a7,
    borderColor: paleta.cor.a7,
  },
  dayNameText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    color: '#131A22',
  },
  dayNumText: {
    fontSize: 17,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    color: '#131A22',
  },
  appointmentText: {
    color: paleta.cor.branco,
  },
});
