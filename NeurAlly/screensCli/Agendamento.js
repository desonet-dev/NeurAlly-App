import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import NavBar from '../components/navBarCli.js';
import DynamicCalendar from '../components/DynamicCalendar.js';
import useConsultas from '../hooks/useConsultas.js';
import { diaDoMes, formatarDataLonga, mesAbreviado, nomeDoDia } from '../utils/datas.js';
import { cancelarConsulta } from '../services/consultasService.js';
import ModalConfirmacao from '../components/ModalConfirmacao.js';

import { useEstilos } from '../contexts/TemaContext.js';
import DetalhesConsultaModal from '../components/DetalhesConsultaModal.js';
import { abrirConversaDaConsulta } from '../utils/abrirConversa.js';
import { useAuth } from '../contexts/AuthContext.js';
import { consultaParaNavegacao, consultaTemVideo } from '../utils/chamada.js';
// Função auxiliar para pegar a data atual no formato ISO (AAAA-MM-DD)
function getHojeISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export default function Agendamento({ navigation }) {
  const [styles, cor] = useEstilos(criarStyles);
  // Estado para controlar a data selecionada no calendário
  const [selectedDate, setSelectedDate] = useState(getHojeISO());
  const { proximas, datasComConsulta } = useConsultas();

  // Consulta aberta nos detalhes (ao tocar no card) e abertura da conversa com o profissional.
  const { usuario } = useAuth();
  const [detalhe, setDetalhe] = useState(null);
  const [abrindoConversa, setAbrindoConversa] = useState(false);
  const [erroConversa, setErroConversa] = useState('');

  // Cancelamento: a consulta aguardando confirmação, o andamento e o resultado.
  const [paraCancelar, setParaCancelar] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const [cancelada, setCancelada] = useState(false);
  const [erroAcao, setErroAcao] = useState('');

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const fecharDetalhe = () => {
    setDetalhe(null);
    setErroConversa('');
  };

  const conversarComProfissional = async () => {
    if (abrindoConversa || !detalhe) return;
    setErroConversa('');
    setAbrindoConversa(true);
    try {
      await abrirConversaDaConsulta({ navigation, consulta: detalhe, papel: 'cliente', meuId: usuario?.uid });
      fecharDetalhe();
    } catch (e) {
      console.warn('Erro ao abrir conversa:', e);
      setErroConversa(
        e?.code === 'conversa/sem-conta'
          ? 'Este profissional ainda não tem conta no app, então não dá para conversar.'
          : 'Não foi possível abrir a conversa. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setAbrindoConversa(false);
    }
  };

  const confirmarCancelamento = async () => {
    if (!paraCancelar || cancelando) return;
    setCancelando(true);
    setErroAcao('');
    try {
      await cancelarConsulta(paraCancelar, 'cliente');
      setParaCancelar(null);
      setCancelada(true);
    } catch (e) {
      console.warn('Erro ao cancelar consulta:', e);
      setParaCancelar(null);
      setErroAcao(
        e?.code === 'permission-denied'
          ? 'Sem permissão para cancelar. Atualize as regras do Firestore (arquivo firestore.rules do projeto).'
          : 'Não foi possível cancelar a consulta. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setCancelando(false);
    }
  };

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
            datasConsulta={datasComConsulta}
          />

          {proximas.length === 0 ? (
            <Text style={styles.semConsultas}>Você ainda não tem consultas agendadas.</Text>
          ) : (
            <View style={styles.listaConsultas}>
              {proximas.map((consulta) => (
                <TouchableOpacity
                  key={consulta.id}
                  style={styles.consultaItem}
                  activeOpacity={0.85}
                  onPress={() => { setErroConversa(''); setDetalhe(consulta); }}
                  accessibilityRole="button"
                  accessibilityLabel={`Ver detalhes da consulta com ${consulta.profissionalNome} às ${consulta.horario}`}
                >
                  <View style={styles.consultaLinha}>
                    <View style={styles.consultaData}>
                      <Text style={styles.consultaDia}>{diaDoMes(consulta.data)}</Text>
                      <Text style={styles.consultaMes}>{mesAbreviado(consulta.data)}</Text>
                    </View>
                    <View style={styles.consultaInfo}>
                      <Text style={styles.consultaNome} numberOfLines={1}>{consulta.profissionalNome}</Text>
                      <Text style={styles.consultaDetalhe} numberOfLines={1}>
                        {nomeDoDia(consulta.data)} · {consulta.horario} · {consulta.modalidade === 'online' ? 'On-line' : 'Presencial'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.acoes}>
                    <TouchableOpacity
                      style={[styles.acaoBotao, styles.acaoReagendar]}
                      onPress={() => navigation.navigate('FinalAgendamento', { reagendar: consulta })}
                      accessibilityLabel={`Reagendar consulta com ${consulta.profissionalNome}`}
                    >
                      <Ionicons name="calendar-outline" size={16} color={cor.fg("#1A56DB")} style={{ marginRight: 6 }} />
                      <Text style={styles.acaoReagendarTexto}>Reagendar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.acaoBotao, styles.acaoCancelar]}
                      onPress={() => { setErroAcao(''); setParaCancelar(consulta); }}
                      accessibilityLabel={`Cancelar consulta com ${consulta.profissionalNome}`}
                    >
                      <Ionicons name="close-circle-outline" size={16} color={cor.fg("#D64545")} style={{ marginRight: 6 }} />
                      <Text style={styles.acaoCancelarTexto}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {!!erroAcao && (
            <View style={styles.erroBox} accessibilityRole="alert" accessibilityLiveRegion="polite">
              <Ionicons name="alert-circle" size={18} color={cor.fg("#D64545")} style={{ marginRight: 8 }} />
              <Text style={styles.erroTexto}>{erroAcao}</Text>
            </View>
          )}
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

      <DetalhesConsultaModal
        consulta={detalhe}
        papel="cliente"
        onFechar={fecharDetalhe}
        onConversar={detalhe?.profissionalId ? conversarComProfissional : undefined}
        onEntrarNaChamada={detalhe && consultaTemVideo(detalhe) ? () => { const c = detalhe; fecharDetalhe(); navigation.navigate('SalaConsulta', { consulta: consultaParaNavegacao(c) }); } : undefined}
        onReagendar={detalhe ? () => { const c = detalhe; fecharDetalhe(); navigation.navigate('FinalAgendamento', { reagendar: c }); } : undefined}
        onCancelar={detalhe ? () => { const c = detalhe; fecharDetalhe(); setErroAcao(''); setParaCancelar(c); } : undefined}
        erro={erroConversa}
        ocupado={abrindoConversa}
      />

      <ModalConfirmacao
        visivel={!!paraCancelar}
        tipo="perigo"
        titulo="Cancelar consulta?"
        mensagem={
          paraCancelar
            ? `Sua consulta com ${paraCancelar.profissionalNome} em ${formatarDataLonga(paraCancelar.data)} às ${paraCancelar.horario} será cancelada e o horário ficará livre para outras pessoas.`
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
        mensagem="Sua consulta foi cancelada. Você pode agendar um novo horário quando quiser."
        onConfirmar={() => setCancelada(false)}
      />
    </SafeAreaView>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  semConsultas: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: cor.fg('#5A6B87'),
    textAlign: 'center',
    marginTop: 5,
  },
  listaConsultas: {
    marginTop: 5,
  },
  consultaItem: {
    backgroundColor: cor.bg('#F0F4FF'),
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
  },
  consultaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  acoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  acaoBotao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  acaoReagendar: { backgroundColor: cor.bg('#FFF'), borderColor: cor.bd('#1A56DB') },
  acaoReagendarTexto: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: cor.fg('#1A56DB') },
  acaoCancelar: { backgroundColor: cor.bg('#FFF'), borderColor: cor.bd('#D64545') },
  acaoCancelarTexto: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: cor.fg('#D64545') },
  erroBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: cor.bg('#FDEDED'), borderWidth: 1, borderColor: cor.bd('#F5C2C2'), borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginTop: 5 },
  erroTexto: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#B03030') },
  consultaData: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: cor.bg('#4894FE'),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  consultaDia: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: cor.fg('#FFF'),
    lineHeight: 22,
  },
  consultaMes: {
    fontSize: 11,
    fontFamily: 'Montserrat-Bold',
    color: cor.fg('#FFF'),
  },
  consultaInfo: {
    flex: 1,
  },
  consultaNome: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: cor.fg('#1A56DB'),
  },
  consultaDetalhe: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: cor.fg('#5A6B87'),
    marginTop: 2,
  },
  container: {
    flex: 1,
    backgroundColor: cor.bg('#E4F0F8')
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 130
  },
  card: {
    backgroundColor: cor.bg('#FFF'),
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
    color: cor.fg('#1A1A1A'),
    marginBottom: 10
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: cor.fg('#333'),
    lineHeight: 18,
    marginBottom: 15
  },
  orangeButtonSmall: {
    backgroundColor: cor.bg('#FF8C42'),
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  orangeButtonLarge: {
    backgroundColor: cor.bg('#FF8C42'),
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    width: '90%',
    alignItems: 'center'
  },
  buttonTextWhite: {
    color: cor.fg('#FFF'),
    fontFamily: 'Montserrat-Bold',
    fontSize: 13
  },
});