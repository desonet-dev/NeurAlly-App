import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// Janela de confirmação/aviso que funciona igual no celular e na web (Alert.alert não funciona
// com vários botões na web).
//  - Com `onCancelar`: mostra dois botões (cancelar + confirmar).
//  - Sem `onCancelar`: mostra só o botão de confirmar (aviso simples).
//  - tipo: 'sucesso' | 'perigo' | 'info' muda o ícone e a cor do botão principal.
const TIPOS = {
  sucesso: { icone: 'checkmark-circle', cor: '#2E9E5B', fundo: '#E6F6EC', botao: '#1A56DB' },
  perigo: { icone: 'alert-circle', cor: '#D64545', fundo: '#FDEDED', botao: '#D64545' },
  info: { icone: 'information-circle', cor: '#1A56DB', fundo: '#E3F2FD', botao: '#1A56DB' },
};

export default function ModalConfirmacao({
  visivel,
  tipo = 'info',
  titulo,
  mensagem,
  textoConfirmar = 'Ok',
  textoCancelar = 'Voltar',
  onConfirmar,
  onCancelar,
  carregando = false,
}) {
  const estilo = TIPOS[tipo] || TIPOS.info;

  return (
    <Modal animationType="fade" transparent visible={!!visivel} onRequestClose={onCancelar || onConfirmar}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.icone, { backgroundColor: estilo.fundo }]}>
            <Ionicons name={estilo.icone} size={40} color={estilo.cor} />
          </View>
          <Text style={styles.titulo}>{titulo}</Text>
          {!!mensagem && <Text style={styles.mensagem}>{mensagem}</Text>}

          <TouchableOpacity
            style={[styles.botao, { backgroundColor: estilo.botao }, carregando && { opacity: 0.7 }]}
            onPress={onConfirmar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.botaoTexto}>{textoConfirmar}</Text>
            )}
          </TouchableOpacity>

          {!!onCancelar && (
            <TouchableOpacity style={styles.botaoSecundario} onPress={onCancelar} disabled={carregando}>
              <Text style={styles.botaoSecundarioTexto}>{textoCancelar}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { width: '100%', maxWidth: 420, backgroundColor: '#FFF', borderRadius: 20, padding: 24, alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  icone: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  titulo: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
  mensagem: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#5A6B87', textAlign: 'center', marginBottom: 24 },
  botao: { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  botaoTexto: { fontFamily: 'Montserrat-Bold', color: '#FFF', fontSize: 14 },
  botaoSecundario: { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8, backgroundColor: '#F2F4F8' },
  botaoSecundarioTexto: { fontFamily: 'Montserrat-Bold', color: '#5A6B87', fontSize: 14 },
});
