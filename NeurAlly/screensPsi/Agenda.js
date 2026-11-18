import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import NavBarPsi from '../components/navBarPsi.js';
import paleta from '../styles/Tema.js';
import useConsultas from '../hooks/useConsultas.js';
import { consultaEhFutura, diasDaSemana, faixaDeHorario, formatarDataLonga, hojeISO, mesAbreviado } from '../utils/datas.js';
import { cancelarConsulta } from '../services/consultasService.js';
import ModalConfirmacao from '../components/ModalConfirmacao.js';

// Data base de uma semana: hoje + (offset * 7 dias). Offset 0 = semana atual.
function baseDaSemana(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset * 7);
  return d;
}

export default function AgendaPsi({ navigation }) {
  const [semanaOffset, setSemanaOffset] = useState(0);
  const [diaSelecionado, setDiaSelecionado] = useState(hojeISO());
  // Consultas que os clientes marcaram com este psicólogo.
  const { consultas, carregando, erro } = useConsultas('profissional');

  // Cancelamento de uma consulta pelo psicólogo.
  const [paraCancelar, setParaCancelar] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const [cancelada, setCancelada] = useState(false);
  const [erroCancelar, setErroCancelar] = useState('');

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const confirmarCancelamento = async () => {
    if (!paraCancelar || cancelando) return;
    setCancelando(true);
    setErroCancelar('');
    try {
      await cancelarConsulta(paraCancelar, 'profissional');
      setParaCancelar(null);
      setCancelada(true);
    } catch (e) {
      console.warn('Erro ao cancelar consulta:', e);
      setParaCancelar(null);
      setErroCancelar(
        e?.code === 'permission-denied'
          ? 'Sem permissão para cancelar. Atualize as regras do Firestore (arquivo firestore.rules do projeto).'
          : 'Não foi possível cancelar a consulta. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setCancelando(false);
    }
  };

  const semana = diasDaSemana(baseDaSemana(semanaOffset));
  const datasComConsulta = new Set(consultas.map((c) => c.data));
  const consultasDoDia = consultas.filter((c) => c.data === diaSelecionado);

  const primeiro = semana[0];
  const ultimo = semana[6];
  const tituloSemana = `${primeiro.dia} ${mesAbreviado(primeiro.iso)} - ${ultimo.dia} ${mesAbreviado(ultimo.iso)}`;

  const mudarSemana = (delta) => {
    const novoOffset = semanaOffset + delta;
    const novaSemana = diasDaSemana(baseDaSemana(novoOffset));
    setSemanaOffset(novoOffset);
    // Na semana atual volta para hoje; nas outras, para o primeiro dia da semana.
    setDiaSelecionado(novaSemana.find((d) => d.iso === hojeISO())?.iso || novaSemana[0].iso);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

        <Text style={styles.pageTitle}>Agenda</Text>
        <Text style={styles.pageSubtitle}>Suas consultas da semana.</Text>

        <View style={styles.semanaHeader}>
          <TouchableOpacity onPress={() => mudarSemana(-1)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Semana anterior">
            <Ionicons name="chevron-back" size={22} color="#1A56DB" />
          </TouchableOpacity>
          <Text style={styles.semanaTitulo}>{tituloSemana}</Text>
          <TouchableOpacity onPress={() => mudarSemana(1)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Próxima semana">
            <Ionicons name="chevron-forward" size={22} color="#1A56DB" />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarRow}>
          {semana.map((item) => {
            const ativo = item.iso === diaSelecionado;
            const temConsulta = datasComConsulta.has(item.iso);
            return (
              <TouchableOpacity
                key={item.iso}
                style={[styles.dayBox, temConsulta && styles.dayBoxConsulta, ativo && styles.dayBoxActive]}
                onPress={() => setDiaSelecionado(item.iso)}
                accessibilityLabel={`${item.abrv}, dia ${item.dia}${temConsulta ? ', com consulta' : ''}`}
              >
                <Text style={[styles.dayText, ativo && styles.dayTextActive]}>{item.abrv}</Text>
                <Text style={[styles.dateText, ativo && styles.dateTextActive]}>{item.dia}</Text>
                <View style={[styles.dot, temConsulta && styles.dotVisivel, ativo && styles.dotAtivo]} />
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.diaTitulo}>{formatarDataLonga(diaSelecionado)}</Text>

        {erro ? (
          <View style={styles.erroBox}>
            <Ionicons name="alert-circle" size={18} color="#D64545" style={{ marginRight: 8 }} />
            <Text style={styles.erroTexto}>
              {erro?.code === 'permission-denied'
                ? 'Sem permissão para ler as consultas. Verifique as regras do Firestore para a coleção consultas.'
                : 'Não foi possível carregar sua agenda. Verifique sua conexão.'}
            </Text>
          </View>
        ) : carregando ? (
          <View style={styles.avisoContainer}>
            <Text style={styles.avisoTexto}>Carregando sua agenda...</Text>
          </View>
        ) : consultasDoDia.length === 0 ? (
          <View style={styles.avisoContainer}>
            <Text style={styles.avisoTexto}>Nenhuma consulta marcada para este dia.</Text>
          </View>
        ) : (
          consultasDoDia.map((consulta) => (
            <View key={consulta.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={22} color="#6292D6" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.pacienteNome}>{consulta.clienteNome || 'Paciente'}</Text>
                  <Text style={styles.consultaTipo}>
                    {consulta.modalidade === 'online' ? 'Consulta on-line' : 'Consulta presencial'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6292D6" />
              </View>

              <View style={styles.divider} />

              <View style={styles.cardFooter}>
                <Ionicons name="time-outline" size={16} color="#6292D6" />
                <Text style={styles.horarioText}>{faixaDeHorario(consulta.horario)}</Text>
                {consultaEhFutura(consulta) && (
                  <TouchableOpacity
                    style={styles.cancelarBotao}
                    onPress={() => { setErroCancelar(''); setParaCancelar(consulta); }}
                    accessibilityLabel={`Cancelar consulta com ${consulta.clienteNome || 'paciente'}`}
                  >
                    <Ionicons name="close-circle-outline" size={16} color="#D64545" style={{ marginRight: 4 }} />
                    <Text style={styles.cancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        {!!erroCancelar && (
          <View style={styles.erroBox}>
            <Ionicons name="alert-circle" size={18} color="#D64545" style={{ marginRight: 8 }} />
            <Text style={styles.erroTexto}>{erroCancelar}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.disponibilidadeButton}
          onPress={() => navigation.navigate('DisponibilidadePsi')}
        >
          <Ionicons name="settings-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.disponibilidadeText}>Editar disponibilidade</Text>
        </TouchableOpacity>

      </ScrollView>

      <NavBarPsi />

      <ModalConfirmacao
        visivel={!!paraCancelar}
        tipo="perigo"
        titulo="Cancelar consulta?"
        mensagem={
          paraCancelar
            ? `A consulta com ${paraCancelar.clienteNome || 'o paciente'} em ${formatarDataLonga(paraCancelar.data)} às ${paraCancelar.horario} será cancelada e o horário ficará livre na sua agenda.`
            : ''
        }
        textoConfirmar="Sim, cancelar"
        textoCancelar="Voltar"
        carregando={cancelando}
        onConfirmar={confirmarCancelamento}
        onCancelar={() => setParaCancelar(null)}
      />

      <ModalConfirmacao
        visivel={cancelada}
        tipo="sucesso"
        titulo="Consulta cancelada"
        mensagem="A consulta foi cancelada e o horário voltou a ficar livre."
        onConfirmar={() => setCancelada(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: paleta.cor.fundo },
  scrollContent: { padding: 20, paddingBottom: 130 },
  pageTitle: { fontFamily: 'Montserrat-Bold', fontSize: 24, color: '#1A1A1A', marginBottom: 4 },
  pageSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#5A6B87', marginBottom: 20 },
  semanaHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 5 },
  semanaTitulo: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: '#1A56DB' },
  calendarRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', borderRadius: 15, padding: 8, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  dayBox: { flex: 1, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 2, marginHorizontal: 1, borderRadius: 10 },
  dayBoxConsulta: { backgroundColor: '#E3F2FD' },
  dayBoxActive: { backgroundColor: '#6292D6' },
  dayText: { fontFamily: 'Montserrat-Regular', fontSize: 11, color: '#333', marginBottom: 4 },
  dayTextActive: { color: '#FFF' },
  dateText: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: '#333' },
  dateTextActive: { color: '#FFF' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'transparent', marginTop: 5 },
  dotVisivel: { backgroundColor: '#4894FE' },
  dotAtivo: { backgroundColor: '#FFF' },
  diaTitulo: { fontFamily: 'Montserrat-Bold', fontSize: 15, color: '#1A1A1A', marginBottom: 12 },
  card: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 15 },
  pacienteNome: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: '#1A56DB' },
  consultaTipo: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#666' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5 },
  horarioText: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#666', marginLeft: 6, flex: 1 },
  cancelarBotao: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8 },
  cancelarTexto: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: '#D64545' },
  avisoContainer: { paddingVertical: 30, alignItems: 'center' },
  avisoTexto: { fontSize: 13, fontFamily: 'Montserrat-Regular', color: '#5A6B87', textAlign: 'center' },
  erroBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDEDED', borderWidth: 1, borderColor: '#F5C2C2', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 15 },
  erroTexto: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#B03030' },
  disponibilidadeButton: { flexDirection: 'row', backgroundColor: '#6292D6', borderRadius: 15, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  disponibilidadeText: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: '#FFF' }
});
