import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView,
  TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator
} from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { adicionarAnotacao, atualizarAnotacao } from '../services/anotacoesService.js';

import { useEstilos } from '../contexts/TemaContext.js';
export default function EscreverAnotacaoPsi({ navigation, route }) {
  const [styles, cor] = useEstilos(criarStyles);
  // Quando a tela recebe uma anotacao por parametro, estamos editando;
  // sem parametro, estamos criando uma nova.
  const anotacaoExistente = route?.params?.anotacao || null;
  const editando = Boolean(anotacaoExistente);

  const [titulo, setTitulo] = useState(anotacaoExistente?.titulo || '');
  const [paciente, setPaciente] = useState(anotacaoExistente?.paciente || '');
  const [texto, setTexto] = useState(anotacaoExistente?.texto || '');
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
      const dados = {
        titulo: titulo.trim(),
        texto: texto.trim(),
        paciente: paciente.trim(),
      };

      if (editando) {
        await atualizarAnotacao(anotacaoExistente.id, dados);
      } else {
        await adicionarAnotacao(dados);
      }
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <Text style={styles.pageTitle}>{editando ? 'Editar anotação' : 'Nova anotação'}</Text>

          <TextInput
            style={styles.inputTitle}
            placeholder="Título da anotação"
            placeholderTextColor={cor.fg("#888")}
            value={titulo}
            onChangeText={setTitulo}
            editable={!salvando}
          />

          <TextInput
            style={styles.inputTitle}
            placeholder="Paciente (opcional)"
            placeholderTextColor={cor.fg("#888")}
            value={paciente}
            onChangeText={setPaciente}
            editable={!salvando}
          />

          <TextInput
            style={styles.inputBody}
            placeholder="Escreva sua anotação aqui..."
            placeholderTextColor={cor.fg("#888")}
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
                <ActivityIndicator size="small" color={cor.fg("#FFF")} />
              ) : (
                <Text style={styles.submitButtonText}>Salvar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={salvando}
            >
              <Ionicons name="close" size={30} color={cor.fg("#FFF")} />
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  container: { flex: 1, backgroundColor: cor.bg('#E4F0F8') },
  scrollContent: { padding: 20, paddingBottom: 40 },
  pageTitle: { fontFamily: 'Montserrat-Bold', fontSize: 24, color: cor.fg('#1A1A1A'), marginBottom: 20 },
  inputTitle: { backgroundColor: cor.bg('#FFF'), borderRadius: 25, paddingHorizontal: 20, height: 50, fontSize: 14, fontFamily: 'Montserrat-Regular', marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  inputBody: { backgroundColor: cor.bg('#FFF'), borderRadius: 15, paddingHorizontal: 20, paddingTop: 15, height: 200, fontSize: 14, fontFamily: 'Montserrat-Regular', marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20 },
  submitButton: { backgroundColor: cor.bg('#6292D6'), paddingVertical: 15, paddingHorizontal: 40, borderRadius: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3, minWidth: 120, alignItems: 'center' },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: cor.fg('#FFF'), fontSize: 16, fontFamily: 'Montserrat-Bold' },
  cancelButton: { backgroundColor: cor.bg('#FF8C42'), width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 }
});
