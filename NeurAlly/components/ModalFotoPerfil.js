import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

// Opções da foto de perfil quando já existe uma foto: escolher outra ou voltar para a imagem padrão.
export default function ModalFotoPerfil({ visivel, onFechar, onEscolher, onRemover }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="slide" transparent visible={!!visivel} onRequestClose={onFechar} statusBarTranslucent>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onFechar}>
        <View style={[styles.folha, { paddingBottom: 20 + insets.bottom }]}>
          <Text style={styles.titulo}>Foto de perfil</Text>

          <TouchableOpacity style={styles.opcao} onPress={onEscolher}>
            <Ionicons name="images-outline" size={22} color="#1A56DB" />
            <Text style={styles.opcaoTexto}>Escolher outra foto da galeria</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.opcao} onPress={onRemover}>
            <Ionicons name="trash-outline" size={22} color="#D64545" />
            <Text style={[styles.opcaoTexto, styles.opcaoPerigo]}>Remover foto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelar} onPress={onFechar}>
            <Text style={styles.cancelarTexto}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  folha: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  titulo: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1A1A1A', marginBottom: 12 },
  opcao: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4FF', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 10 },
  opcaoTexto: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: '#1A56DB', marginLeft: 12 },
  opcaoPerigo: { color: '#D64545' },
  cancelar: { alignItems: 'center', paddingVertical: 14, borderRadius: 14, backgroundColor: '#F2F4F8', marginTop: 4 },
  cancelarTexto: { fontFamily: 'Montserrat-Bold', fontSize: 14, color: '#5A6B87' },
});
