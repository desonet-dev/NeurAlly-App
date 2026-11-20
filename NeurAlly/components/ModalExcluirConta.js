import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { contaUsaSenha, traduzErroFirebase } from '../services/authService.js';
import { excluirConta } from '../services/contaService.js';

import { useEstilos } from '../contexts/TemaContext.js';
// Janela de exclusão permanente da conta. Pede a senha (contas com e-mail/senha) para confirmar.
export default function ModalExcluirConta({ visivel, tipo, onFechar, onExcluida }) {
  const [styles, cor] = useEstilos(criarStyles);
  const insets = useSafeAreaInsets();
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    if (visivel) {
      setSenha('');
      setErro('');
      setExcluindo(false);
    }
  }, [visivel]);

  const usaSenha = visivel ? contaUsaSenha() : true;

  const confirmar = async () => {
    if (excluindo) return;
    if (usaSenha && !senha) return setErro('Digite sua senha para confirmar.');

    setErro('');
    setExcluindo(true);
    try {
      await excluirConta({ senha, tipo });
      onExcluida?.();
    } catch (e) {
      console.warn('Erro ao excluir a conta:', e);
      const codigo = e?.code || '';
      setErro(
        codigo === 'auth/invalid-credential' || codigo === 'auth/wrong-password'
          ? 'Senha incorreta.'
          : codigo === 'permission-denied'
          ? 'Sem permissão para apagar os dados. Atualize as regras do Firestore (arquivo firestore.rules do projeto).'
          : traduzErroFirebase(e)
      );
      setExcluindo(false);
    }
  };

  return (
    <Modal animationType="fade" transparent visible={!!visivel} onRequestClose={excluindo ? undefined : onFechar} statusBarTranslucent>
      <View style={[styles.overlay, { paddingTop: insets.top + 40 }]}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
          <View style={styles.container}>
            <View style={styles.icone}>
              <Ionicons name="trash-outline" size={30} color={cor.fg("#D64545")} />
            </View>
            <Text style={styles.titulo}>Excluir conta?</Text>
            <Text style={styles.mensagem}>
              Esta ação é permanente e não pode ser desfeita. Vamos apagar seu perfil, diário, anotações e triagem, e cancelar suas consultas futuras.
            </Text>

            {usaSenha ? (
              <View style={styles.campo}>
                <TextInput
                  style={styles.input}
                  value={senha}
                  onChangeText={(texto) => { setErro(''); setSenha(texto); }}
                  placeholder="Digite sua senha para confirmar"
                  placeholderTextColor={cor.fg("#999")}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            ) : (
              <Text style={styles.dica}>
                Sua conta usa o login com o Google. Por segurança, é preciso ter entrado há poucos minutos; se der erro, saia da conta, entre de novo com o Google e tente outra vez.
              </Text>
            )}

            {!!erro && (
              <View style={styles.erroBox} accessibilityRole="alert" accessibilityLiveRegion="polite">
                <Ionicons name="alert-circle" size={18} color={cor.fg("#D64545")} style={{ marginRight: 8 }} />
                <Text style={styles.erroTexto}>{erro}</Text>
              </View>
            )}

            <TouchableOpacity style={[styles.botaoPerigo, excluindo && { opacity: 0.7 }]} onPress={confirmar} disabled={excluindo}>
              {excluindo ? <ActivityIndicator size="small" color={cor.fg("#FFF")} /> : <Text style={styles.botaoTexto}>Excluir minha conta</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.botaoSecundario} onPress={onFechar} disabled={excluindo}>
              <Text style={styles.botaoSecundarioTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const criarStyles = (cor) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  container: { backgroundColor: cor.bg('#FFF'), borderRadius: 20, padding: 20, alignItems: 'center' },
  icone: { width: 60, height: 60, borderRadius: 30, backgroundColor: cor.bg('#FDEDED'), justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  titulo: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: cor.fg('#1A1A1A'), marginBottom: 8 },
  mensagem: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: cor.fg('#5A6B87'), textAlign: 'center', marginBottom: 16 },
  campo: { alignSelf: 'stretch', backgroundColor: cor.bg('#F0F4FF'), borderRadius: 12, paddingHorizontal: 15, height: 46, justifyContent: 'center', marginBottom: 14 },
  input: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: cor.fg('#333') },
  dica: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#5A6B87'), textAlign: 'center', marginBottom: 14 },
  erroBox: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', backgroundColor: cor.bg('#FDEDED'), borderWidth: 1, borderColor: cor.bd('#F5C2C2'), borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 14 },
  erroTexto: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 12, color: cor.fg('#B03030') },
  botaoPerigo: { alignSelf: 'stretch', backgroundColor: cor.bg('#D64545'), borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  botaoTexto: { fontFamily: 'Montserrat-Bold', color: cor.fg('#FFF'), fontSize: 14 },
  botaoSecundario: { alignSelf: 'stretch', backgroundColor: cor.bg('#F2F4F8'), borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  botaoSecundarioTexto: { fontFamily: 'Montserrat-Bold', color: cor.fg('#5A6B87'), fontSize: 14 },
});
