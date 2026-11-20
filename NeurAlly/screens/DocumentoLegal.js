import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DOCUMENTOS, ULTIMA_ATUALIZACAO } from '../constants/documentosLegais.js';

import { useEstilos } from '../contexts/TemaContext.js';
// Mostra os "Termos de uso" (tipo = 'termos') ou a "Política de privacidade" (tipo = 'privacidade').
export default function DocumentoLegal({ navigation, route }) {
  const [styles, cor] = useEstilos(criarStyles);
  const documento = DOCUMENTOS[route?.params?.tipo] || DOCUMENTOS.termos;
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Voltar">
            <Ionicons name="chevron-back" size={28} color={cor.fg("#1A56DB")} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{documento.titulo}</Text>
        </View>

        <View style={styles.divider} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.atualizacao}>Última atualização: {ULTIMA_ATUALIZACAO}</Text>
          <Text style={styles.resumo}>{documento.resumo}</Text>

          {documento.secoes.map((secao) => (
            <View key={secao.titulo} style={styles.secao}>
              <Text style={styles.secaoTitulo}>{secao.titulo}</Text>
              <Text style={styles.secaoTexto}>{secao.texto}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  container: { flex: 1, backgroundColor: cor.bg('#9EBDF0'), padding: 20 },
  card: { flex: 1, backgroundColor: cor.bg('#FFF'), borderRadius: 20, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10 },
  headerTitle: { flex: 1, fontFamily: 'Montserrat-Bold', fontSize: 20, color: cor.fg('#1A56DB'), marginLeft: 10 },
  divider: { height: 2, backgroundColor: cor.bg('#1A56DB'), opacity: 0.5, marginHorizontal: 20, marginBottom: 16 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  atualizacao: { fontFamily: 'Montserrat-Regular', fontSize: 11, color: cor.fg('#777'), marginBottom: 8 },
  resumo: { fontFamily: 'Montserrat-Bold', fontSize: 13, color: cor.fg('#333'), marginBottom: 18, lineHeight: 19 },
  secao: { marginBottom: 18 },
  secaoTitulo: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: cor.fg('#1A56DB'), marginBottom: 6 },
  secaoTexto: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: cor.fg('#333'), lineHeight: 20 },
});
