import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../contexts/AuthContext.js';
import ModalAlterarSenha from '../components/ModalAlterarSenha.js';
import ModalExcluirConta from '../components/ModalExcluirConta.js';
import ModalConfirmacao from '../components/ModalConfirmacao.js';

import { useEstilos } from '../contexts/TemaContext.js';
// Tela de configurações, usada tanto pelo cliente quanto pelo psicólogo.
export default function PerfilConfig({ navigation }) {
  const [styles, cor] = useEstilos(criarStyles);
  const { perfil } = useAuth();
  const [senhaAberta, setSenhaAberta] = useState(false);
  const [excluirAberto, setExcluirAberto] = useState(false);
  const [doisEtapasAberto, setDoisEtapasAberto] = useState(false);
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const ConfigButton = ({ title, onPress }) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  // Depois de excluir a conta não há mais sessão: volta para o login.
  const contaExcluida = () => {
    setExcluirAberto(false);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={cor.fg("#1A56DB")} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configurações</Text>
        </View>

        <View style={styles.divider} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <ConfigButton title="Alterar senha" onPress={() => setSenhaAberta(true)} />
          <ConfigButton title="Autenticação em 2 etapas" onPress={() => setDoisEtapasAberto(true)} />
          <ConfigButton title="Termos de uso" onPress={() => navigation.navigate('DocumentoLegal', { tipo: 'termos' })} />
          <ConfigButton title="Política de privacidade" onPress={() => navigation.navigate('DocumentoLegal', { tipo: 'privacidade' })} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.deleteButton} onPress={() => setExcluirAberto(true)}>
            <Text style={styles.deleteButtonText}>Excluir conta</Text>
            <Ionicons name="trash-outline" size={20} color={cor.fg("#1A56DB")} />
          </TouchableOpacity>
        </View>
      </View>

      <ModalAlterarSenha visivel={senhaAberta} onFechar={() => setSenhaAberta(false)} />

      <ModalExcluirConta
        visivel={excluirAberto}
        tipo={perfil?.tipo}
        onFechar={() => setExcluirAberto(false)}
        onExcluida={contaExcluida}
      />

      <ModalConfirmacao
        visivel={doisEtapasAberto}
        tipo="info"
        titulo="Em breve"
        mensagem="A autenticação em 2 etapas ainda está em desenvolvimento e será liberada em uma próxima atualização."
        onConfirmar={() => setDoisEtapasAberto(false)}
      />
    </SafeAreaView>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  container: { flex: 1, backgroundColor: cor.bg('#9EBDF0'), padding: 20 },
  card: { flex: 1, backgroundColor: cor.bg('#FFF'), borderRadius: 20, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10 },
  headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: cor.fg('#1A56DB'), marginLeft: 10 },
  divider: { height: 2, backgroundColor: cor.bg('#1A56DB'), opacity: 0.5, marginHorizontal: 20, marginBottom: 20 },
  scrollContent: { paddingHorizontal: 20 },
  button: { width: '100%', backgroundColor: cor.bg('#F0F4FF'), paddingVertical: 15, paddingHorizontal: 20, borderRadius: 15, marginBottom: 15, alignItems: 'flex-start' },
  buttonText: { fontFamily: 'Montserrat-Bold', color: cor.fg('#1A56DB'), fontSize: 14 },
  footer: { padding: 20, paddingBottom: 30 },
  deleteButton: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: cor.bg('#F0F4FF'), paddingVertical: 15, paddingHorizontal: 20, borderRadius: 15, borderWidth: 1, borderColor: cor.bd('#D9E4FF') },
  deleteButtonText: { fontFamily: 'Montserrat-Bold', color: cor.fg('#1A56DB'), fontSize: 14 }
});