import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import NavBar from '../components/navBarCli.js';
import paleta from '../styles/Tema.js';

export default function BuscaProfissionais({ navigation }) {
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  const profissionais = [
    { id: '1', nome: 'João Mendonça', exp: '25 anos de atuação', crp: 'CRP XX/00000', esp: 'Especialista em Neuropsicologia', img: require('../assets/Anderson.png') },
    { id: '2', nome: 'Caroline de Jesus', exp: '25 anos de atuação', crp: 'CRP XX/00000', esp: 'Especialista em Neuropsicologia', img: require('../assets/Anderson.png') },
    { id: '3', nome: 'Carla Andrade', exp: '25 anos de atuação', crp: 'CRP XX/00000', esp: 'Especialista em Neuropsicologia', img: require('../assets/Anderson.png') },
  ];

  if (!fontsLoaded) return null;

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.nome}</Text>
        <Text style={styles.cardText}>{item.exp}</Text>
        <Text style={styles.cardText}>{item.crp}</Text>
        <Text style={styles.cardTextBold}>{item.esp}</Text>
      </View>
      <View style={styles.cardRight}>
        <Image source={item.img} style={styles.avatar} />
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
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Procure por um profissional"
          placeholderTextColor="#999"
        />
      </View>

      <FlatList
        data={profissionais}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      />
      <NavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: paleta.cor.fundo },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', margin: 20,
    borderRadius: 12, paddingHorizontal: 15, height: 50,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 15 },
  listContent: { paddingHorizontal: 20, paddingBottom: 130 },
  card: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardName: { fontSize: 16, fontFamily: 'Montserrat-Bold', color: '#1A1A1A', marginBottom: 6 },
  cardText: { fontSize: 11, fontFamily: 'Montserrat-Regular', color: '#333', marginBottom: 2 },
  cardTextBold: { fontSize: 11, fontFamily: 'Montserrat-Bold', color: '#333', marginTop: 2 },
  cardRight: { alignItems: 'center', justifyContent: 'space-between', paddingLeft: 10 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EEE', marginBottom: 10 },
  conhecerButton: { backgroundColor: '#FF8C42', paddingVertical: 6, paddingHorizontal: 15, borderRadius: 6 },
  conhecerText: { color: '#FFF', fontFamily: 'Montserrat-Bold', fontSize: 12 },
});