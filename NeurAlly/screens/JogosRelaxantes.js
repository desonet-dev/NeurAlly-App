import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import NavBar from '../components/navBarCli.js';
import PlantaSvg from '../components/PlantaSvg.js';

import { useEstilos } from '../contexts/TemaContext.js';
// Lista de jogos relaxantes. Por enquanto o Jardim Zen é o único jogo liberado; os outros são ideias para as próximas versões.
const JOGOS = [
  {
    id: 'jardim',
    titulo: 'Jardim Zen',
    descricao: 'Plante sementes, regue e cuide de plantas com as gotas que você ganha escrevendo no diário emocional.',
    rota: 'JardimZen',
    disponivel: true,
  },
  {
    id: 'respiracao',
    titulo: 'Respiração guiada',
    descricao: 'Um exercício leve para acompanhar o ritmo da respiração e desacelerar.',
    disponivel: false,
  },
  {
    id: 'mandala',
    titulo: 'Mandala para colorir',
    descricao: 'Pinte com calma, no seu tempo, sem pressa e sem pontuação.',
    disponivel: false,
  },
];

export default function JogosRelaxantes({ navigation }) {
  const [styles, cor] = useEstilos(criarStyles);
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <View style={styles.topo}>
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Voltar" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={28} color={cor.fg("#1A56DB")} />
          </TouchableOpacity>
          <Text style={styles.titulo}>Jogos relaxantes</Text>
        </View>
        <Text style={styles.subtitulo}>Pequenas pausas para respirar, sem pressa e sem pressão.</Text>

        {JOGOS.map((jogo) => (
          <TouchableOpacity
            key={jogo.id}
            testID={`jogo-${jogo.id}`}
            style={[styles.cartao, jogo.disponivel ? styles.cartaoAtivo : styles.cartaoEmBreve]}
            activeOpacity={jogo.disponivel ? 0.85 : 1}
            onPress={() => jogo.disponivel && navigation.navigate(jogo.rota)}
            accessibilityRole="button"
            accessibilityState={{ disabled: !jogo.disponivel }}
            accessibilityLabel={jogo.disponivel ? `Abrir ${jogo.titulo}` : `${jogo.titulo}, em breve`}
          >
            <View style={styles.cartaoTextos}>
              <Text style={[styles.cartaoTitulo, !jogo.disponivel && styles.cartaoTituloEmBreve]}>{jogo.titulo}</Text>
              <Text style={[styles.cartaoDescricao, !jogo.disponivel && styles.cartaoDescricaoEmBreve]}>{jogo.descricao}</Text>
              {jogo.disponivel ? (
                <View style={styles.jogar}>
                  <Text style={styles.jogarTexto}>Jogar</Text>
                  <Ionicons name="chevron-forward" size={18} color={cor.fg("#FFF")} />
                </View>
              ) : (
                <View style={styles.emBreve}>
                  <Text style={styles.emBreveTexto}>Em breve</Text>
                </View>
              )}
            </View>
            {jogo.id === 'jardim' && (
              <View style={styles.ilustracao}>
                <PlantaSvg especie="girassol" estagio={3} tamanho={92} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <NavBar />
    </SafeAreaView>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  container: { flex: 1, backgroundColor: cor.bg('#E4F0F8') },
  conteudo: { padding: 20, paddingBottom: 130 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  titulo: { fontFamily: 'Montserrat-Bold', fontSize: 24, color: cor.fg('#1A1A1A') },
  subtitulo: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: cor.fg('#5A6B87'), marginTop: 6, marginBottom: 20 },
  cartao: { flexDirection: 'row', alignItems: 'center', borderRadius: 22, padding: 20, marginBottom: 14 },
  cartaoAtivo: { backgroundColor: cor.bg('#FA8231'), shadowColor: '#FA8231', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 5 },
  cartaoEmBreve: { backgroundColor: cor.bg('#FFF'), borderWidth: 1, borderColor: cor.bd('#D9E4FF') },
  cartaoTextos: { flex: 1 },
  cartaoTitulo: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: cor.fg('#FFF'), marginBottom: 6 },
  cartaoTituloEmBreve: { color: cor.fg('#5A6B87') },
  cartaoDescricao: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: cor.fg('#FFF'), lineHeight: 19 },
  cartaoDescricaoEmBreve: { color: cor.fg('#777') },
  jogar: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(0, 0, 0, 0.18)', borderRadius: 14, paddingVertical: 6, paddingLeft: 14, paddingRight: 8, marginTop: 12 },
  jogarTexto: { fontFamily: 'Montserrat-Bold', fontSize: 13, color: cor.fg('#FFF') },
  emBreve: { alignSelf: 'flex-start', backgroundColor: cor.bg('#EEF1F6'), borderRadius: 12, paddingVertical: 4, paddingHorizontal: 12, marginTop: 12 },
  emBreveTexto: { fontFamily: 'Montserrat-Bold', fontSize: 11, color: cor.fg('#5A6B87') },
  ilustracao: { width: 100, height: 100, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.28)', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
});
