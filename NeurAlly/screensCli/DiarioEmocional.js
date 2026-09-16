import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator
} from 'react-native';
import { useFonts } from 'expo-font';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import NavBar from '../components/navBarCli.js';
import paleta from '../styles/Tema.js';
import { escutarRegistrosPorData, escutarDatasComRegistro } from '../services/diarioService.js';

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

function getHojeISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function formatarDataExtenso(dataISO) {
  const [ano, mes, dia] = dataISO.split('-');
  const nomeMes = LocaleConfig.locales['pt-br'].monthNames[parseInt(mes, 10) - 1];
  return `${parseInt(dia, 10)} de ${nomeMes.toLowerCase()}`;
}

export default function DiarioEmocional({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(getHojeISO());
  const [relatos, setRelatos] = useState([]);
  const [datasComRegistro, setDatasComRegistro] = useState(new Set());
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  useEffect(() => {
    let cancelarEscuta = () => {};
    let ativo = true;

    escutarDatasComRegistro(
      (datas) => {
        if (ativo) setDatasComRegistro(datas);
      },
      (erroRecebido) => {
        if (ativo) setErro(erroRecebido);
      }
    ).then((unsubscribe) => {
      if (ativo) cancelarEscuta = unsubscribe;
      else unsubscribe();
    });

    return () => {
      ativo = false;
      cancelarEscuta();
    };
  }, []);

  useEffect(() => {
    let cancelarEscuta = () => {};
    let ativo = true;
    setCarregando(true);

    escutarRegistrosPorData(
      selectedDate,
      (registros) => {
        if (ativo) {
          setRelatos(registros);
          setCarregando(false);
        }
      },
      (erroRecebido) => {
        if (ativo) {
          setErro(erroRecebido);
          setCarregando(false);
        }
      }
    ).then((unsubscribe) => {
      if (ativo) cancelarEscuta = unsubscribe;
      else unsubscribe();
    });

    return () => {
      ativo = false;
      cancelarEscuta();
    };
  }, [selectedDate]);

  if (!fontsLoaded) return null;

  const getEmotionIcon = (emocao) => {
    switch(emocao) {
      case 'triste': return <MaterialCommunityIcons name="emoticon-sad-outline" size={40} color="#FF8C42" />;
      case 'neutro': return <MaterialCommunityIcons name="emoticon-neutral-outline" size={40} color="#FF8C42" />;
      case 'feliz': return <MaterialCommunityIcons name="emoticon-happy-outline" size={40} color="#6292D6" />;
      case 'muitofeliz': return <MaterialCommunityIcons name="emoticon-excited-outline" size={40} color="#6292D6" />;
      default: return null;
    }
  };

  const markedDates = {};
  datasComRegistro.forEach((data) => {
    markedDates[data] = {
      ...(markedDates[data] || {}),
      dots: [{ key: 'registro', color: '#FF8C42' }],
    };
  });
  markedDates[selectedDate] = {
    ...(markedDates[selectedDate] || {}),
    selected: true,
    selectedColor: 'transparent',
    selectedTextColor: '#6292D6',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

        <View style={styles.calendarWrapper}>
          <Calendar
            current={selectedDate}
            markingType={'multi-dot'}
            markedDates={markedDates}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            theme={{
              calendarBackground: '#FFF',
              textSectionTitleColor: '#FFF',
              textSectionTitleDisabledColor: '#FFF',
              selectedDayBackgroundColor: 'transparent',
              selectedDayTextColor: '#6292D6',
              todayTextColor: '#6292D6',
              dayTextColor: '#333',
              textDisabledColor: '#FFB890',
              dotColor: '#FF8C42',
              selectedDotColor: '#FF8C42',
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
              'stylesheet.day.multiDot': {
                selected: {
                  borderColor: '#6292D6',
                  borderWidth: 1.5,
                  borderRadius: 20,
                }
              }
            }}
          />
        </View>

        <View style={styles.dateDivider}>
          <View style={styles.line} />
          <Text style={styles.dateTitle}>{formatarDataExtenso(selectedDate)}</Text>
          <View style={styles.line} />
        </View>

        {carregando && (
          <ActivityIndicator size="small" color={paleta.cor.a5} style={{ marginTop: 10 }} />
        )}

        {!carregando && erro && (
          <View style={styles.avisoContainer}>
            <Text style={styles.avisoTexto}>
              Não foi possível carregar os registros. Verifique a configuração do Firebase e sua conexão.
            </Text>
          </View>
        )}

        {!carregando && !erro && relatos.length === 0 && (
          <View style={styles.avisoContainer}>
            <Text style={styles.avisoTexto}>
              Nenhum registro neste dia. Toque no + para adicionar o primeiro.
            </Text>
          </View>
        )}

        {!carregando && !erro && relatos.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardData}>Data: {item.data}</Text>
                <Text style={styles.cardTitle}>{item.titulo}</Text>
              </View>
              {getEmotionIcon(item.emocao)}
            </View>
            <Text style={styles.cardText}>{item.texto}</Text>
          </View>
        ))}

      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('EscreverDiario', { data: selectedDate })}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      <NavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: paleta.cor.fundo },
  scrollContent: { padding: 20, paddingBottom: 130 },
  calendarWrapper: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#FFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateDivider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  line: { flex: 1, height: 2, backgroundColor: '#B0C4DE', opacity: 0.5 },
  dateTitle: { marginHorizontal: 15, fontSize: 20, fontFamily: 'Montserrat-Bold', color: '#6292D6' },
  card: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardData: { fontSize: 12, fontFamily: 'Montserrat-Bold', color: '#1A1A1A', marginBottom: 5 },
  cardTitle: { fontSize: 16, fontFamily: 'Montserrat-Bold', color: '#1A1A1A', textTransform: 'uppercase' },
  cardText: { fontSize: 13, fontFamily: 'Montserrat-Regular', color: '#333', lineHeight: 18 },
  avisoContainer: { paddingVertical: 30, alignItems: 'center' },
  avisoTexto: { fontSize: 13, fontFamily: 'Montserrat-Regular', color: '#5A6B87', textAlign: 'center', paddingHorizontal: 20 },
  fab: { position: 'absolute', right: 20, bottom: 90, backgroundColor: '#1A56DB', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 }
});
