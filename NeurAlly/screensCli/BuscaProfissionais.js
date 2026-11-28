import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import NavBar from '../components/navBarCli.js';
import { filtrarProfissionais } from '../services/profissionaisService.js';
import useProfissionais from '../hooks/useProfissionais.js';

import { useEstilos } from '../contexts/TemaContext.js';
import { campoWeb } from '../styles/campos.js';
export default function BuscaProfissionais({ navigation }) {
  const [styles, cor] = useEstilos(criarStyles);
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  // Psicólogos reais (contas cadastradas como psicólogo). Se não houver nenhum, ficam os exemplos.
  const { profissionais, carregando, erro, recarregar } = useProfissionais();
  const [busca, setBusca] = useState('');
  const filtrados = useMemo(() => filtrarProfissionais(profissionais, busca), [profissionais, busca]);

  if (!fontsLoaded) return null;

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.nome}</Text>
        {!!item.exp && <Text style={styles.cardText}>{item.exp}</Text>}
        {!!item.crp && <Text style={styles.cardText}>{item.crp}</Text>}
        <Text style={styles.cardTextBold}>{item.esp}</Text>
      </View>
      <View style={styles.cardRight}>
        <Image source={item.foto ? { uri: item.foto } : item.img || require('../assets/perfil.png')} style={styles.avatar} />
        {/* Navega para a Tela 3 passando os dados */}
        <TouchableOpacity 
          style={styles.conhecerButton}
          onPress={() => navigation.navigate('PerfilProfissional', { profissional: item })}
        >
          <Text style={styles.conhecerText}>Conhecer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={cor.fg("#999")} style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Procure por um profissional"
          placeholderTextColor={cor.fg("#999")}
          value={busca}
          onChangeText={setBusca}
          autoCorrect={false}
          returnKeyType="search"
        />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Limpar busca">
            <Ionicons name="close-circle" size={20} color={cor.fg("#999")} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtrados}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator style={styles.vazio} color={cor.fg("#6292D6")} />
          ) : erro ? (
            <View style={styles.vazio}>
              <Text style={styles.vazioTexto}>Não foi possível carregar os profissionais. Verifique sua conexão.</Text>
              <TouchableOpacity onPress={recarregar}>
                <Text style={styles.vazioLink}>Tentar de novo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={[styles.vazio, styles.vazioTexto]}>
              {busca.trim()
                ? `Nenhum profissional encontrado para "${busca.trim()}".`
                : 'Ainda não há psicólogos cadastrados. Assim que um psicólogo criar a conta, ele aparece aqui.'}
            </Text>
          )
        }
      />
      <NavBar />
    </SafeAreaView>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  container: { flex: 1, backgroundColor: cor.bg('#E4F0F8') },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: cor.bg('#FFF'), margin: 20,
    borderRadius: 12, paddingHorizontal: 15, height: 50,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 15, color: cor.fg('#333'), ...campoWeb(cor) },
  listContent: { paddingHorizontal: 20, paddingBottom: 130 },
  card: {
    backgroundColor: cor.bg('#FFF'), borderRadius: 16, padding: 18, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardName: { fontSize: 16, fontFamily: 'Montserrat-Bold', color: cor.fg('#1A1A1A'), marginBottom: 6 },
  cardText: { fontSize: 11, fontFamily: 'Montserrat-Regular', color: cor.fg('#333'), marginBottom: 2 },
  cardTextBold: { fontSize: 11, fontFamily: 'Montserrat-Bold', color: cor.fg('#333'), marginTop: 2 },
  cardRight: { alignItems: 'center', justifyContent: 'space-between', paddingLeft: 10 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: cor.bg('#EEE'), marginBottom: 10 },
  conhecerButton: { backgroundColor: cor.bg('#FF8C42'), paddingVertical: 6, paddingHorizontal: 15, borderRadius: 6 },
  vazio: { marginTop: 40 },
  vazioLink: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: cor.fg('#1A56DB'), textAlign: 'center', marginTop: 12 },
  vazioTexto: { textAlign: 'center', fontFamily: 'Montserrat-Regular', fontSize: 14, color: cor.fg('#5A6B87') },
  conhecerText: { color: cor.fg('#FFF'), fontFamily: 'Montserrat-Bold', fontSize: 12 },
});