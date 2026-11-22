import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { dataDeISO, proximosDias } from '../utils/datas.js';
import useHoje from '../hooks/useHoje.js';

import { useEstilos } from '../contexts/TemaContext.js';
// Calendário de 7 dias: começa em HOJE e mostra os 6 dias seguintes (muda sozinho a cada dia).
//  - Dia com consulta marcada: fica azul.
//  - Hoje (sem consulta): ganha só um contorno azul.
//  - Demais dias: normais.
// `datasConsulta` é um Set com datas AAAA-MM-DD (vem do hook useConsultas).
export default function SmallCalendar({ datasConsulta = new Set() }) {
  const [styles, cor] = useEstilos(criarStyles);
  const navigation = useNavigation();

  const hoje = useHoje();
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });
  if (!fontsLoaded) {
    return null;
  }

  const semana = proximosDias(7, dataDeISO(hoje));

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

const criarStyles = (cor) => StyleSheet.create({
  calendarView: {
    height: 87,
    flexDirection: 'row',
    backgroundColor: cor.bg('#FFF'),
    marginHorizontal: 20,
    marginBottom: 35,
    borderRadius: 20,
    borderBottomWidth: 5,
    borderColor: cor.bd('#D8D8D8'),
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
    borderColor: cor.bd('#4894FE'),
  },
  appointmentDateView: {
    backgroundColor: cor.bg('#4894FE'),
    borderColor: cor.bd('#4894FE'),
  },
  dayNameText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    color: cor.fg('#131A22'),
  },
  dayNumText: {
    fontSize: 17,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    color: cor.fg('#131A22'),
  },
  appointmentText: {
    color: cor.fg('#FFF'),
  },
});
