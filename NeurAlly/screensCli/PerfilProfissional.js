import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import NavBar from '../components/navBarCli.js';
import { escutarHorariosOcupados } from '../services/consultasService.js';
import { blocosDaConsulta, HORARIOS_PADRAO, horarioJaPassou, nomeDoDia, proximosDias } from '../utils/datas.js';

import { useEstilos } from '../contexts/TemaContext.js';
// Quantos dias à frente o cliente pode escolher (contando a partir de hoje).
const DIAS_NA_AGENDA = 14;

export default function PerfilProfissional({ route, navigation }) {
  const [styles, cor] = useEstilos(criarStyles);
  const insets = useSafeAreaInsets();
  const profissional = route?.params?.profissional || { nome: 'Dr. Thiago', esp: 'Especialista em traumas' };
  
  // Os dias vêm da data de hoje (mudam sozinhos a cada dia em que o app é aberto).
  const dias = useMemo(() => proximosDias(DIAS_NA_AGENDA), []);
  const [selectedDay, setSelectedDay] = useState(dias[0].iso);
  const [selectedTime, setSelectedTime] = useState(null);
  const [ocupados, setOcupados] = useState(new Set());

  // Horários que esse psicólogo já tem reservados no dia escolhido (por qualquer cliente).
  useEffect(() => {
    setOcupados(new Set());
    if (!profissional.uid) return undefined;
    return escutarHorariosOcupados(profissional.uid, selectedDay, setOcupados);
  }, [profissional.uid, selectedDay]);

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  const horarios = HORARIOS_PADRAO;
  const indisponivel = (h) =>
    horarioJaPassou(selectedDay, h) || blocosDaConsulta(h).some((bloco) => ocupados.has(bloco));
  const livres = horarios.filter((h) => !indisponivel(h));

  // Se o horário escolhido deixou de estar livre (mudou o dia, alguém reservou...), escolhe o primeiro livre.
  const horarioEscolhido = selectedTime && !indisponivel(selectedTime) ? selectedTime : livres[0] || null;

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerImageContainer}>
        <Image source={profissional.foto ? { uri: profissional.foto } : require('../assets/profissionalExemplo.png')} style={styles.headerImage} resizeMode="cover" />
        
        <TouchableOpacity style={[styles.backButton, { top: insets.top + 10 }]} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={30} color={cor.fg("#FFF")} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentScroll} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        
        <View style={styles.nameCard}>
          <Text style={styles.nameCardTitle}>{profissional.nome}</Text>
          <Text style={styles.nameCardSubtitle}>{profissional.esp}</Text>
        </View>

        <Text style={styles.sectionTitle}>Agenda</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.daysScroll}
          contentContainerStyle={styles.daysContainer}
        >
          {dias.map((d) => {
            const isActive = selectedDay === d.iso;
            return (
              <TouchableOpacity
                key={d.iso}
                style={[styles.dayCard, isActive && styles.dayCardActive]}
                onPress={() => setSelectedDay(d.iso)}
                accessibilityLabel={`${d.hoje ? 'Hoje, ' : ''}${nomeDoDia(d.iso)}, ${d.dia} de ${d.mes}`}
              >
                <Text style={[styles.dayText, isActive && styles.textWhite]}>{d.hoje ? 'Hoje' : d.abrv}</Text>
                <Text style={[styles.dayNum, isActive && styles.textWhite]}>{d.dia}</Text>
                <Text style={[styles.dayMes, isActive && styles.textWhite]}>{d.mes}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Seção Horários */}
        <Text style={styles.sectionTitle}>Horários disponíveis</Text>
        <View style={styles.timesContainer}>
          {horarios.map((time) => {
            const bloqueado = indisponivel(time);
            const isActive = horarioEscolhido === time;
            return (
              <TouchableOpacity
                key={time}
                style={[styles.timePill, isActive && styles.timePillActive, bloqueado && styles.timePillIndisponivel]}
                onPress={() => setSelectedTime(time)}
                disabled={bloqueado}
                accessibilityLabel={bloqueado ? `${time}, indisponível` : time}
              >
                <Text style={[styles.timeText, isActive && styles.textWhite, bloqueado && styles.timeTextIndisponivel]}>{time}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {livres.length === 0 && (
          <Text style={styles.semHorarios}>Não há horários livres neste dia. Escolha outro dia.</Text>
        )}

        {/* Botão Confirmar */}
        <TouchableOpacity
          style={[styles.confirmButton, !horarioEscolhido && styles.confirmButtonDisabled]}
          disabled={!horarioEscolhido}
          onPress={() => navigation.navigate('FinalAgendamento', {
            profissional,
            data: selectedDay,
            horario: horarioEscolhido,
          })}
        >
          <Text style={styles.confirmButtonText}>Confirmar</Text>
        </TouchableOpacity>

      </ScrollView>
      <NavBar />
    </View>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  container: { flex: 1, backgroundColor: cor.bg('#E4F0F8') },
  headerImageContainer: { height: '35%', width: '100%', position: 'relative' },
  headerImage: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', left: 20, backgroundColor: 'rgba(98, 146, 214, 0.8)', borderRadius: 20, padding: 5 },
  
  contentScroll: { paddingHorizontal: 20, paddingBottom: 130 },
  nameCard: {
    backgroundColor: cor.bg('#6292D6'), borderRadius: 15, paddingVertical: 20, paddingHorizontal: 15,
    alignItems: 'center', marginTop: 20, marginBottom: 30,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5,
  },
  nameCardTitle: { color: cor.fg('#FFF'), fontSize: 22, fontFamily: 'Montserrat-Bold', marginBottom: 5 },
  nameCardSubtitle: { color: cor.fg('#FFF'), fontSize: 13, fontFamily: 'Montserrat-Regular' },
  
  sectionTitle: { fontSize: 15, fontFamily: 'Montserrat-Bold', color: cor.fg('#1A1A1A'), marginBottom: 15, marginTop: 10 },
  
  daysScroll: { marginHorizontal: -20, marginBottom: 30, flexGrow: 0 },
  daysContainer: { paddingHorizontal: 20, paddingVertical: 4, gap: 10 },
  dayCard: { alignItems: 'center', minWidth: 64, paddingVertical: 12, paddingHorizontal: 10, borderRadius: 16, backgroundColor: cor.bg('#FFF'), shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  dayCardActive: { backgroundColor: cor.bg('#6292D6') },
  dayText: { fontSize: 13, fontFamily: 'Montserrat-Bold', color: cor.fg('#333'), marginBottom: 4 },
  dayNum: { fontSize: 18, fontFamily: 'Montserrat-Bold', color: cor.fg('#333') },
  dayMes: { fontSize: 11, fontFamily: 'Montserrat-Regular', color: cor.fg('#777'), marginTop: 2 },
  
  timesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 40 },
  timePill: { backgroundColor: cor.bg('#FFF'), paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  timePillActive: { backgroundColor: cor.bg('#FF8C42') },
  timePillIndisponivel: { backgroundColor: cor.bg('#EEF1F6'), elevation: 0, shadowOpacity: 0 },
  timeTextIndisponivel: { color: cor.fg('#A0AABB'), textDecorationLine: 'line-through' },
  semHorarios: { fontSize: 12, fontFamily: 'Montserrat-Regular', color: cor.fg('#B03030'), marginTop: -30, marginBottom: 30 },
  timeText: { fontSize: 13, fontFamily: 'Montserrat-Bold', color: cor.fg('#999') },
  textWhite: { color: cor.fg('#FFF') },
  
  confirmButton: { backgroundColor: cor.bg('#6292D6'), paddingVertical: 15, borderRadius: 30, alignItems: 'center', width: '90%', alignSelf: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  confirmButtonDisabled: { opacity: 0.5 },
  confirmButtonText: { color: cor.fg('#FFF'), fontSize: 16, fontFamily: 'Montserrat-Bold' },
});