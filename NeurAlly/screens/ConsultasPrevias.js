import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../contexts/AuthContext.js';
import useConsultas from '../hooks/useConsultas.js';
import DetalhesConsultaModal, { situacaoDaConsulta } from '../components/DetalhesConsultaModal.js';
import { abrirConversaDaConsulta } from '../utils/abrirConversa.js';
import { chaveDeOrdem, consultaEhFutura, diaDoMes, faixaDeHorario, mesAbreviado, nomeDoDia } from '../utils/datas.js';

import { useEstilos } from '../contexts/TemaContext.js';
// Histórico de consultas, igual para cliente e psicólogo:
//  - "Realizadas": consultas que já aconteceram;
//  - "Canceladas": consultas canceladas por qualquer lado.
export default function ConsultasPrevias({ navigation }) {
  const [styles, cor] = useEstilos(criarStyles);
  const { usuario, perfil } = useAuth();
  const ehProfissional = perfil?.tipo === 'psicologo';
  const papel = ehProfissional ? 'profissional' : 'cliente';
  const { todas, carregando, erro } = useConsultas(papel);

  const [aba, setAba] = useState('realizadas');
  const [selecionada, setSelecionada] = useState(null);
  const [abrindoConversa, setAbrindoConversa] = useState(false);
  const [erroConversa, setErroConversa] = useState('');
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  // Mais recentes primeiro.
  const maisRecentesPrimeiro = (a, b) => chaveDeOrdem(b).localeCompare(chaveDeOrdem(a));
  const realizadas = useMemo(
    () => todas.filter((c) => c.status !== 'cancelada' && !consultaEhFutura(c)).sort(maisRecentesPrimeiro),
    [todas]
  );
  const canceladas = useMemo(() => todas.filter((c) => c.status === 'cancelada').sort(maisRecentesPrimeiro), [todas]);
  const lista = aba === 'realizadas' ? realizadas : canceladas;

  if (!fontsLoaded) return null;

  const fecharDetalhes = () => {
    setSelecionada(null);
    setErroConversa('');
  };

  const conversar = async () => {
    if (abrindoConversa || !selecionada) return;
    setErroConversa('');
    setAbrindoConversa(true);
    try {
      await abrirConversaDaConsulta({ navigation, consulta: selecionada, papel, meuId: usuario?.uid });
      fecharDetalhes();
    } catch (e) {
      console.warn('Erro ao abrir conversa:', e);
      setErroConversa(
        e?.code === 'conversa/sem-conta'
          ? 'Esta pessoa ainda não tem conta no app, então não dá para conversar.'
          : 'Não foi possível abrir a conversa. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setAbrindoConversa(false);
    }
  };

  // Só o cliente pode marcar de novo: leva para o perfil do mesmo profissional.
  const agendarNovamente = () => {
    const consulta = selecionada;
    fecharDetalhes();
    if (consulta.profissionalId) {
      navigation.navigate('PerfilProfissional', {
        profissional: { uid: consulta.profissionalId, nome: consulta.profissionalNome, esp: consulta.profissionalEsp || '' },
      });
    } else {
      navigation.navigate('BuscaProfissionais');
    }
  };

  const vazio = aba === 'realizadas' ? 'Você ainda não tem consultas realizadas.' : 'Nenhuma consulta cancelada.';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Voltar">
            <Ionicons name="chevron-back" size={28} color={cor.fg("#1A56DB")} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Consultas prévias</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.abas}>
          {[
            { id: 'realizadas', titulo: `Realizadas (${realizadas.length})` },
            { id: 'canceladas', titulo: `Canceladas (${canceladas.length})` },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.aba, aba === item.id && styles.abaAtiva]}
              onPress={() => setAba(item.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: aba === item.id }}
            >
              <Text style={[styles.abaTexto, aba === item.id && styles.abaTextoAtivo]}>{item.titulo}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {erro ? (
            <View style={styles.erroBox}>
              <Ionicons name="alert-circle" size={18} color={cor.fg("#D64545")} style={{ marginRight: 8 }} />
              <Text style={styles.erroTexto}>
                {erro?.code === 'permission-denied'
                  ? 'Sem permissão para ler as consultas. Verifique as regras do Firestore.'
                  : 'Não foi possível carregar as consultas. Verifique sua conexão.'}
              </Text>
            </View>
          ) : carregando ? (
            <ActivityIndicator color={cor.fg("#6292D6")} style={{ marginTop: 30 }} />
          ) : lista.length === 0 ? (
            <Text style={styles.vazio}>{vazio}</Text>
          ) : (
            lista.map((consulta) => {
              const situacao = situacaoDaConsulta(consulta, cor);
              const nome = ehProfissional ? consulta.clienteNome || 'Paciente' : consulta.profissionalNome;
              return (
                <TouchableOpacity
                  key={consulta.id}
                  style={styles.item}
                  onPress={() => setSelecionada(consulta)}
                  activeOpacity={0.8}
                  accessibilityLabel={`Consulta com ${nome}, ${nomeDoDia(consulta.data)}, ${consulta.horario}, ${situacao.texto}`}
                >
                  <View style={styles.data}>
                    <Text style={styles.dataDia}>{diaDoMes(consulta.data)}</Text>
                    <Text style={styles.dataMes}>{mesAbreviado(consulta.data)}</Text>
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.nome} numberOfLines={1}>{nome}</Text>
                    <Text style={styles.detalhe} numberOfLines={1}>
                      {nomeDoDia(consulta.data)} · {faixaDeHorario(consulta.horario)}
                    </Text>
                    <Text style={styles.detalhe} numberOfLines={1}>
                      {consulta.modalidade === 'online' ? 'On-line' : 'Presencial'}
                    </Text>
                  </View>
                  <View style={[styles.etiqueta, { backgroundColor: situacao.fundo }]}>
                    <Text style={[styles.etiquetaTexto, { color: situacao.corTexto }]}>{situacao.texto}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>

      <DetalhesConsultaModal
        consulta={selecionada}
        papel={papel}
        onFechar={fecharDetalhes}
        onConversar={selecionada && (ehProfissional ? selecionada.clienteId : selecionada.profissionalId) ? conversar : undefined}
        onAgendarNovamente={selecionada && !ehProfissional ? agendarNovamente : undefined}
        erro={erroConversa}
        ocupado={abrindoConversa}
      />
    </SafeAreaView>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  container: { flex: 1, backgroundColor: cor.bg('#9EBDF0'), padding: 20 },
  card: { flex: 1, backgroundColor: cor.bg('#FFF'), borderRadius: 20, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10 },
  headerTitle: { flex: 1, fontFamily: 'Montserrat-Bold', fontSize: 20, color: cor.fg('#1A56DB'), marginLeft: 10 },
  divider: { height: 2, backgroundColor: cor.bg('#1A56DB'), opacity: 0.5, marginHorizontal: 20, marginBottom: 14 },
  abas: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 14, backgroundColor: cor.bg('#F0F4FF'), borderRadius: 12, padding: 4 },
  aba: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  abaAtiva: { backgroundColor: cor.bg('#1A56DB') },
  abaTexto: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: cor.fg('#5A6B87') },
  abaTextoAtivo: { color: cor.fg('#FFF') },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  vazio: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: cor.fg('#5A6B87'), textAlign: 'center', marginTop: 40 },
  erroBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: cor.bg('#FDEDED'), borderWidth: 1, borderColor: cor.bd('#F5C2C2'), borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
  erroTexto: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#B03030') },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: cor.bg('#F0F4FF'), borderRadius: 15, padding: 12, marginBottom: 10 },
  data: { width: 52, height: 56, borderRadius: 12, backgroundColor: cor.bg('#FFF'), alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  dataDia: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: cor.fg('#1A56DB') },
  dataMes: { fontFamily: 'Montserrat-Regular', fontSize: 11, color: cor.fg('#5A6B87') },
  info: { flex: 1 },
  nome: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: cor.fg('#1A56DB') },
  detalhe: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#5A6B87'), marginTop: 1 },
  etiqueta: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, marginLeft: 8 },
  etiquetaTexto: { fontFamily: 'Montserrat-Bold', fontSize: 11 },
});
