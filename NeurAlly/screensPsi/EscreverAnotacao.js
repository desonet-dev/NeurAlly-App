import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView,
  TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import paleta from '../styles/Tema.js';
import { adicionarAnotacao } from '../services/anotacoesService.js';

export default function EscreverAnotacaoPsi({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [paciente, setPaciente] = useState('');
  const [texto, setTexto] = useState('');
  const [salvando, setSalvando] = useState(false);

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const handleSalvar = async () => {
    if (!titulo.trim() || !texto.trim()) {
      Alert.alert('Preencha os campos', 'Escreva um título e o conteúdo da anotação.');
      return;
    }

    setSalvando(true);
    try {
      await adicionarAnotacao({
        titulo: titulo.trim(),
        texto: texto.trim(),
        paciente: paciente.trim(),
      });
      navigation.goBack();
    } catch (erro) {
      console.warn('Erro ao salvar anotação:', erro);
      Alert.alert(
        'Não foi possível salvar',
        'Verifique sua conexão e a configuração do Firebase, e tente novamente.'
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <Text style={styles.pageTitle}>Nova anotação</Text>

          <TextInput
            style={styles.inputTitle}
            placeholder="Título da anotação"
            placeholderTextColor="#888"
            value={titulo}
            onChangeText={setTitulo}
            editable={!salvando}
          />

          <TextInput
            style={styles.inputTitle}
            placeholder="Paciente (opcional)"
            placeholderTextColor="#888"
            value={paciente}
            onChangeText={setPaciente}
            editable={!salvando}
          />

          <TextInput
            style={styles.inputBody}
            placeholder="Escreva sua anotação aqui..."
            placeholderTextColor="#888"
            multiline={true}
            textAlignVertical="top"
            value={texto}
            onChangeText={setTexto}
            editable={!salvando}
          />

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.submitButton, salvando && styles.submitButtonDisabled]}
              onPress={handleSalvar}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Salvar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={salvando}
            >
              <Ionicons name="close" size={30} color="#FFF" />
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: paleta.cor.fundo },
  scrollContent: { padding: 20, paddingBottom: 40 },
  pageTitle: { fontFamily: 'Montserrat-Bold', fontSize: 24, color: '#1A1A1A', marginBottom: 20 },
  inputTitle: { backgroundColor: '#FFF', borderRadius: 25, paddingHorizontal: 20, height: 50, fontSize: 14, fontFamily: 'Montserrat-Regular', marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  inputBody: { backgroundColor: '#FFF', borderRadius: 15, paddingHorizontal: 20, paddingTop: 15, height: 200, fontSize: 14, fontFamily: 'Montserrat-Regular', marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20 },
  submitButton: { backgroundColor: '#6292D6', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3, minWidth: 120, alignItems: 'center' },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontFamily: 'Montserrat-Bold' },
  cancelButton: { backgroundColor: '#FF8C42', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 }
});
