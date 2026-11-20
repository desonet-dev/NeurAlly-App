import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  SafeAreaView, Modal, ActivityIndicator 
} from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { agendarConsulta } from '../services/consultasService.js';
import { formatarDataBR } from '../utils/datas.js';
import { useAuth } from '../contexts/AuthContext.js';

import { useEstilos } from '../contexts/TemaContext.js';
export default function Pagamento({ navigation, route }) {
  const [styles, cor] = useEstilos(criarStyles);
  // Dados escolhidos na tela de agendamento
  const { profissional, data, horario, modalidade } = route?.params || {};
  const { perfil } = useAuth();

  const [metodo, setMetodo] = useState('cartao');
  const [agendado, setAgendado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const irParaHome = () => {
    setAgendado(false);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const confirmarPagamento = async () => {
    if (salvando) return;

    if (!profissional?.nome || !data || !horario) {
      setErro('Escolha o profissional, o dia e o horário antes de confirmar.');
      return;
    }

    setErro('');
    setSalvando(true);
    try {
      await agendarConsulta({
        clienteNome: perfil?.nome || '',
        profissionalId: profissional.uid || null,
        profissionalNome: profissional.nome,
        profissionalEsp: profissional.esp || '',
        data,
        horario,
        modalidade: modalidade || 'presencial',
        metodoPagamento: metodo,
        valor: 20,
      });
      setAgendado(true);
    } catch (e) {
      console.warn('Erro ao agendar consulta:', e);
      setErro(
        e?.code === 'consulta/horario-ocupado'
          ? 'Esse horário acabou de ser reservado por outra pessoa. Volte e escolha outro horário.'
          : e?.code === 'permission-denied'
          ? 'Sem permissão para salvar a consulta. Verifique as regras do Firestore para a coleção consultas.'
          : 'Não foi possível agendar a consulta. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setSalvando(false);
    }
  };

  const renderRadio = (isSelected) => (
    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
      {isSelected && <View style={styles.radioInner} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={cor.fg("#1A56DB")} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pagamento</Text>
        </View>

        <View style={styles.doctorCard}>
          <View style={styles.doctorAvatarContainer}>
            <Ionicons name="person" size={32} color={cor.fg("#6292D6")} />
          </View>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{profissional?.nome || 'Profissional'}</Text>
            {!!profissional?.esp && <Text style={styles.doctorSpecialty}>{profissional.esp}</Text>}
            {!!data && !!horario && (
              <Text style={styles.doctorSpecialty}>
                {formatarDataBR(data)} às {horario} · {modalidade === 'online' ? 'On-line' : 'Presencial'}
              </Text>
            )}
          </View>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>R$20,00</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.paymentOption, metodo === 'pix' && styles.paymentOptionActive]}
          onPress={() => setMetodo('pix')}
        >
          <View style={styles.paymentOptionLeft}>
            <MaterialCommunityIcons name="qrcode" size={24} color={cor.fg("#1A56DB")} style={styles.paymentIcon} />
            <Text style={styles.paymentOptionText}>Pix</Text>
          </View>
          {renderRadio(metodo === 'pix')}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.paymentOption, metodo === 'cartao' && styles.paymentOptionActive]}
          onPress={() => setMetodo('cartao')}
        >
          <View style={styles.paymentOptionLeft}>
            <Ionicons name="card-outline" size={24} color={cor.fg("#1A56DB")} style={styles.paymentIcon} />
            <Text style={styles.paymentOptionText}>Cartão</Text>
          </View>
          {renderRadio(metodo === 'cartao')}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.paymentOption, metodo === 'google' && styles.paymentOptionActive]}
          onPress={() => setMetodo('google')}
        >
          <View style={styles.paymentOptionLeft}>
            <Ionicons name="logo-google" size={24} color={cor.fg("#1A56DB")} style={styles.paymentIcon} />
            <Text style={styles.paymentOptionText}>Google Pay</Text>
          </View>
          {renderRadio(metodo === 'google')}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.paymentOption, metodo === 'apple' && styles.paymentOptionActive]}
          onPress={() => setMetodo('apple')}
        >
          <View style={styles.paymentOptionLeft}>
            <Ionicons name="logo-apple" size={24} color={cor.fg("#1A56DB")} style={styles.paymentIcon} />
            <Text style={styles.paymentOptionText}>Apple Pay</Text>
          </View>
          {renderRadio(metodo === 'apple')}
        </TouchableOpacity>

        {!!erro && (
          <View style={styles.avisoBox} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Ionicons name="alert-circle" size={18} color={cor.fg("#D64545")} style={{ marginRight: 8 }} />
            <Text style={styles.avisoTexto}>{erro}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.payButton, salvando && { opacity: 0.7 }]}
          onPress={confirmarPagamento}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator size="small" color={cor.fg("#FFF")} />
          ) : (
            <Text style={styles.payButtonText}>Confirmar</Text>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* Modal de confirmação do agendamento */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={agendado}
        onRequestClose={irParaHome}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="checkmark-circle" size={40} color={cor.fg("#2E9E5B")} />
            </View>
            <Text style={styles.modalTitle}>Consulta agendada!</Text>
            <Text style={styles.modalMessage}>
              Sua consulta foi agendada com sucesso. Você receberá os detalhes na sua agenda.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={irParaHome}>
              <Text style={styles.modalButtonText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  container: { flex: 1, backgroundColor: cor.bg('#E4F0F8') },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: cor.fg('#1A56DB'), marginLeft: 10 },
  doctorCard: { backgroundColor: cor.bg('#FFF'), borderRadius: 15, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  doctorAvatarContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: cor.bg('#E3F2FD'), justifyContent: 'center', alignItems: 'center' },
  doctorInfo: { flex: 1, marginLeft: 15 },
  doctorName: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: cor.fg('#1A56DB') },
  doctorSpecialty: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#666') },
  priceBadge: { backgroundColor: cor.bg('#1A56DB'), paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  priceText: { fontFamily: 'Montserrat-Bold', fontSize: 12, color: cor.fg('#FFF') },
  paymentOption: { backgroundColor: cor.bg('#FFF'), borderRadius: 15, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3, borderWidth: 1, borderColor: 'transparent' },
  paymentOptionActive: { borderColor: cor.bd('#1A56DB') },
  paymentOptionLeft: { flexDirection: 'row', alignItems: 'center' },
  paymentIcon: { marginRight: 15 },
  paymentOptionText: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: cor.fg('#333') },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: cor.bd('#B0C4DE'), justifyContent: 'center', alignItems: 'center' },
  radioOuterSelected: { borderColor: cor.bd('#1A56DB') },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: cor.bg('#1A56DB') },
  avisoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: cor.bg('#FDEDED'), borderWidth: 1, borderColor: cor.bd('#F5C2C2'), borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginTop: 5 },
  avisoTexto: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#B03030') },
  payButton: { backgroundColor: cor.bg('#6292D6'), borderRadius: 25, paddingVertical: 18, alignItems: 'center', marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  payButtonText: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: cor.fg('#FFF') },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '100%', backgroundColor: cor.bg('#FFF'), borderRadius: 20, padding: 24, alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  modalIconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: cor.bg('#E6F6EC'), justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: cor.fg('#1A1A1A'), marginBottom: 8 },
  modalMessage: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: cor.fg('#5A6B87'), textAlign: 'center', marginBottom: 24 },
  modalButton: { width: '100%', backgroundColor: cor.bg('#1A56DB'), paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalButtonText: { fontFamily: 'Montserrat-Bold', color: cor.fg('#FFF'), fontSize: 14 }
});