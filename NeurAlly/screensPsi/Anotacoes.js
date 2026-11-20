import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert
} from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import NavBarPsi from '../components/navBarPsi.js';
import { escutarAnotacoes, removerAnotacao } from '../services/anotacoesService.js';

import { useEstilos } from '../contexts/TemaContext.js';
// Converte o timestamp do Firestore em algo como "16/09/2026 14:30".
function formatarData(criadoEm) {
  if (!criadoEm?.toDate) return '';
  const data = criadoEm.toDate();
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${data.getFullYear()} ${hora}:${minuto}`;
}

export default function AnotacoesPsi({ navigation }) {
  const [styles, cor] = useEstilos(criarStyles);
  const [anotacoes, setAnotacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  useEffect(() => {
    let cancelarEscuta = () => {};
    let ativo = true;

    escutarAnotacoes(
      (lista) => {
        if (ativo) {
          setAnotacoes(lista);
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
    }).catch((erroRecebido) => {
      if (ativo) {
        setErro(erroRecebido);
        setCarregando(false);
      }
    });

    return () => {
      ativo = false;
      cancelarEscuta();
    };
  }, []);

  if (!fontsLoaded) return null;

  const confirmarRemocao = (anotacao) => {
    Alert.alert('Apagar anotação', `Deseja apagar "${anotacao.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          try {
            await removerAnotacao(anotacao.id);
          } catch (erroRecebido) {
            Alert.alert('Não foi possível apagar', 'Verifique sua conexão e tente novamente.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

        <Text style={styles.pageTitle}>Anotações</Text>
        <Text style={styles.pageSubtitle}>
          Registros particulares sobre seus atendimentos. Toque para editar.
        </Text>

        {carregando && (
          <ActivityIndicator size="small" color={cor.fg('#4A77D4')} style={{ marginTop: 20 }} />
        )}

        {!carregando && erro && (
          <View style={styles.avisoContainer}>
            <Text style={styles.avisoTexto}>
              Não foi possível carregar as anotações. Verifique a configuração do Firebase e sua conexão.
            </Text>
          </View>
        )}

        {!carregando && !erro && anotacoes.length === 0 && (
          <View style={styles.avisoContainer}>
            <Text style={styles.avisoTexto}>
              Nenhuma anotação ainda. Toque no + para criar a primeira.
            </Text>
          </View>
        )}

        {!carregando && !erro && anotacoes.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('EscreverAnotacaoPsi', { anotacao: item })}
          >
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.titulo}</Text>
                {!!item.paciente && (
                  <Text style={styles.cardPaciente}>Paciente: {item.paciente}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => confirmarRemocao(item)} hitSlop={10}>
                <Ionicons name="trash-outline" size={20} color={cor.fg("#D64545")} />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardText}>{item.texto}</Text>
            {!!formatarData(item.criadoEm) && (
              <Text style={styles.cardData}>{formatarData(item.criadoEm)}</Text>
            )}
          </TouchableOpacity>
        ))}

      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('EscreverAnotacaoPsi')}
      >
        <Ionicons name="add" size={32} color={cor.fg("#FFF")} />
      </TouchableOpacity>

      <NavBarPsi />
    </SafeAreaView>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  container: { flex: 1, backgroundColor: cor.bg('#E4F0F8') },
  scrollContent: { padding: 20, paddingBottom: 130 },
  pageTitle: { fontFamily: 'Montserrat-Bold', fontSize: 24, color: cor.fg('#1A1A1A'), marginBottom: 4 },
  pageSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: cor.fg('#5A6B87'), marginBottom: 20 },
  card: { backgroundColor: cor.bg('#FFF'), borderRadius: 15, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardTitle: { fontSize: 16, fontFamily: 'Montserrat-Bold', color: cor.fg('#1A1A1A') },
  cardPaciente: { fontSize: 12, fontFamily: 'Montserrat-Regular', color: cor.fg('#6292D6'), marginTop: 2 },
  cardText: { fontSize: 13, fontFamily: 'Montserrat-Regular', color: cor.fg('#333'), lineHeight: 18 },
  cardData: { fontSize: 11, fontFamily: 'Montserrat-Regular', color: cor.fg('#8696BB'), marginTop: 10, textAlign: 'right' },
  avisoContainer: { paddingVertical: 30, alignItems: 'center' },
  avisoTexto: { fontSize: 13, fontFamily: 'Montserrat-Regular', color: cor.fg('#5A6B87'), textAlign: 'center', paddingHorizontal: 20 },
  fab: { position: 'absolute', right: 20, bottom: 90, backgroundColor: cor.bg('#1A56DB'), width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 }
});
