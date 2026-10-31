import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import paleta from '../styles/Tema.js';
import SelectField from '../components/SelectField.js';
import { TEMAS_APP, IDIOMAS, MODALIDADES, TEMAS_INTERESSE } from '../constants/opcoes.js';

export default function Preferencias({ navigation }) {
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  // Estados locais para gerenciar as preferências selecionadas
  const [tema, setTema] = useState('Padrão do sistema');
  const [idioma, setIdioma] = useState('Português (Brasil)');
  const [modalidade, setModalidade] = useState('Online');
  const [interesses, setInteresses] = useState(['Burnout']);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#1A56DB" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Preferências</Text>
        </View>

        <View style={styles.divider} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <SelectField
            label="Tema do aplicativo"
            value={tema}
            options={TEMAS_APP}
            onChange={setTema}
          />

          <SelectField
            label="Idioma"
            value={idioma}
            options={IDIOMAS}
            onChange={setIdioma}
          />

          <SelectField
            label="Modalidade de atendimento preferida"
            title="Modalidade de atendimento"
            value={modalidade}
            options={MODALIDADES}
            onChange={setModalidade}
          />

          <SelectField
            label="Temas de interesse"
            value={interesses}
            options={TEMAS_INTERESSE}
            onChange={setInteresses}
            multiple
            placeholder="Selecione seus temas de interesse"
          />

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: paleta.cor.fundoCard, 
    padding: 20 
  },
  card: { 
    flex: 1, 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    overflow: 'hidden' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    paddingBottom: 10 
  },
  headerTitle: { 
    fontFamily: 'Montserrat-Bold', 
    fontSize: 20, 
    color: '#1A56DB', 
    marginLeft: 10 
  },
  divider: { 
    height: 2, 
    backgroundColor: '#1A56DB', 
    opacity: 0.5, 
    marginHorizontal: 20, 
    marginBottom: 20 
  },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 120 
  },
  inputContainer: { 
    marginBottom: 20 
  },
  label: { 
    fontFamily: 'Montserrat-Bold', 
    fontSize: 11, 
    color: '#1A56DB', 
    marginBottom: 5, 
    marginLeft: 5 
  },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#F0F4FF', 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    height: 45, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 2, 
    elevation: 2 
  },
  inputText: { 
    fontFamily: 'Montserrat-Regular', 
    fontSize: 13, 
    color: '#333' 
  }
});