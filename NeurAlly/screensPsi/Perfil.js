import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import NavBarPsi from '../components/navBarPsi.js';
import { useAuth } from '../contexts/AuthContext.js';
import useFotoPerfil from '../hooks/useFotoPerfil.js';
import ModalFotoPerfil from '../components/ModalFotoPerfil.js';
import ModalConfirmacao from '../components/ModalConfirmacao.js';

import { useEstilos } from '../contexts/TemaContext.js';
export default function PerfilPsi({ navigation }) {
  const [styles, cor] = useEstilos(criarStyles);
  const { perfil, sair } = useAuth();
  const [popup, setPopup] = React.useState(false);
  // Foto de perfil: o lápis abre a galeria (se já houver foto, antes oferece trocar ou remover).
  const { foto, origem, escolher, remover, salvando: salvandoFoto, erro: erroFoto, limparErro } = useFotoPerfil();
  const [opcoesFoto, setOpcoesFoto] = React.useState(false);
  const aoTocarNoLapis = () => (foto ? setOpcoesFoto(true) : escolher());
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../styles/fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('../styles/fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  async function handleSair() {
    try {
      await sair();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      console.log("Olá Alícia")
    } catch (erro) {
      console.log('Ocorreu um erro, não foi possível sair.')
      console.error(erro)
    }
  };

  const MenuItem = ({ title, icon, onPress, iconFamily = 'Ionicons' }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuItemText}>{title}</Text>
      {iconFamily === 'Ionicons' ? (
        <Ionicons name={icon} size={20} color={cor.fg("#1A56DB")} />
      ) : (
        <MaterialIcons name={icon} size={20} color={cor.fg("#1A56DB")} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>


        {popup && (
          <Modal
          animationType="fade"
          transparent={true}
          visible={popup}
          onRequestClose={() => setPopup(false)}
          >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              
              <View style={styles.modalIconContainer}>
                <Ionicons name="log-out-outline" size={32} color={cor.fg("#D64545")} />
              </View>

              <Text style={styles.modalTitle}>Sair da conta</Text>
              <Text style={styles.modalMessage}>Tem certeza que deseja sair do seu perfil?</Text>
              
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity style={styles.modalCancelButton} onPress={() => setPopup(false)}>
                  <Text style={styles.modalCancelButtonText}>Não, cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalConfirmButton} onPress={handleSair}>
                  <Text style={styles.modalConfirmButtonText}>Sim, sair</Text>
                </TouchableOpacity>
              </View>

              </View>
            </View>
          </Modal>
        )}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.avatarContainer}>
            <Image source={origem} style={styles.avatar} />
            {salvandoFoto && (
              <View style={styles.avatarCarregando}>
                <ActivityIndicator color="#FFF" />
              </View>
            )}
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={aoTocarNoLapis}
              disabled={salvandoFoto}
              accessibilityLabel="Alterar foto de perfil"
            >
              <MaterialIcons name="edit" size={18} color={cor.fg("#FFF")} />
            </TouchableOpacity>
          </View>

          <Text style={styles.nomeUsuario}>{perfil?.nome || 'Psicólogo(a)'}</Text>
          {!!perfil?.crp && <Text style={styles.emailUsuario}>CRP {perfil.crp}</Text>}

          <View style={styles.divider} />

          <MenuItem title="Configurações" icon="settings-sharp" onPress={() => navigation.navigate('PerfilConfig')} />
          <MenuItem title="Dados pessoais" icon="info" iconFamily="MaterialIcons" onPress={() => navigation.navigate('PerfilDadosPsi')} />
          <MenuItem title="Disponibilidade" icon="time" onPress={() => navigation.navigate('DisponibilidadePsi')} />
          <MenuItem title="Preferências" icon="options" onPress={() => navigation.navigate('PerfilPref')} />
          <MenuItem title="Dados de exibição" icon="eye" onPress={() => navigation.navigate('ExibicaoPsi')} />

          <View style={styles.spacer} />

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ConsultasPrevias')}>
            <Text style={styles.actionButtonText}>Consultas prévias</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={()=>setPopup(true)}>
            <Ionicons name="log-out-outline" size={18} color={cor.fg("#D64545")} style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>Sair da conta</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
      <ModalFotoPerfil
        visivel={opcoesFoto}
        onFechar={() => setOpcoesFoto(false)}
        onEscolher={() => { setOpcoesFoto(false); escolher(); }}
        onRemover={() => { setOpcoesFoto(false); remover(); }}
      />

      <ModalConfirmacao
        visivel={!!erroFoto}
        tipo="perigo"
        titulo="Foto de perfil"
        mensagem={erroFoto}
        onConfirmar={limparErro}
      />

      <NavBarPsi />
    </SafeAreaView>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: cor.bg('#9EBDF0'), 
    padding: 20 
  },
  card: { 
    flex: 1, 
    backgroundColor: cor.bg('#FFF'), 
    borderRadius: 20, 
    overflow: 'hidden', 
    paddingBottom: 20 
  },
  scrollContent: { 
    padding: 20, 
    paddingBottom: 140, 
    alignItems: 'center' 
  },
  avatarContainer: { 
    position: 'relative', 
    marginBottom: 20, 
    marginTop: 20 
  },
  avatar: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: cor.bg('#E4F0F8') 
  },
  editAvatarButton: { 
    position: 'absolute', 
    bottom: 0, 
    right: 10, 
    backgroundColor: cor.bg('#000'), 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: cor.bd('#FFF') 
  },
  divider: { 
    width: '100%', 
    height: 2, 
    backgroundColor: cor.bg('#1A56DB'), 
    opacity: 0.5, 
    marginBottom: 20 
  },
  nomeUsuario: { 
    fontFamily: 'Montserrat-Bold', 
    fontSize: 18, 
    color: cor.fg('#1A1A1A'), 
    marginBottom: 2 
  },
  emailUsuario: { 
    fontFamily: 'Montserrat-Regular', 
    fontSize: 13, 
    color: cor.fg('#5A6B87'), 
    marginBottom: 15 
  },
  menuItem: { 
    width: '100%', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: cor.bg('#F0F4FF'), 
    paddingVertical: 15, 
    paddingHorizontal: 20, 
    borderRadius: 15, 
    marginBottom: 12 
  },
  menuItemText: { 
    fontFamily: 'Montserrat-Bold', 
    color: cor.fg('#1A56DB'), 
    fontSize: 14 
  },
  spacer: { 
    height: 40 
  },
  actionButton: { 
    width: '100%', 
    backgroundColor: cor.bg('#F0F4FF'), 
    paddingVertical: 15, 
    paddingHorizontal: 20, 
    borderRadius: 15, 
    marginBottom: 12, 
    alignItems: 'center' 
  },
  actionButtonText: { 
    fontFamily: 'Montserrat-Bold', 
    color: cor.fg('#1A56DB'), 
    fontSize: 14 
  },
  avatarCarregando: { position: 'absolute', top: 0, left: 0, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(0, 0, 0, 0.45)', alignItems: 'center', justifyContent: 'center' },
  logoutButton: { 
    width: '100%', 
    flexDirection: 'row', 
    backgroundColor: cor.bg('#FDEDED'), 
    paddingVertical: 15, 
    paddingHorizontal: 20, 
    borderRadius: 15, 
    marginTop: 8, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  logoutButtonText: { 
    fontFamily: 'Montserrat-Bold', 
    color: cor.fg('#D64545'), 
    fontSize: 14 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: cor.bg('#FFF'),
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: cor.bg('#FDEDED'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    color: cor.fg('#1A1A1A'),
    marginBottom: 8,
  },
  modalMessage: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: cor.fg('#5A6B87'),
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: cor.bg('#F0F4FF'),
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontFamily: 'Montserrat-Bold',
    color: cor.fg('#1A56DB'),
    fontSize: 14,
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: cor.bg('#D64545'),
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontFamily: 'Montserrat-Bold',
    color: cor.fg('#FFF'),
    fontSize: 14,
  }
});