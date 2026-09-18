import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert
} from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import NavBarPsi from '../components/navBarPsi.js';
import paleta from '../styles/Tema.js';
import { escutarAnotacoes, removerAnotacao } from '../services/anotacoesService.js';

export default function AnotacoesPsi({ navigation }) {
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
          Registros particulares sobre seus atendimentos.
        </Text>

        {carregando && (
          <ActivityIndicator size="small" color={paleta.cor.a5} style={{ marginTop: 20 }} />
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
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.titulo}</Text>
                {!!item.paciente && (
                  <Text style={styles.cardPaciente}>Paciente: {item.paciente}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => confirmarRemocao(item)} hitSlop={10}>
                <Ionicons name="trash-outline" size={20} color="#D64545" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardText}>{item.texto}</Text>
          </View>
        ))}

      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('EscreverAnotacaoPsi')}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      <NavBarPsi />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: paleta.cor.fundo },
  scrollContent: { padding: 20, paddingBottom: 130 },
  pageTitle: { fontFamily: 'Montserrat-Bold', fontSize: 24, color: '#1A1A1A', marginBottom: 4 },
  pageSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#5A6B87', marginBottom: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardTitle: { fontSize: 16, fontFamily: 'Montserrat-Bold', color: '#1A1A1A' },
  cardPaciente: { fontSize: 12, fontFamily: 'Montserrat-Regular', color: '#6292D6', marginTop: 2 },
  cardText: { fontSize: 13, fontFamily: 'Montserrat-Regular', color: '#333', lineHeight: 18 },
  avisoContainer: { paddingVertical: 30, alignItems: 'center' },
  avisoTexto: { fontSize: 13, fontFamily: 'Montserrat-Regular', color: '#5A6B87', textAlign: 'center', paddingHorizontal: 20 },
  fab: { position: 'absolute', right: 20, bottom: 90, backgroundColor: '#1A56DB', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 }
});
