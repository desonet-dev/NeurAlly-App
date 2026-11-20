import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { useFonts } from 'expo-font';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import NavBar from '../components/navBarCli.js';
import { adicionarRegistro } from '../services/diarioService.js';

import { useEstilos } from '../contexts/TemaContext.js';
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};

if (LocaleConfig.defaultLocale !== 'pt-br') {
  LocaleConfig.defaultLocale = 'pt-br';
}

function getHojeISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export default function EscreverDiario({ navigation, route }) {
  const [styles, cor] = useEstilos(criarStyles);
  const [titulo, setTitulo] = useState('');
  const [relato, setRelato] = useState('');
  const [humor, setHumor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(route?.params?.data || getHojeISO());
  const [salvando, setSalvando] = useState(false);

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const handleEnviar = async () => {
    if (!titulo.trim() || !relato.trim()) {
      Alert.alert('Preencha os campos', 'Escreva um título e um relato antes de enviar.');
      return;
    }
    if (!humor) {
      Alert.alert('Selecione uma emoção', 'Toque em um dos ícones para indicar como você se sentiu.');
      return;
    }

    setSalvando(true);
    try {
      await adicionarRegistro({
        titulo: titulo.trim(),
        texto: relato.trim(),
        emocao: humor,
        data: selectedDate,
      });
      navigation.goBack();
    } catch (erro) {
      console.warn('Erro ao salvar registro do diário:', erro);
      Alert.alert(
        'Não foi possível salvar',
        'Verifique sua conexão e a configuração do Firebase, e tente novamente.'
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <TextInput
            style={styles.inputTitle}
            placeholder="Digite o título de seu relato aqui..."
            placeholderTextColor={cor.fg("#888")}
            value={titulo}
            onChangeText={setTitulo}
            editable={!salvando}
          />

          <TextInput
            style={styles.inputBody}
            placeholder="Digite o seu relato aqui..."
            placeholderTextColor={cor.fg("#888")}
            multiline={true}
            textAlignVertical="top"
            value={relato}
            onChangeText={setRelato}
            editable={!salvando}
          />

          <View style={styles.moodContainer}>
            <TouchableOpacity
              style={[styles.moodIcon, humor === 'triste' && styles.moodIconActiveOrange]}
              onPress={() => setHumor('triste')}
              disabled={salvando}
            >
              <MaterialCommunityIcons name="emoticon-sad-outline" size={45} color={cor.fg("#FF8C42")} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.moodIcon, humor === 'neutro' && styles.moodIconActiveOrange]}
              onPress={() => setHumor('neutro')}
              disabled={salvando}
            >
              <MaterialCommunityIcons name="emoticon-neutral-outline" size={45} color={cor.fg("#FF8C42")} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.moodIcon, humor === 'feliz' && styles.moodIconActiveBlue]}
              onPress={() => setHumor('feliz')}
              disabled={salvando}
            >
              <MaterialCommunityIcons name="emoticon-happy-outline" size={45} color={cor.fg("#6292D6")} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.moodIcon, humor === 'muitofeliz' && styles.moodIconActiveBlue]}
              onPress={() => setHumor('muitofeliz')}
              disabled={salvando}
            >
              <MaterialCommunityIcons name="emoticon-excited-outline" size={45} color={cor.fg("#6292D6")} />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarWrapper}>
            <Calendar
              current={selectedDate}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: 'transparent',
                  selectedTextColor: cor.fg('#6292D6'),
                }
              }}
              theme={{
                calendarBackground: cor.bg('#FFF'),
                textSectionTitleColor: cor.fg('#FFF'),
                selectedDayBackgroundColor: 'transparent',
                selectedDayTextColor: cor.fg('#6292D6'),
                todayTextColor: cor.fg('#6292D6'),
                dayTextColor: cor.fg('#333'),
                textDisabledColor: cor.fg('#FFB890'),
                arrowColor: cor.fg('#FFF'),
                monthTextColor: cor.fg('#FFF'),
                textDayFontFamily: 'Montserrat-Regular',
                textMonthFontFamily: 'Montserrat-Bold',
                textDayHeaderFontFamily: 'Montserrat-Regular',
                textDayFontSize: 12,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 12,
                'stylesheet.calendar.header': {
                  header: {
                    backgroundColor: cor.bg('#6292D6'),
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 10,
                  },
                  dayHeader: {
                    color: cor.fg('#FFF'),
                    fontFamily: 'Montserrat-Regular',
                    fontSize: 12,
                    marginTop: 10,
                    marginBottom: 10,
                  },
                  week: {
                    marginTop: 0,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    backgroundColor: cor.bg('#6292D6'),
                    paddingHorizontal: 10,
                  }
                },
                'stylesheet.day.basic': {
                  selected: {
                    borderColor: cor.bd('#6292D6'),
                    borderWidth: 1.5,
                    borderRadius: 20,
                  }
                }
              }}
            />
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.submitButton, salvando && styles.submitButtonDisabled]}
              onPress={handleEnviar}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator size="small" color={cor.fg("#FFF")} />
              ) : (
                <Text style={styles.submitButtonText}>Enviar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={salvando}
            >
              <Ionicons name="close" size={30} color={cor.fg("#FFF")} />
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
      <NavBar />
    </SafeAreaView>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  container: { flex: 1, backgroundColor: cor.bg('#E4F0F8') },
  scrollContent: { padding: 20, paddingBottom: 130 },
  inputTitle: { backgroundColor: cor.bg('#FFF'), borderRadius: 25, paddingHorizontal: 20, height: 50, fontSize: 14, fontFamily: 'Montserrat-Regular', marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  inputBody: { backgroundColor: cor.bg('#FFF'), borderRadius: 15, paddingHorizontal: 20, paddingTop: 15, height: 160, fontSize: 14, fontFamily: 'Montserrat-Regular', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  moodContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  moodIcon: { backgroundColor: cor.bg('#FFF'), width: 70, height: 70, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  moodIconActiveOrange: { borderColor: cor.bd('#FF8C42'), backgroundColor: cor.bg('#FFF3E0') },
  moodIconActiveBlue: { borderColor: cor.bd('#6292D6'), backgroundColor: cor.bg('#E3F2FD') },
  calendarWrapper: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 25,
    backgroundColor: cor.bg('#FFF'),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20 },
  submitButton: { backgroundColor: cor.bg('#6292D6'), paddingVertical: 15, paddingHorizontal: 40, borderRadius: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3, minWidth: 120, alignItems: 'center' },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: cor.fg('#FFF'), fontSize: 16, fontFamily: 'Montserrat-Bold' },
  cancelButton: { backgroundColor: cor.bg('#FF8C42'), width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 }
});
