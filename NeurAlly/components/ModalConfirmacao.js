import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useEstilos } from '../contexts/TemaContext.js';
// Janela de confirmação/aviso que funciona igual no celular e na web (Alert.alert não funciona
// com vários botões na web).
//  - Com `onCancelar`: mostra dois botões (cancelar + confirmar).
//  - Sem `onCancelar`: mostra só o botão de confirmar (aviso simples).
//  - tipo: 'sucesso' | 'perigo' | 'info' muda o ícone e a cor do botão principal.
const TIPOS = (cor) => ({
  sucesso: { icone: 'checkmark-circle', corIcone: cor.fg('#2E9E5B'), fundo: cor.bg('#E6F6EC'), botao: cor.bg('#1A56DB') },
  perigo: { icone: 'alert-circle', corIcone: cor.fg('#D64545'), fundo: cor.bg('#FDEDED'), botao: cor.bg('#D64545') },
  info: { icone: 'information-circle', corIcone: cor.fg('#1A56DB'), fundo: cor.bg('#E3F2FD'), botao: cor.bg('#1A56DB') },
});

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
  const [styles, cor] = useEstilos(criarStyles);
  const tipos = TIPOS(cor);
  const estilo = tipos[tipo] || tipos.info;

  return (
    <Modal animationType="fade" transparent visible={!!visivel} onRequestClose={onCancelar || onConfirmar}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.icone, { backgroundColor: estilo.fundo }]}>
            <Ionicons name={estilo.icone} size={40} color={estilo.corIcone} />
          </View>
          <Text style={styles.titulo}>{titulo}</Text>
          {!!mensagem && <Text style={styles.mensagem}>{mensagem}</Text>}

          <TouchableOpacity
            style={[styles.botao, { backgroundColor: estilo.botao }, carregando && { opacity: 0.7 }]}
            onPress={onConfirmar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator size="small" color={cor.fg("#FFF")} />
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

const criarStyles = (cor) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { width: '100%', maxWidth: 420, backgroundColor: cor.bg('#FFF'), borderRadius: 20, padding: 24, alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  icone: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  titulo: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: cor.fg('#1A1A1A'), marginBottom: 8, textAlign: 'center' },
  mensagem: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: cor.fg('#5A6B87'), textAlign: 'center', marginBottom: 24 },
  botao: { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  botaoTexto: { fontFamily: 'Montserrat-Bold', color: cor.fg('#FFF'), fontSize: 14 },
  botaoSecundario: { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8, backgroundColor: cor.bg('#F2F4F8') },
  botaoSecundarioTexto: { fontFamily: 'Montserrat-Bold', color: cor.fg('#5A6B87'), fontSize: 14 },
});
