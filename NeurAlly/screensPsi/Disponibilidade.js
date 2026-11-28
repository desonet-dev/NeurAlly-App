import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import SelectField from '../components/SelectField.js';
import { INTERVALOS, BLOQUEIOS } from '../constants/opcoes.js';

import { useEstilos } from '../contexts/TemaContext.js';
import { campoWeb } from '../styles/campos.js';
export default function DisponibilidadePsi({ navigation }) {
  const [styles, cor] = useEstilos(criarStyles);
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  // Estado local para gerenciar os dias da semana ativos
  const [days, setDays] = useState([
    { label: 'Dom', active: false },
    { label: 'Seg', active: true },
    { label: 'Ter', active: true },
    { label: 'Qua', active: false },
    { label: 'Qui', active: true },
    { label: 'Sex', active: true },
    { label: 'Sáb', active: true }
  ]);

  // Estado local para os intervalos de horários disponíveis
  const [horarios, setHorarios] = useState([
    { id: '1', inicio: '08:00', fim: '12:00' },
    { id: '2', inicio: '13:00', fim: '18:00' }
  ]);

  // Estados para as preferências de intervalo e bloqueio
  const [intervalo, setIntervalo] = useState('10 minutos');
  const [bloqueios, setBloqueios] = useState(['Feriados']);

  if (!fontsLoaded) return null;

  // Função para alternar o estado ativo/inativo do dia da semana
  const toggleDay = (index) => {
    const novosDias = [...days];
    novosDias[index].active = !novosDias[index].active;
    setDays(novosDias);
  };

  // Função para remover um horário
  const removerHorario = (id) => {
    setHorarios(horarios.filter(h => h.id !== id));
  };

  // Função para adicionar um novo horário
  const adicionarHorario = () => {
    const novo = { id: String(Date.now()), inicio: '09:00', fim: '17:00' };
    setHorarios([...horarios, novo]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={cor.fg("#1A56DB")} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Disponibilidade</Text>
        </View>

        <View style={styles.divider} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.label}>Horários disponíveis</Text>
          
          {horarios.map((item, index) => (
            <View key={item.id} style={styles.timeRow}>
              <View style={styles.timeInputBox}>
                <TextInput style={styles.timeInput} value={item.inicio} editable={false} />
              </View>
              <View style={styles.timeInputBox}>
                <TextInput style={styles.timeInput} value={item.fim} editable={false} />
              </View>
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => index === 0 ? removerHorario(item.id) : removerHorario(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color={cor.fg("#1A56DB")} />
              </TouchableOpacity>
            </View>
          ))}
          
          <View style={styles.timeRow}>
            <View style={styles.timeInputBox}>
              <TextInput style={styles.timeInput} value="--:--" editable={false} />
            </View>
            <View style={styles.timeInputBox}>
              <TextInput style={styles.timeInput} value="--:--" editable={false} />
            </View>
            <TouchableOpacity style={styles.iconButton} onPress={adicionarHorario}>
              <Ionicons name="add" size={24} color={cor.fg("#1A56DB")} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { marginTop: 10 }]}>Dias disponíveis</Text>
          <View style={styles.daysRow}>
            {days.map((day, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.dayPill, day.active && styles.dayPillActive]}
                onPress={() => toggleDay(index)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayText, day.active && styles.dayTextActive]}>{day.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.spacer} />

          <SelectField
            label="Janela de intervalo entre consultas"
            title="Intervalo entre consultas"
            value={intervalo}
            options={INTERVALOS}
            onChange={setIntervalo}
          />

          <SelectField
            label="Bloqueio de datas"
            value={bloqueios}
            options={BLOQUEIOS}
            onChange={setBloqueios}
            multiple
            placeholder="Nenhum"
          />

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: cor.bg('#9EBDF0'), 
    padding: 20 
  },
  card: { 
    flex: 1, 
    backgroundColor: cor.bg('#FFF'), 
    borderRadius: 20, 
    overflow: 'hidden' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    paddingBottom: 10 
  },
  headerTitle: { 
    fontFamily: 'Montserrat-Bold', 
    fontSize: 20, 
    color: cor.fg('#1A56DB'), 
    marginLeft: 10 
  },
  divider: { 
    height: 2, 
    backgroundColor: cor.bg('#1A56DB'), 
    opacity: 0.5, 
    marginHorizontal: 20, 
    marginBottom: 20 
  },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },
  label: { 
    fontFamily: 'Montserrat-Bold', 
    fontSize: 11, 
    color: cor.fg('#1A56DB'), 
    marginBottom: 10, 
    marginLeft: 5 
  },
  timeRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  timeInputBox: { 
    flex: 1, 
    minWidth: 0, 
    overflow: 'hidden', 
    backgroundColor: cor.bg('#F0F4FF'), 
    borderRadius: 10, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 2, 
    elevation: 2 
  },
  // width 100% + minWidth 0: na web o campo tem largura própria e vazava para fora da caixa.
  timeInput: { 
    width: '100%', 
    minWidth: 0, 
    height: 40, 
    padding: 0, 
    textAlign: 'center', 
    fontFamily: 'Montserrat-Regular', 
    fontSize: 13, 
    color: cor.fg('#333'), 
    ...campoWeb(cor) 
  },
  iconButton: { 
    width: 30, 
    height: 30, 
    flexShrink: 0, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  daysRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },
  dayPill: { 
    flex: 1, 
    height: 35, 
    backgroundColor: cor.bg('#F0F4FF'), 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginHorizontal: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 1, 
    elevation: 2 
  },
  dayPillActive: { 
    backgroundColor: cor.bg('#1A56DB') 
  },
  dayText: { 
    fontFamily: 'Montserrat-Bold', 
    fontSize: 10, 
    color: cor.fg('#1A56DB') 
  },
  dayTextActive: { 
    color: cor.fg('#FFF') 
  },
  spacer: { 
    height: 10 
  },
  inputContainer: { 
    marginBottom: 20 
  },
  dropdownWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: cor.bg('#F0F4FF'), 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    height: 45, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 2, 
    elevation: 2 
  },
  inputText: { 
    fontFamily: 'Montserrat-Regular', 
    fontSize: 13, 
    color: cor.fg('#333') 
  }
});