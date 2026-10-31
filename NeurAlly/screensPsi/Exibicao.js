import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import paleta from '../styles/Tema.js';
import SelectField from '../components/SelectField.js';
import { ESPECIALIDADES, PUBLICO_ALVO } from '../constants/opcoes.js';

export default function ExibicaoPsi({ navigation }) {
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  const [especialidades, setEspecialidades] = useState([]);
  const [publicoAlvo, setPublicoAlvo] = useState([]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#1A56DB" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exibição</Text>
        </View>

        <View style={styles.divider} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Biografia</Text>
            <View style={[styles.inputWrapper, { height: 100 }]}>
              <TextInput 
                style={[styles.input, { textAlignVertical: 'top', paddingTop: 10 }]} 
                value="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam venenatis dui dignissim finibus dignissim. Aenean tempus nibh placerat nisl ultricies placerat. Praesent tempor nibh non eleifend euismod." 
                multiline
                editable={false}
              />
              <MaterialIcons name="edit" size={20} color="#000" />
            </View>
          </View>

          <SelectField
            label="Especialidades"
            value={especialidades}
            options={ESPECIALIDADES}
            onChange={setEspecialidades}
            multiple
            placeholder="Selecione suas especialidades"
          />
          <SelectField
            label="Público-alvo"
            value={publicoAlvo}
            options={PUBLICO_ALVO}
            onChange={setPublicoAlvo}
            multiple
            placeholder="Selecione o público atendido"
          />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Vídeo apresentativo</Text>
            <TouchableOpacity style={styles.uploadWrapper}>
              <Text style={styles.uploadText}>Inserir vídeo aqui</Text>
              <Ionicons name="push-outline" size={20} color="#000" />
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: paleta.cor.fundoCard, padding: 20 },
  card: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10 },
  headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#1A56DB', marginLeft: 10 },
  divider: { height: 2, backgroundColor: '#1A56DB', opacity: 0.5, marginHorizontal: 20, marginBottom: 20 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  inputContainer: { marginBottom: 20 },
  label: { fontFamily: 'Montserrat-Bold', fontSize: 11, color: '#1A56DB', marginBottom: 5, marginLeft: 5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F0F4FF', borderRadius: 12, paddingHorizontal: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  input: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#333', marginRight: 10 },
  inputText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#333' },
  uploadWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F0F4FF', borderRadius: 12, paddingHorizontal: 15, height: 45, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, borderWidth: 1, borderColor: '#E0E8FF' },
  uploadText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#888' }
});