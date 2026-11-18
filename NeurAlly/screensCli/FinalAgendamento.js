import React, { useEffect, useMemo, useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  SafeAreaView, TextInput, ActivityIndicator 
} from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import paleta from '../styles/Tema.js';
import useConsultas from '../hooks/useConsultas.js';
import { blocosDaConsulta, formatarDataLonga, HORARIOS_PADRAO, hojeISO, inicioDaConsulta } from '../utils/datas.js';
import { escutarHorariosOcupados, reagendarConsulta } from '../services/consultasService.js';
import { filtrarProfissionais } from '../services/profissionaisService.js';
import useProfissionais from '../hooks/useProfissionais.js';
import ItemProfissional from '../components/ItemProfissional.js';
import ModalConfirmacao from '../components/ModalConfirmacao.js';

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

export default function FinalAgendamento({ navigation, route }) {
  // Dois jeitos de chegar aqui:
  //  - agendar: pelo calendário da tela Agendamento (sem profissional) ou pela tela do profissional
  //    (já chegam profissional, data e horário escolhidos);
  //  - reagendar: `reagendar` traz a consulta que está sendo remarcada (o profissional não muda).
  const reagendando = route?.params?.reagendar || null;
  const profissionalParam = reagendando
    ? {
        nome: reagendando.profissionalNome,
        esp: reagendando.profissionalEsp || '',
        uid: reagendando.profissionalId || undefined,
      }
    : route?.params?.profissional;

  const [selectedDate, setSelectedDate] = useState(reagendando?.data || route?.params?.data || hojeISO());
  const [modalidade, setModalidade] = useState(reagendando?.modalidade || 'presencial');
  const [horario, setHorario] = useState(reagendando?.horario || route?.params?.horario || '9:00');
  const [profissional, setProfissional] = useState(profissionalParam || null);
  const [busca, setBusca] = useState('');
  const [aviso, setAviso] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [reagendado, setReagendado] = useState(false);
  const { proximas, datasComConsulta } = useConsultas();
  const [ocupados, setOcupados] = useState(new Set());

  // Profissionais disponíveis para escolher (e a barra de pesquisa que filtra a lista).
  const { profissionais, carregando: carregandoProfissionais } = useProfissionais();
  const filtrados = useMemo(() => filtrarProfissionais(profissionais, busca), [profissionais, busca]);

  // uid do psicólogo escolhido (só existe para psicólogos reais da busca).
  const profissionalUid = profissional?.uid;

  // Horários que esse psicólogo já tem reservados no dia escolhido (por qualquer cliente).
  // Ao reagendar, os horários da própria consulta não contam como ocupados.
  useEffect(() => {
    setOcupados(new Set());
    if (!profissionalUid) return undefined;
    return escutarHorariosOcupados(profissionalUid, selectedDate, setOcupados, undefined, reagendando?.id);
  }, [profissionalUid, selectedDate, reagendando?.id]);

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const horarios = HORARIOS_PADRAO;

  const horarioOcupado = (h) => blocosDaConsulta(h).some((bloco) => ocupados.has(bloco));
  const horarioPassou = (h) => inicioDaConsulta({ data: selectedDate, horario: h }) < new Date();

  const escolherProfissional = (escolhido) => {
    setProfissional(escolhido);
    setBusca('');
    setAviso('');
  };

  const handleConfirmar = async () => {
    if (salvando) return;

    if (!profissional?.nome) {
      setAviso('Escolha um profissional para agendar a consulta.');
      return;
    }
    if (horarioPassou(horario)) {
      setAviso('Esse horário já passou. Escolha outro dia ou horário.');
      return;
    }
    if (horarioOcupado(horario)) {
      setAviso('Esse horário já está reservado com este profissional. Escolha outro.');
      return;
    }
    if (proximas.some((c) => c.id !== reagendando?.id && c.data === selectedDate && c.horario === horario)) {
      setAviso('Você já tem uma consulta marcada nesse dia e horário.');
      return;
    }

    // Reagendamento: grava direto (o pagamento já foi feito ao marcar a consulta).
    if (reagendando) {
      if (selectedDate === reagendando.data && horario === reagendando.horario && modalidade === reagendando.modalidade) {
        setAviso('Escolha um dia ou horário diferente do atual para reagendar.');
        return;
      }

      setAviso('');
      setSalvando(true);
      try {
        await reagendarConsulta(reagendando, { data: selectedDate, horario, modalidade });
        setReagendado(true);
      } catch (e) {
        console.warn('Erro ao reagendar consulta:', e);
        setAviso(
          e?.code === 'consulta/horario-ocupado'
            ? 'Esse horário acabou de ser reservado por outra pessoa. Escolha outro.'
            : e?.code === 'permission-denied'
            ? 'Sem permissão para reagendar. Atualize as regras do Firestore (arquivo firestore.rules do projeto).'
            : 'Não foi possível reagendar a consulta. Verifique sua conexão e tente novamente.'
        );
      } finally {
        setSalvando(false);
      }
      return;
    }

    setAviso('');
    navigation.navigate('Pagamento', {
      profissional: {
        nome: profissional.nome,
        esp: profissional.esp || '',
        // uid só existe para psicólogos reais; é ele que faz a consulta aparecer na agenda dele.
        uid: profissional.uid,
      },
      data: selectedDate,
      horario,
      modalidade,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#1A56DB" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{reagendando ? 'Reagendar consulta' : 'Agendamento'}</Text>
        </View>

        {reagendando && (
          <View style={styles.atualBox}>
            <Ionicons name="calendar-outline" size={18} color="#1A56DB" style={{ marginRight: 8 }} />
            <Text style={styles.atualTexto}>
              Consulta atual: {formatarDataLonga(reagendando.data)} às {reagendando.horario}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Profissional</Text>
        {profissional ? (
          <View>
            <ItemProfissional profissional={profissional} selecionado />
            {!reagendando && (
              <TouchableOpacity onPress={() => { setProfissional(null); setAviso(''); }} style={styles.trocarBotao}>
                <Text style={styles.trocarTexto}>Trocar profissional</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.pickerWrapper}>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
              <TextInput 
                style={styles.searchInput} 
                placeholder="Procure por um profissional" 
                placeholderTextColor="#888"
                value={busca}
                onChangeText={setBusca}
                autoCorrect={false}
                returnKeyType="search"
              />
              {busca.length > 0 && (
                <TouchableOpacity onPress={() => setBusca('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Limpar busca">
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {carregandoProfissionais ? (
              <ActivityIndicator color="#6292D6" style={{ marginVertical: 20 }} />
            ) : filtrados.length === 0 ? (
              <Text style={styles.semResultado}>Nenhum profissional encontrado para "{busca.trim()}".</Text>
            ) : (
              filtrados.map((p) => (
                <ItemProfissional key={p.id} profissional={p} onPress={escolherProfissional} />
              ))
            )}
          </View>
        )}

        <View style={styles.calendarWrapper}>
          <Calendar
            current={hojeISO()}
            minDate={hojeISO()}
            onDayPress={(day) => { setSelectedDate(day.dateString); setAviso(''); }}
            markedDates={{
              // Dias em que você já tem consulta ficam com um ponto azul.
              ...Object.fromEntries([...datasComConsulta].map((data) => [data, { marked: true, dotColor: '#4894FE' }])),
              [selectedDate]: {
                ...(datasComConsulta.has(selectedDate) ? { marked: true, dotColor: '#4894FE' } : {}),
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

        {datasComConsulta.size > 0 && (
          <Text style={styles.legenda}>Os dias com ponto azul já têm consulta marcada.</Text>
        )}

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
            const indisponivel = horarioOcupado(item) || horarioPassou(item);
            const isSelected = horario === item && !indisponivel;
            return (
              <TouchableOpacity 
                key={index} 
                style={[styles.horarioPill, isSelected && styles.horarioPillActive, indisponivel && styles.horarioPillIndisponivel]}
                onPress={() => { setHorario(item); setAviso(''); }}
                disabled={indisponivel}
                accessibilityLabel={indisponivel ? `${item}, indisponível` : item}
              >
                <Text style={[styles.horarioText, isSelected && styles.horarioTextActive, indisponivel && styles.horarioTextIndisponivel]}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {!!aviso && (
          <View style={styles.avisoBox} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Ionicons name="alert-circle" size={18} color="#D64545" style={{ marginRight: 8 }} />
            <Text style={styles.avisoTexto}>{aviso}</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.confirmButton, salvando && { opacity: 0.7 }]}
          onPress={handleConfirmar}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.confirmButtonText}>{reagendando ? 'Confirmar novo horário' : 'Confirmar'}</Text>
          )}
        </TouchableOpacity>

      </ScrollView>

      <ModalConfirmacao
        visivel={reagendado}
        tipo="sucesso"
        titulo="Consulta reagendada!"
        mensagem={`Sua consulta foi remarcada para ${formatarDataLonga(selectedDate)} às ${horario}.`}
        onConfirmar={() => { setReagendado(false); navigation.navigate('Agendamento'); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: paleta.cor.fundo },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#1A56DB', marginLeft: 10 },
  pickerWrapper: { marginBottom: 20 },
  trocarBotao: { alignSelf: 'flex-end', marginTop: -2, marginBottom: 16 },
  trocarTexto: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: '#1A56DB' },
  semResultado: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#5A6B87', textAlign: 'center', marginVertical: 16 },
  atualBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 16 },
  atualTexto: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#1A56DB' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 25, paddingHorizontal: 15, height: 50, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#333' },
  calendarWrapper: { borderRadius: 15, overflow: 'hidden', marginBottom: 20, backgroundColor: '#FFF', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  legenda: { fontFamily: 'Montserrat-Regular', fontSize: 11, color: '#5A6B87', marginTop: -10, marginBottom: 15, marginLeft: 5 },
  avisoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDEDED', borderWidth: 1, borderColor: '#F5C2C2', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginTop: 10 },
  avisoTexto: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#B03030' },
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
  horarioPillIndisponivel: { backgroundColor: '#EEF1F6', elevation: 0, shadowOpacity: 0 },
  horarioTextIndisponivel: { color: '#A0AABB', textDecorationLine: 'line-through' },
  horarioText: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: '#333' },
  horarioTextActive: { color: '#FFF' },
  confirmButton: { backgroundColor: '#6292D6', borderRadius: 25, paddingVertical: 18, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  confirmButtonText: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#FFF' }
});