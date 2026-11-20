import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator
} from 'react-native';
import { useFonts } from 'expo-font';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LocaleConfig } from 'react-native-calendars';
import NavBar from '../components/navBarCli.js';
import DynamicCalendar from '../components/DynamicCalendar.js';
import { escutarRegistrosPorData, escutarDatasComRegistro } from '../services/diarioService.js';

import { useEstilos } from '../contexts/TemaContext.js';
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
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
  const [styles, cor] = useEstilos(criarStyles);
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
    let cancelarEscuta = () => { };
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
    let cancelarEscuta = () => { };
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
    switch (emocao) {
      case 'triste': return <MaterialCommunityIcons name="emoticon-sad-outline" size={40} color={cor.fg("#FF8C42")} />;
      case 'neutro': return <MaterialCommunityIcons name="emoticon-neutral-outline" size={40} color={cor.fg("#FF8C42")} />;
      case 'feliz': return <MaterialCommunityIcons name="emoticon-happy-outline" size={40} color={cor.fg("#6292D6")} />;
      case 'muitofeliz': return <MaterialCommunityIcons name="emoticon-excited-outline" size={40} color={cor.fg("#6292D6")} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

        <DynamicCalendar
          selectedDate={selectedDate}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          datasComRegistro={datasComRegistro}
        />

        <View style={styles.dateDivider}>
          <View style={styles.line} />
          <Text style={styles.dateTitle}>{formatarDataExtenso(selectedDate)}</Text>
          <View style={styles.line} />
        </View>

        {carregando && (
          <ActivityIndicator size="small" color={cor.fg('#4A77D4')} style={{ marginTop: 10 }} />
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
        <Ionicons name="add" size={32} color={cor.fg("#FFF")} />
      </TouchableOpacity>

      <NavBar />
    </SafeAreaView>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cor.bg('#E4F0F8')
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 130
  },
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: cor.bg('#B0C4DE'),
    opacity: 0.5
  },
  dateTitle: {
    marginHorizontal: 15,
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: cor.fg('#6292D6')
  },
  card: {
    backgroundColor: cor.bg('#FFF'),
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  cardData: {
    fontSize: 12,
    fontFamily: 'Montserrat-Bold',
    color: cor.fg('#1A1A1A'),
    marginBottom: 5
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: cor.fg('#1A1A1A'),
    textTransform: 'uppercase'
  },
  cardText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: cor.fg('#333'),
    lineHeight: 18
  },
  avisoContainer: {
    paddingVertical: 30,
    alignItems: 'center'
  },
  avisoTexto: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: cor.fg('#5A6B87'),
    textAlign: 'center',
    paddingHorizontal: 20
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    backgroundColor: cor.bg('#1A56DB'),
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  }
});